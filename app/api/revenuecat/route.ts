import { json, serviceClient } from "../../../lib/server";

export const runtime = "nodejs";

/**
 * Webhook RevenueCat → profiles.subscription_status.
 * Dans RevenueCat : Project → Integrations → Webhooks → URL https://<site>/api/revenuecat, Authorization header = REVENUECAT_WEBHOOK_SECRET.
 * app_user_id doit être l'id Supabase de l'utilisateur (Purchases.logIn(user.id) côté app).
 */
export async function POST(req: Request) {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (!secret || req.headers.get("authorization") !== secret) return json({ error: "unauthorized" }, 401);
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
  const ev = body.event ?? {};
  const uid: string | undefined = ev.app_user_id;
  if (!uid || /^\$RCAnonymousID/.test(uid)) return json({ ok: true, ignored: "anonymous" });

  const type: string = ev.type ?? "";
  let status: string | null = null;
  if (["INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION", "PRODUCT_CHANGE", "NON_RENEWING_PURCHASE"].includes(type)) status = ev.period_type === "TRIAL" ? "trial" : "active";
  else if (type === "EXPIRATION") status = "expired";
  else if (type === "CANCELLATION") status = null; // reste actif jusqu'à expiration
  else if (type === "BILLING_ISSUE") status = null;

  const sb = serviceClient();
  if (status && sb) await sb.from("profiles").update({ subscription_status: status }).eq("id", uid);
  return json({ ok: true, status });
}
