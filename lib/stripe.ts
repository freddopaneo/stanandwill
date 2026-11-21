/**
 * Paiement web (PWA) — Stripe. Les apps iOS / Android passent par RevenueCat (route /api/revenuecat).
 * Les deux canaux écrivent le même champ : profiles.subscription_status (none | trial | active | expired | founder).
 *
 * Variables d'environnement (Vercel → Settings → Environment Variables) :
 *   STRIPE_SECRET_KEY       clé secrète (sk_live_… ou sk_test_…), serveur uniquement
 *   STRIPE_WEBHOOK_SECRET   secret de signature du webhook (whsec_…)
 *   APP_WEB_ORIGINS         adresse(s) de l'app web autorisées pour le retour après paiement, séparées par des virgules
 *                           (ex. https://app.stanandwill.com)
 *   STRIPE_TAX              "1" pour le calcul automatique de la TVA (à activer d'abord dans Stripe Tax)
 *   STRIPE_PRICE_ANNUAL / STRIPE_PRICE_MONTHLY / STRIPE_PRICE_WEEKLY   (facultatif) identifiants price_… ; sinon les tarifs
 *                           sont retrouvés par leur « lookup key » : sw_annual_4999, sw_monthly_999, sw_weekly_699
 */
import Stripe from "stripe";

export type OfferId = "annual" | "monthly" | "weekly";

export const LOOKUP_KEYS: Record<OfferId, string> = { annual: "sw_annual_4999", monthly: "sw_monthly_999", weekly: "sw_weekly_699" };
const PRICE_ENV: Record<OfferId, string> = { annual: "STRIPE_PRICE_ANNUAL", monthly: "STRIPE_PRICE_MONTHLY", weekly: "STRIPE_PRICE_WEEKLY" };

/** Essai gratuit : 2 mois offerts sur l'offre annuelle (carte enregistrée, premier prélèvement à la fin de l'essai). */
export const TRIAL_DAYS: Partial<Record<OfferId, number>> = { annual: 60 };

export function isOffer(v: unknown): v is OfferId {
  return v === "annual" || v === "monthly" || v === "weekly";
}

let client: Stripe | null = null;
export function stripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client ??= new Stripe(key);
  return client;
}

/** Identifiant du tarif Stripe d'une offre (variable d'environnement, sinon « lookup key »). */
export async function priceIdFor(s: Stripe, offer: OfferId): Promise<string | null> {
  const fromEnv = process.env[PRICE_ENV[offer]];
  if (fromEnv) return fromEnv;
  const list = await s.prices.list({ lookup_keys: [LOOKUP_KEYS[offer]], active: true, limit: 1 });
  return list.data[0]?.id ?? null;
}

/**
 * Adresse de l'app vers laquelle Stripe renvoie l'utilisateur. Seules les origines déclarées dans APP_WEB_ORIGINS
 * sont acceptées : sans cela, n'importe quel site pourrait se faire passer pour l'app au retour du paiement.
 */
export function appOrigin(requested: unknown): string | null {
  const allowed = (process.env.APP_WEB_ORIGINS ?? "").split(",").map((o) => o.trim().replace(/\/+$/, "")).filter(Boolean);
  if (!allowed.length) return null;
  const wanted = typeof requested === "string" ? requested.replace(/\/+$/, "") : "";
  return allowed.includes(wanted) ? wanted : allowed[0];
}

/** Statut Stripe → statut de l'app. null : état transitoire, on ne change rien. */
export function appStatus(status: string): "trial" | "active" | "expired" | null {
  if (status === "trialing") return "trial";
  if (status === "active" || status === "past_due") return "active"; // past_due : Stripe relance le paiement, l'accès reste ouvert
  if (status === "canceled" || status === "unpaid" || status === "incomplete_expired" || status === "paused") return "expired";
  return null; // incomplete : premier paiement pas encore confirmé
}
