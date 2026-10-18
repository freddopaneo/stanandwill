import { anthropic, cors, json, MODEL, systemPrompt, userIdFrom, serviceClient, type DogCtx, type Triage } from "../../../lib/server";

export const runtime = "nodejs";
export const preferredRegion = ["fra1"];

const FREE_PER_DAY = 3;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Règles alimentaires d'urgence (miroir de la table food_rules ; le serveur lira la table quand Supabase sera branché). */
const EMERGENCY = [
  { re: /chocolat|cacao|th[eé]obromine/i, name: "Chocolat", why: "Théobromine : vomissements, agitation, troubles cardiaques. 20 g de chocolat noir suffisent pour un chien de 8 kg." },
  { re: /raisin/i, name: "Raisin frais ou sec", why: "Insuffisance rénale aiguë possible, sans seuil connu." },
  { re: /oignon|échalote|\bail\b|poireau|ciboul/i, name: "Oignon, ail, poireau", why: "Destruction des globules rouges, effet cumulatif." },
  { re: /xylitol|e967|bouleau/i, name: "Xylitol", why: "Hypoglycémie brutale en 30 minutes, atteinte du foie." },
  { re: /macadamia/i, name: "Noix de macadamia", why: "Faiblesse de l'arrière-train, tremblements, fièvre." },
  { re: /os (cuit|de poulet|de lapin)/i, name: "Os cuits", why: "Esquilles : perforation ou occlusion." },
  { re: /alcool|bi[eè]re|\bvin\b|éthanol/i, name: "Alcool", why: "Toxique à très faible dose." },
  { re: /avocat/i, name: "Avocat", why: "Persine : troubles digestifs ; le noyau provoque des occlusions." },
  { re: /caféine|café|thé noir/i, name: "Caféine", why: "Agitation, tachycardie, convulsions." },
  { re: /pâte (crue|à pain|levée)/i, name: "Pâte à pain crue", why: "Gonflement de l'estomac et production d'alcool." },
];

export async function OPTIONS() { return new Response(null, { status: 204, headers: cors }); }

async function openPetFoodFacts(barcode: string) {
  try {
    const r = await fetch(`https://world.openpetfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=product_name,brands,ingredients_text,nutriments,quantity,categories`, { headers: { "user-agent": "StanAndWill/0.1 (bonjour@stanandwill.com)" } });
    if (!r.ok) return null;
    const j = await r.json();
    return j.status === 1 ? j.product : null;
  } catch { return null; }
}

