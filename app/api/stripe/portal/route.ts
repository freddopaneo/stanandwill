import { cors, json, serviceClient, userFrom } from "../../../../lib/server";
import { appOrigin, stripe } from "../../../../lib/stripe";

export const runtime = "nodejs";
export const preferredRegion = ["fra1"];

export async function OPTIONS() { return new Response(null, { status: 204, headers: cors }); }

/**
 * POST { origin } (jeton du compte obligatoire) → { url } : espace client Stripe (résilier, changer de carte, factures).
 * À activer une fois dans Stripe : Paramètres → Facturation → Portail client.
 */
export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch {}
  const user = await userFrom(req);
  if (!user) return json({ error: "unauthorized" }, 401);

  const s = stripe();
  const sb = serviceClient();
  const origin = appOrigin(body.origin);
  if (!s || !sb || !origin) return json({ error: "not_configured" }, 503);

  const { data: profile } = await sb.from("profiles").select("stripe_customer_id").eq("id", user.id).maybeSingle();
  if (!profile?.stripe_customer_id) return json({ error: "no_subscription" }, 404);

  try {
    const session = await s.billingPortal.sessions.create({ customer: profile.stripe_customer_id, return_url: `${origin}/carnet`, locale: "fr" });
    return json({ url: session.url });
  } catch (e: any) {
    console.error("stripe portal", e?.message);
    return json({ error: "stripe_error" }, 502);
  }
}
