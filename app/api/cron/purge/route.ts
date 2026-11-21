import type { SupabaseClient } from "@supabase/supabase-js";
import { json, serviceClient } from "../../../../lib/server";
import { stripe } from "../../../../lib/stripe";

export const runtime = "nodejs";
export const preferredRegion = ["fra1"];
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BUCKET = "dog-media";

/** Tous les fichiers d'un dossier du stockage, sous-dossiers compris. */
async function filesUnder(sb: SupabaseClient, prefix: string, depth = 0): Promise<string[]> {
  if (depth > 4) return [];
  const { data, error } = await sb.storage.from(BUCKET).list(prefix, { limit: 1000 });
  if (error) throw new Error(`storage list: ${error.message}`);
  const out: string[] = [];
  for (const item of data ?? []) {
    const path = `${prefix}/${item.name}`;
    if (item.id) out.push(path);
    else out.push(...(await filesUnder(sb, path, depth + 1)));
  }
  return out;
}

/**
 * GET (tâche planifiée Vercel, une fois par jour, voir vercel.json) : efface pour de bon les comptes dont la
 * suppression a été demandée dans l'app (profiles.deletion_requested_at).
 * Pour chaque compte, dans cet ordre : résiliation de l'abonnement Stripe, suppression des fichiers des chiens
 * dont il est le seul maître, puis purge_user (données + compte). Si une étape échoue, le compte est laissé tel
 * quel et repris le lendemain. Les factures restent chez Stripe (obligation comptable).
 * Protégée par CRON_SECRET : Vercel l'envoie tout seul dans l'en-tête Authorization.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return json({ error: "not_configured" }, 503);
  if (req.headers.get("authorization") !== `Bearer ${secret}`) return json({ error: "unauthorized" }, 401);

  const sb = serviceClient();
  if (!sb) return json({ error: "not_configured" }, 503);

  const { data: pending, error } = await sb.from("profiles").select("id, stripe_customer_id")
    .not("deletion_requested_at", "is", null).order("deletion_requested_at").limit(50);
  if (error) { console.error("purge list", error.message); return json({ error: "db_error" }, 502); }

  let purged = 0, failed = 0;
  for (const p of pending ?? []) {
    try {
      if (p.stripe_customer_id) {
        const s = stripe();
        if (!s) throw new Error("stripe non configuré");
        const subs = await s.subscriptions.list({ customer: p.stripe_customer_id, status: "all", limit: 20 });
        for (const sub of subs.data) {
          if (sub.status !== "canceled" && sub.status !== "incomplete_expired") await s.subscriptions.cancel(sub.id);
        }
      }

      const { data: mine, error: e1 } = await sb.from("dog_owners").select("dog_id").eq("user_id", p.id);
      if (e1) throw new Error(e1.message);
      for (const { dog_id } of mine ?? []) {
        const { count, error: e2 } = await sb.from("dog_owners").select("user_id", { count: "exact", head: true }).eq("dog_id", dog_id).neq("user_id", p.id);
        if (e2) throw new Error(e2.message);
        if ((count ?? 0) > 0) continue; // chien partagé : il reste à l'autre maître, ses fichiers aussi
        const files = await filesUnder(sb, dog_id);
        for (let i = 0; i < files.length; i += 100) {
          const { error: e3 } = await sb.storage.from(BUCKET).remove(files.slice(i, i + 100));
          if (e3) throw new Error(`storage remove: ${e3.message}`);
        }
      }

      const { error: e4 } = await sb.rpc("purge_user", { target: p.id });
      if (e4) throw new Error(e4.message);
      purged++;
    } catch (e: any) {
      failed++;
      console.error("purge", p.id, e?.message);
    }
  }
  return json({ pending: pending?.length ?? 0, purged, failed });
}
