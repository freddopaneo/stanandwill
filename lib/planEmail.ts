/**
 * E-mail « Votre plan est actif » — envoyé une fois, quand Stripe confirme un abonnement pris sur le web.
 * (L'e-mail de bienvenue, lui, part à la création du compte : il concerne aussi les utilisateurs de la version gratuite.)
 * Même charte que les e-mails de l'app : vert forêt #1E5B45, crème #FBF8F2, miel #F5A623, texte #14291F.
 *
 * Variables : RESEND_API_KEY et MAIL_FROM (déjà utilisées par la liste d'attente). Sans clé, rien n'est envoyé.
 */
import { Resend } from "resend";

export type Interval = "year" | "month" | "week" | "day";

export interface PlanMail {
  /** Montant du tarif en centimes (ex. 4999) et devise ISO (ex. "eur"). */
  amount: number | null;
  currency: string;
  interval: Interval | null;
  /** Fin de l'essai gratuit (secondes Unix), ou null s'il n'y a pas d'essai. */
  trialEnd: number | null;
  /** Montant réellement réglé aujourd'hui, en centimes (différent du tarif pendant le prix de lancement). */
  paid?: number | null;
  /** Adresse de l'app web, pour le bouton. */
  appUrl: string;
}

export interface Rendered { subject: string; html: string; text: string }

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const PER: Record<Interval, string> = { year: "par an", month: "par mois", week: "par semaine", day: "par jour" };
const NAME: Record<Interval, string> = { year: "annuel", month: "mensuel", week: "hebdomadaire", day: "quotidien" };

/** « 49,99 € par an » (ou chaîne vide si le tarif est inconnu). */
export function priceLabel(m: Pick<PlanMail, "amount" | "currency" | "interval">): string {
  if (m.amount == null) return "";
  const price = new Intl.NumberFormat("fr-FR", { style: "currency", currency: m.currency.toUpperCase() }).format(m.amount / 100).replace(/ | /g, " ");
  return m.interval ? `${price} ${PER[m.interval]}` : price;
}

/** « samedi 28 novembre 2026 », à l'heure de Paris. */
export const frDate = (unix: number) =>
  new Date(unix * 1000).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });

const GUARANTEE = "Satisfait ou remboursé pendant 14 jours : écrivez-nous à bonjour@stanandwill.com.";

/** « Vous avez réglé 40,00 € aujourd'hui… » quand le premier paiement diffère du tarif (prix de lancement). */
function paidNote(m: PlanMail): string {
  if (m.paid == null || m.amount == null || m.paid === m.amount) return "";
  const paid = priceLabel({ amount: m.paid, currency: m.currency, interval: null });
  return ` Vous avez réglé ${paid} aujourd'hui (prix de lancement) ; le renouvellement se fera au tarif normal.`;
}

