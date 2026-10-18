import { cors, json, serviceClient, userIdFrom } from "../../../lib/server";

export const runtime = "nodejs";

export async function OPTIONS() { return new Response(null, { status: 204, headers: cors }); }

/**
 * Codes fondateurs : liste dans la variable FOUNDER_CODES (séparés par des virgules, ex. "TECKEL-2026,SAUSAGE-2027").
 * Chaque code est utilisable FOUNDER_CODE_USES fois (défaut 500). Le compteur vit dans la table founder_codes si Supabase est branché, sinon validation simple.
 */
export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
  const code = String(body.code ?? "").trim().toUpperCase();
  const allowed = (process.env.FOUNDER_CODES ?? "").split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
  if (!code || !allowed.includes(code)) return json({ ok: false }, 200);

  const uid = await userIdFrom(req);
  const sb = serviceClient();
  if (uid && sb) {
    await sb.from("profiles").update({ subscription_status: "founder", founder_code: code }).eq("id", uid);
  }
  return json({ ok: true, code, benefits: { firstYearPrice: 29.99 } });
}
