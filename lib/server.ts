/**
 * Utilitaires serveur partagés par les routes /api/* (fonctions Netlify, région fra1).
 * - Authentification facultative par jeton Supabase (Bearer) : identifie l'utilisateur pour les quotas, jamais transmis au modèle.
 * - Minimisation : le profil du chien est réduit aux champs utiles avant d'être envoyé à Claude.
 * - Triage : règles déterministes AVANT le modèle, pour que les urgences ne dépendent jamais de l'IA.
 */
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export type Triage = "none" | "watch" | "consult" | "emergency";

export interface DogCtx {
  name?: string; breed_id?: string; variety?: string | null; size?: string | null; sex?: string | null;
  birth_month?: string | null; neutered?: string | null; weightKg?: number | null; silhouette?: string | null; conditions?: string[];
}

export const BREED_LABEL: Record<string, string> = {
  dachshund: "teckel", french_bulldog: "bouledogue français", chihuahua: "chihuahua", pomeranian: "spitz nain", cavalier: "cavalier King Charles",
  shih_tzu: "shih tzu", labrador: "labrador", golden: "golden retriever", yorkshire: "yorkshire", other: "chien croisé ou d'une autre race",
};

/** Ce que le modèle doit savoir de la race : fragilités documentées et signaux d'urgence. Relu par le vétérinaire référent. */
export const BREED_BRIEF: Record<string, string> = {
  dachshund: "Race la plus touchée par la hernie discale (environ 1 sur 4 au cours de la vie, pic 4–8 ans). Urgence absolue si faiblesse ou paralysie des pattes arrière, perte de contrôle des besoins. Facteurs de risque : surpoids, stérilisation avant 12 mois, sauts depuis une hauteur ; les escaliers ne sont pas associés au risque dans les études. Dents et surpoids fréquents.",
  french_bulldog: "Brachycéphale : syndrome obstructif (BOAS), coup de chaleur dès 22 °C, intolérance à l'effort. Urgence si langue bleutée, halètement qui ne se calme pas, effondrement. Aussi : hernie discale (3–6 ans), dermatite des plis, allergies, otites, problèmes oculaires.",
  chihuahua: "Maladie dentaire précoce (13,5 %), dents de lait persistantes, luxation de rotule (4 %), collapsus trachéal, hypoglycémie des très petits gabarits, maladie de la valve mitrale après 7 ans, hydrocéphalie/fontanelle ouverte possible.",
  pomeranian: "Collapsus trachéal (toux de canard, aggravée par collier, excitation, chaleur), luxation de rotule, maladie dentaire, alopécie X (ne jamais raser), hypoglycémie chez les très petits.",
  cavalier: "Maladie de la valve mitrale (1 sur 2 à 5 ans, quasi tous à 10 ans) : surveiller la fréquence respiratoire endormie (> 30/min = consulter). Syringomyélie (grattage fantôme du cou, cris), otites, ulcères cornéens, sécheresse oculaire.",
};

export function ageText(birth?: string | null) {
  if (!birth) return "âge inconnu";
  const [y, m] = birth.split("-").map(Number);
  const now = new Date();
  const months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
  return months < 12 ? `${months} mois` : `${Math.floor(months / 12)} ans`;
}

export function dogSummary(d: DogCtx) {
  const breed = BREED_LABEL[d.breed_id ?? "other"] ?? d.breed_id;
  const parts = [
    `${d.name ?? "Le chien"} : ${breed}${d.variety ? ` (${d.variety})` : ""}${d.size ? `, taille ${d.size}` : ""}`,
    d.sex === "female" ? "femelle" : d.sex === "male" ? "mâle" : null,
    ageText(d.birth_month),
    d.neutered === "yes" ? "stérilisé" : d.neutered === "no" ? "non stérilisé" : null,
    d.weightKg ? `${d.weightKg} kg` : null,
    d.silhouette ? `silhouette ${d.silhouette}` : null,
    d.conditions?.length ? `antécédents : ${d.conditions.join(", ")}` : "aucun antécédent déclaré",
  ].filter(Boolean);
  return parts.join(", ") + ".";
}