/** POST { type: "food", query, dog } | { type: "stool"|"skin"|"eye"|"posture", image (base64 jpeg), dog } */
export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
  const type = String(body.type ?? "food");
  const dog: DogCtx = body.dog ?? {};
  const name = dog.name ?? "votre chien";

  const uid = await userIdFrom(req);
  const sb = serviceClient();
  if (uid && sb) {
    const { data: prof } = await sb.from("profiles").select("subscription_status").eq("id", uid).maybeSingle();
    const premium = ["trial", "active", "founder"].includes(prof?.subscription_status ?? "none");
    if (!premium) {
      const { data: u } = await sb.from("usage").select("scans").eq("user_id", uid).eq("day", new Date().toISOString().slice(0, 10)).maybeSingle();
      if ((u?.scans ?? 0) >= FREE_PER_DAY) return json({ error: "quota" }, 402);
    }
  }
  const record = async (scanType: string, input: unknown, result: any) => {
    if (!uid || !sb) return;
    await sb.rpc("bump_usage", { p_user: uid, p_messages: 0, p_scans: 1 }).then(() => {}, () => {});
    if (UUID.test(String(body.dog_id ?? ""))) {
      await sb.from("scans").insert({ dog_id: body.dog_id, type: scanType, input, result: result ?? {}, triage: result?.triage ?? "none" }).then(() => {}, () => {});
    }
  };

  if (type === "food") {
    const query = String(body.query ?? "").trim().slice(0, 200);
    if (!query) return json({ error: "empty" }, 400);
    const hit = EMERGENCY.find((f) => f.re.test(query));
    if (hit) {
      return json({ triage: "emergency" as Triage, title: `${hit.name} : à ne pas donner`, summary: hit.why,
        points: [`Si ${name} en a déjà avalé : notez la quantité et l'heure.`, "Appelez votre vétérinaire ou le centre antipoison vétérinaire (CAPAE Ouest : 02 40 68 77 40, 24 h/24)."],
        action: "Ne faites pas vomir sans avis vétérinaire.", source: "Table des aliments à risque Stan & Will (validée vét.), ASPCA Animal Poison Control." });
    }
    let product: any = null;
    if (/^\d{8,14}$/.test(query)) {
      product = await openPetFoodFacts(query);
      if (!product) return json({ triage: "none", title: "Produit inconnu de la base", summary: "Ce code-barres n'est pas encore dans Open Pet Food Facts. Tapez le nom du produit ou de l'ingrédient qui vous intéresse.", points: ["Vous pouvez aussi photographier la liste d'ingrédients (bientôt)."] });
    }
    const client = anthropic();
    if (!client) return json({ triage: "none", title: query, summary: "Rien de connu comme dangereux. L'analyse détaillée s'activera avec la clé API.", points: ["Friandises : 10 % des calories du jour au maximum."] });
    const res = await client.messages.create({
      model: MODEL, max_tokens: 500, temperature: 0.2,
      system: systemPrompt(dog) + "\n\nTu analyses un aliment ou un produit pour ce chien précis. Juge : adapté / à limiter / à éviter, en tenant compte de la race, du poids et des antécédents. Pour un aliment industriel, commente la densité calorique, les protéines, les additifs notables, et l'adéquation à sa taille et son âge. Jamais de marque recommandée.",
      messages: [{ role: "user", content: product
        ? `Produit scanné (Open Pet Food Facts) : ${JSON.stringify({ nom: product.product_name, marque: product.brands, quantité: product.quantity, catégories: product.categories, ingrédients: product.ingredients_text, nutriments: product.nutriments }).slice(0, 3000)}`
        : `Aliment ou produit : « ${query} ». Peut-il le manger ?` }],
      tools: [{ name: "verdict", description: "Verdict structuré.", input_schema: { type: "object", properties: { triage: { type: "string", enum: ["none", "watch", "consult", "emergency"] }, title: { type: "string" }, summary: { type: "string" }, points: { type: "array", items: { type: "string" } }, action: { type: "string" }, source: { type: "string" } }, required: ["triage", "title", "summary", "points"] } }],
      tool_choice: { type: "tool", name: "verdict" },
    });
    const tool = res.content.find((c) => c.type === "tool_use") as any;
    await record(product ? "barcode" : "human_food", { query }, tool?.input);
    return json(tool?.input ?? { triage: "none", title: query, summary: "Analyse indisponible.", points: [] });
  }

  // Photos : selles, peau, œil, posture
  const image = String(body.image ?? "");
  if (!image || image.length < 1000) return json({ error: "no_image" }, 400);
  if (image.length > 6_000_000) return json({ error: "image_too_large" }, 413);
  const client = anthropic();
  if (!client) return json({ triage: "none", title: "Analyse photo bientôt", summary: "Clé API manquante côté serveur.", points: [] });
  const focus: Record<string, string> = {
    stool: "Analyse des selles : consistance (échelle 1–7), couleur, présence de sang, mucus, vers, corps étrangers. Rappelle qu'une selle isolée ne dit rien et que du sang ou une diarrhée de plus de 48 h justifie une consultation.",
    skin: "Analyse de la peau et du pelage : rougeur, perte de poil, croûtes, parasites visibles, plis irrités (bouledogue), alopécie symétrique (spitz). Jamais de diagnostic de maladie précise.",
    eye: "Analyse de l'œil : rougeur, écoulement, opacité, paupière fermée, troisième paupière visible. Un œil fermé qui pleure = consultation le jour même (ulcère).",
    posture: "Analyse de la posture debout de profil : dos voûté, tête basse, appui asymétrique, arrière-train bas. Chez le teckel ou le bouledogue, un dos voûté = repos strict et vétérinaire sous 24 h.",
  };
  const res = await client.messages.create({
    model: MODEL, max_tokens: 500, temperature: 0.2,
    system: systemPrompt(dog) + "\n\n" + (focus[type] ?? focus.skin) + "\nTu décris ce que tu vois avec prudence (une photo ne remplace pas un examen), tu orientes, tu ne diagnostiques pas.",
    messages: [{ role: "user", content: [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } }, { type: "text", text: `Photo de ${name}. Que vois-tu, et que dois-je faire ?` }] }],
    tools: [{ name: "verdict", description: "Verdict structuré.", input_schema: { type: "object", properties: { triage: { type: "string", enum: ["none", "watch", "consult", "emergency"] }, title: { type: "string" }, summary: { type: "string" }, points: { type: "array", items: { type: "string" } }, action: { type: "string" }, source: { type: "string" } }, required: ["triage", "title", "summary", "points"] } }],
    tool_choice: { type: "tool", name: "verdict" },
  });
  const tool = res.content.find((c) => c.type === "tool_use") as any;
  await record("health_photo", { kind: type }, tool?.input);
  return json(tool?.input ?? { triage: "none", title: "Analyse indisponible", summary: "Réessayez.", points: [] });
}
