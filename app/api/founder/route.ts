import { cors, json, serviceClient, userIdFrom } from "../../../lib/server";

export const runtime = "nodejs";

export async function OPTIONS() { return new Response(null, { status: 204, headers: cors }); }

const DAY = 86_400_000;

/**
 * Codes d'invitation (la route garde son nom historique « founder », invisible pour l'utilisateur).
 * POST { code } avec le jeton du compte → { ok, reason?, until? }
 *   - Liste des codes : variable FOUNDER_CODES, séparés par des virgules (ex. "AMIS-2026,VETO-2026").
 *   - Chaque code ouvre le plan complet pendant INVITE_DAYS jours (défaut 30), sans carte bancaire.
 *   - Chaque code sert à INVITE_USES comptes au plus (défaut 20) ; un compte ne peut utiliser qu'un seul code, une seule fois.
 * Le compteur est le nombre de comptes qui portent ce code dans profiles.founder_code : pas de table à part.
 */
export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
  const code = String(body.code ?? "").trim().toUpperCase();
  const allowed = (process.env.FOUNDER_CODES ?? "").split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
  if (!code || !allowed.includes(code)) return json({ ok: false, reason: "unknown" });

  const uid = await userIdFrom(req);
  if (!uid) return json({ ok: false, reason: "account_required" }, 401);
  const sb = serviceClient();
  if (!sb) return json({ ok: false, reason: "not_configured" }, 503);

  const days = Math.max(1, Number(process.env.INVITE_DAYS) || 30);
  const uses = Math.max(1, Number(process.env.INVITE_USES) || 20);

  const { data: profile, error: e1 } = await sb.from("profiles").select("*").eq("id", uid).maybeSingle();
  if (e1 || !profile) return json({ ok: false, reason: "no_profile" }, 404);
  if (profile.subscription_status === "trial" || profile.subscription_status === "active") return json({ ok: true, already: true });
  if (profile.founder_code) return json({ ok: false, reason: "already_used" });

  const { count, error: e2 } = await sb.from("profiles").select("id", { count: "exact", head: true }).eq("founder_code", code);
  if (e2) return json({ ok: false, reason: "db_error" }, 502);
  if ((count ?? 0) >= uses) return json({ ok: false, reason: "full" });

  const until = new Date(Date.now() + days * DAY).toISOString();
  const { error: e3 } = await sb.from("profiles").update({ subscription_status: "founder", founder_code: code, invite_expires_at: until }).eq("id", uid);
  // Échec typique : la migration 0007 (colonne invite_expires_at) n'a pas encore été exécutée dans Supabase.
  if (e3) { console.error("invite", e3.message); return json({ ok: false, reason: "not_configured" }, 503); }
  return json({ ok: true, until, days });
}