/** Règles d'urgence déterministes (texte libre de l'utilisateur). */
export function ruleTriage(text: string, breedId?: string): Triage {
  const t = text.toLowerCase();
  const emergency = [
    /paralys|ne (tient|marche) plus|traîne (ses|les) pattes|pattes arri[eè]re (faibles|qui l[aâ]chent)/, /convuls|crise d'?épilep/, /respire (mal|difficilement)|ne respire plus|langue (bleue|violette)/,
    /sang (dans|en) (les selles|vomi|urines)|vomit du sang/, /ventre (gonflé|dur|ballonn)/, /avalé .*(chocolat|raisin|xylitol|médicament|oignon|ail|macadamia)/, /inconscient|évanoui|effondr/, /coup de chaleur|halète .*(sans arrêt|depuis)/,
  ];
  if (emergency.some((r) => r.test(t))) return "emergency";
  const consult = [/vomi.*(plusieurs|depuis|répét)/, /diarrh.*(depuis|jours|sang)/, /ne mange plus depuis/, /boite|boîte|boiterie/, /œil (fermé|rouge)|oeil (fermé|rouge)/, /crie quand/, /refuse de (sauter|monter)/, /tousse .*(depuis|nuit)/, /grosseur|boule|masse/];
  if (consult.some((r) => r.test(t))) return "consult";
  const watch = [/gratte|démange/, /haleine/, /boit beaucoup/, /tremble/, /fatigué|apathique/, /selles molles/];
  if (watch.some((r) => r.test(t))) return "watch";
  if (breedId === "dachshund" && /dos|voût|raide/.test(t)) return "consult";
  return "none";
}

export function systemPrompt(d: DogCtx) {
  const brief = BREED_BRIEF[d.breed_id ?? ""] ?? "Race sans fiche dédiée : appliquer les connaissances générales du chien de compagnie.";
  return `Tu es l'assistant de Stan & Will, une application française de prévention santé pour chiens, par race. Tu réponds en français, avec chaleur et précision, comme un vétérinaire pédagogue qui parle à un maître inquiet.

Règles absolues :
1. Tu ne poses jamais de diagnostic et tu ne prescris jamais de médicament ni de dose. Tu orientes : « rien d'inquiétant », « à surveiller », « à montrer au vétérinaire », « urgence ».
2. Toute faiblesse des pattes arrière, difficulté respiratoire, ingestion d'un toxique, convulsion, sang, ventre gonflé, effondrement = URGENCE : dis-le en première phrase et donne les gestes d'attente, jamais de « on verra demain ».
3. Tu cites la source quand tu avances un chiffre (étude, organisme). Si tu ne sais pas, tu le dis.
4. Tu personnalises avec le profil du chien ci-dessous, sans jamais demander d'informations sur le maître.
5. Réponse courte : 4 à 8 phrases, puis une ligne « Ce que vous pouvez faire maintenant : … ». Pas de listes à puces, pas de titres.
6. Termine par une question de suivi utile si la situation l'exige (durée, autres signes), une seule.

Profil : ${dogSummary(d)}
Fragilités connues de la race : ${brief}`;
}

export function anthropic() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  return new Anthropic({ apiKey: key });
}

export const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-5";

/** Identifie l'utilisateur via le jeton Supabase (facultatif). Retourne l'id ou null. */
export async function userIdFrom(req: Request): Promise<string | null> {
  const auth = req.headers.get("authorization");
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!auth?.startsWith("Bearer ") || !url || !anon) return null;
  try {
    const sb = createClient(url, anon, { global: { headers: { Authorization: auth } } });
    const { data } = await sb.auth.getUser();
    return data.user?.id ?? null;
  } catch { return null; }
}

/** Client service (webhooks, quotas). Jamais exposé au client. */
export function serviceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "cache-control": "no-store" } });
}

export const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization",
};
