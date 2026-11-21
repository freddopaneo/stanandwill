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
 *                           sont retrouvés par leur « lookup key » : sw_annual_6999, sw_monthly_999
 */
import Stripe from "stripe";

export type OfferId = "annual" | "monthly" | "weekly";

export const LOOKUP_KEYS: Record<OfferId, string> = { annual: "sw_annual_6999", monthly: "sw_monthly_999", weekly: "sw_weekly_699" };
const PRICE_ENV: Record<OfferId, string> = { annual: "STRIPE_PRICE_ANNUAL", monthly: "STRIPE_PRICE_MONTHLY", weekly: "STRIPE_PRICE_WEEKLY" };

/**
 * Prix de lancement : l'abonnement annuel à 49,99 € la première année (au lieu de 69,99 €), jusqu'au 31 décembre 2026 inclus,
 * heure de Bruxelles. Les années suivantes sont au tarif normal. Pas d'essai gratuit : le premier paiement est immédiat.
 */
export { LAUNCH_END, launchActive } from "./launch";
const LAUNCH_COUPON = "sw-lancement-2026-20";

/** Réduction de lancement (20 € une seule fois). Créée toute seule dans Stripe au premier besoin, en test comme en production. */
export async function launchCoupon(s: Stripe): Promise<string> {
  try { return (await s.coupons.retrieve(LAUNCH_COUPON)).id; }
  catch {
    try { return (await s.coupons.create({ id: LAUNCH_COUPON, name: "Prix de lancement", amount_off: 2000, currency: "eur", duration: "once" })).id; }
    catch { return (await s.coupons.retrieve(LAUNCH_COUPON)).id; } // créée entre-temps par un autre appel
  }
}

export function isOffer(v: unknown): v is OfferId {
  return v === "annual" || v === "monthly"; // l'offre hebdomadaire n'est plus vendue (les abonnements existants continuent)
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