export function renderPlanActive(m: PlanMail): Rendered {
  const price = priceLabel(m);
  const plan = m.interval ? `plan ${NAME[m.interval]}` : "plan de prévention";
  const trial = m.trialEnd != null;
  const subject = trial ? "Votre essai gratuit Stan & Will a commencé" : "Votre plan Stan & Will est actif";

  const lead = trial
    ? `Votre essai gratuit est ouvert jusqu'au <strong>${esc(frDate(m.trialEnd!))}</strong>. Aucun montant n'a été prélevé aujourd'hui.`
    : `Votre ${esc(plan)} est actif${price ? ` : <strong>${esc(price)}</strong>` : ""}. Merci de votre confiance.${esc(paidNote(m))}`;
  const after = trial
    ? `Sans action de votre part, votre ${esc(plan)}${price ? ` (${esc(price)})` : ""} démarrera ce jour-là. Vous pouvez l'arrêter avant, en un geste, sans rien payer.`
    : `Il se renouvelle automatiquement à chaque échéance. Vous pouvez l'arrêter à tout moment, en un geste. ${GUARANTEE}`;

  const body = `
<h1 style="margin:0 0 12px;font-size:24px;line-height:30px;font-weight:800">${trial ? "C'est parti&nbsp;!" : "Votre plan est actif"}</h1>
<p style="margin:0 0 12px;font-size:16px;line-height:24px">${lead}</p>
<p style="margin:0 0 16px;font-size:16px;line-height:24px">${after}</p>
<p style="margin:0 0 8px;font-size:16px;line-height:24px;font-weight:700">Ce qui est ouvert dès maintenant</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:22px">
<tr><td style="padding:4px 10px 4px 0;vertical-align:top">🛡️</td><td style="padding:4px 0">Les points de vigilance de sa race, détaillés et mis à jour.</td></tr>
<tr><td style="padding:4px 10px 4px 0;vertical-align:top">📅</td><td style="padding:4px 0">Le plan hebdomadaire complet, adapté à son âge et à son poids.</td></tr>
<tr><td style="padding:4px 10px 4px 0;vertical-align:top">📷</td><td style="padding:4px 0">Le scanner et les questions à l'assistant, sans limite quotidienne.</td></tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 4px"><tr><td style="background:#F5A623;border-radius:14px"><a href="${esc(m.appUrl)}" style="display:inline-block;padding:14px 22px;font-weight:800;font-size:16px;color:#14291F;text-decoration:none">Ouvrir Stan &amp; Will</a></td></tr></table>
<p style="margin:16px 0 0;font-size:14px;line-height:21px;color:#4B5E54">Pour gérer ou arrêter votre abonnement : dans l'app, Carnet → Réglages → « Gérer mon abonnement ». Une question ? Répondez simplement à cet e-mail.</p>`;

  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#FBF8F2;font-family:Nunito,Helvetica,Arial,sans-serif;color:#14291F">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${esc(trial ? "Aucun prélèvement aujourd'hui. Voici la date de fin de votre essai." : "Merci. Voici comment gérer votre abonnement.")}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF8F2"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="background:#1E5B45;border-radius:20px 20px 0 0;padding:22px 28px;color:#FBF8F2;font-size:20px;font-weight:800;letter-spacing:.2px">Stan &amp; Will <span style="font-weight:400;font-size:14px;color:#DCE8D8">· prévention santé par race</span></td></tr>
<tr><td style="background:#FFFFFF;border:1px solid #E6E0D4;border-top:0;border-radius:0 0 20px 20px;padding:28px">${body}</td></tr>
<tr><td style="padding:18px 8px;font-size:12px;line-height:18px;color:#4B5E54;text-align:center">Stan &amp; Will est édité par Eureca Design SRL (Belgique). L'app ne pose pas de diagnostic et ne remplace pas une consultation vétérinaire.</td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    trial ? "C'est parti !" : "Votre plan est actif",
    "",
    trial ? `Votre essai gratuit est ouvert jusqu'au ${frDate(m.trialEnd!)}. Aucun montant n'a été prélevé aujourd'hui.` : `Votre ${plan} est actif${price ? ` : ${price}` : ""}. Merci de votre confiance.${paidNote(m)}`,
    trial ? `Sans action de votre part, votre ${plan}${price ? ` (${price})` : ""} démarrera ce jour-là. Vous pouvez l'arrêter avant, sans rien payer.` : `Il se renouvelle automatiquement à chaque échéance. Vous pouvez l'arrêter à tout moment. ${GUARANTEE}`,
    "",
    `Ouvrir l'app : ${m.appUrl}`,
    "Gérer ou arrêter l'abonnement : Carnet → Réglages → « Gérer mon abonnement ».",
    "",
    "Stan & Will, édité par Eureca Design SRL (Belgique).",
  ].join("\n");

  return { subject, html, text };
}

/**
 * Envoie l'e-mail. `key` rend l'envoi unique : si Stripe renvoie le même événement, Resend ne renvoie pas l'e-mail.
 * Retourne false si l'envoi n'est pas configuré ; lève une erreur si Resend refuse.
 */
export async function sendPlanActive(to: string, m: PlanMail, key: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const from = process.env.MAIL_FROM || "Stan & Will <bonjour@stanandwill.com>";
  const mail = renderPlanActive(m);
  const { error } = await new Resend(apiKey).emails.send(
    { from, to, subject: mail.subject, html: mail.html, text: mail.text, tags: [{ name: "type", value: "plan_actif" }] },
    { idempotencyKey: key },
  );
  if (error) throw new Error(error.message);
  return true;
}
