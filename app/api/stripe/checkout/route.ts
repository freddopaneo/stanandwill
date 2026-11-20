import { cors, json, serviceClient, userFrom } from "../../../../lib/server";
import { TRIAL_DAYS, appOrigin, isOffer, priceIdFor, stripe, type OfferId } from "../../../../lib/stripe";

export const runtime = "nodejs";
export const preferredRegion = ["fra1"];

export async function OPTIONS() { return new Response(null, { status: 204, headers: cors }); }

/**
 * POST { offer: "annual" | "monthly" | "weekly", origin } (jeton du compte obligatoire) → { url } : page de paiement Stripe.
 * L'abonnement est rattaché au compte (client_reference_id + metadata.user_id) : c'est le webhook qui ouvrira l'accès.
 */
export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
  if (!isOffer(body.offer)) return json({ error: "bad_offer" }, 400);
  const offer: OfferId = body.offer;

  const user = await userFrom(req);
  if (!user) return json({ error: "unauthorized" }, 401);

  const s = stripe();
  const sb = serviceClient();
  const origin = appOrigin(body.origin);
  if (!s || !sb || !origin) return json({ error: "not_configured" }, 503);

  const { data: profile } = await sb.from("profiles").select("subscription_status, stripe_customer_id").eq("id", user.id).maybeSingle();
  const customerId: string | null = profile?.stripe_customer_id ?? null;

  try {
    // Déjà abonné par Stripe : pas de second abonnement.
    if (customerId) {
      const subs = await s.subscriptions.list({ customer: customerId, status: "all", limit: 10 });
      if (subs.data.some((x) => x.status === "active" || x.status === "trialing" || x.status === "past_due")) return json({ already: true });
    }

    const price = await priceIdFor(s, offer);
    if (!price) return json({ error: "not_configured", detail: "price_missing" }, 503);

    // Un seul essai gratuit par compte : un client Stripe déjà connu a déjà eu le sien.
    const trialDays = customerId ? undefined : TRIAL_DAYS[offer];

    const session = await s.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      client_reference_id: user.id,
      ...(customerId ? { customer: customerId } : user.email ? { customer_email: user.email } : {}),
      subscription_data: { metadata: { user_id: user.id, offer }, ...(trialDays ? { trial_period_days: trialDays } : {}) },
      metadata: { user_id: user.id, offer },
      allow_promotion_codes: true,
      locale: "fr",
      ...(process.env.STRIPE_TAX === "1" ? { automatic_tax: { enabled: true } } : {}),
      success_url: `${origin}/paywall?checkout=success&offer=${offer}`,
      cancel_url: `${origin}/paywall?checkout=cancel&offer=${offer}`,
    });
    if (!session.url) return json({ error: "stripe_error" }, 502);
    return json({ url: session.url });
  } catch (e: any) {
    console.error("stripe checkout", e?.message);
    return json({ error: "stripe_error" }, 502);
  }
}
