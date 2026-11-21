import type Stripe from "stripe";
import { json, serviceClient } from "../../../../lib/server";
import { appOrigin, appStatus, stripe } from "../../../../lib/stripe";
import { sendPlanActive, type Interval } from "../../../../lib/planEmail";

export const runtime = "nodejs";
export const preferredRegion = ["fra1"];

/**
 * Webhook Stripe → profiles.subscription_status (pendant web de /api/revenuecat).
 * À la confirmation d'un achat, envoie aussi l'e-mail « Votre plan est actif » (lib/planEmail.ts).
 * Dans Stripe : Développeurs → Webhooks → ajouter https://<site>/api/stripe/webhook avec les événements
 *   checkout.session.completed, customer.subscription.created, customer.subscription.updated, customer.subscription.deleted
 * puis copier le « secret de signature » (whsec_…) dans STRIPE_WEBHOOK_SECRET.
 * La signature est vérifiée sur le corps brut : un appel qui ne vient pas de Stripe est rejeté.
 */
export async function POST(req: Request) {
  const s = stripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sb = serviceClient();
  if (!s || !secret || !sb) return json({ error: "not_configured" }, 503);

  const signature = req.headers.get("stripe-signature");
  if (!signature) return json({ error: "unauthorized" }, 401);
  const raw = await req.text();
  let event: Stripe.Event;
  try { event = await s.webhooks.constructEventAsync(raw, signature, secret); }
  catch { return json({ error: "bad_signature" }, 400); }

  const idOf = (v: string | { id: string } | null | undefined) => (typeof v === "string" ? v : v?.id ?? null);

  /** Applique l'état d'un abonnement Stripe au profil de son propriétaire. */
  const apply = async (sub: Stripe.Subscription, uidHint?: string | null) => {
    const customerId = idOf(sub.customer);
    let uid = uidHint ?? sub.metadata?.user_id ?? null;
    if (!uid && customerId) {
      const { data } = await sb.from("profiles").select("id").eq("stripe_customer_id", customerId).maybeSingle();
      uid = data?.id ?? null;
    }
    if (!uid) return "unknown_user";

    let status: string | null = appStatus(sub.status);
    const patch: Record<string, unknown> = {};
    if (customerId) patch.stripe_customer_id = customerId;
    if (status === "expired") {
      // Un autre abonnement du même client est peut-être encore actif (changement d'offre) : on ne ferme pas l'accès à tort.
      if (customerId) {
        const others = await s.subscriptions.list({ customer: customerId, status: "all", limit: 10 });
        const live = others.data.find((x) => x.id !== sub.id && (x.status === "active" || x.status === "trialing" || x.status === "past_due"));
        if (live) status = appStatus(live.status);
      }
      // Un fondateur retrouve son statut de fondateur à la fin d'un abonnement payant.
      if (status === "expired") {
        const { data } = await sb.from("profiles").select("founder_code").eq("id", uid).maybeSingle();
        if (data?.founder_code) status = "founder";
      }
    }
    if (status) patch.subscription_status = status;
    if (Object.keys(patch).length) {
      const { error } = await sb.from("profiles").update(patch).eq("id", uid);
      if (error) throw new Error(error.message);
    }
    return status ?? "unchanged";
  };

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const subId = idOf(session.subscription);
        if (session.mode !== "subscription" || !subId) return json({ ok: true, ignored: "not_subscription" });
        const sub = await s.subscriptions.retrieve(subId);
        const status = await apply(sub, session.client_reference_id ?? session.metadata?.user_id ?? null);
        // Confirmation « Votre plan est actif » : une seule fois par achat, et jamais bloquante pour l'ouverture du plan.
        const to = session.customer_details?.email ?? session.customer_email ?? null;
        const origin = appOrigin(null);
        if (to && origin && (status === "trial" || status === "active")) {
          const price = sub.items.data[0]?.price;
          try {
            await sendPlanActive(to, {
              amount: price?.unit_amount ?? null,
              currency: price?.currency ?? "eur",
              interval: (price?.recurring?.interval as Interval | undefined) ?? null,
              trialEnd: status === "trial" ? sub.trial_end ?? null : null,
              paid: session.amount_total ?? null,
              appUrl: origin,
            }, `plan-actif-${session.id}`);
          } catch (e: any) {
            console.error("plan email", e?.message);
          }
        }
        return json({ ok: true, status });
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        return json({ ok: true, status: await apply(event.data.object) });
      default:
        return json({ ok: true, ignored: event.type });
    }
  } catch (e: any) {
    // Réponse 500 : Stripe renverra l'événement automatiquement.
    console.error("stripe webhook", event.type, e?.message);
    return json({ error: "server_error" }, 500);
  }
}
