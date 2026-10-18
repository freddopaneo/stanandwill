import { anthropic, cors, json, MODEL, ruleTriage, systemPrompt, userIdFrom, serviceClient, type DogCtx, type Triage } from "../../../lib/server";

export const runtime = "nodejs";
export const preferredRegion = ["fra1"];

const FREE_PER_DAY = 3;

export async function OPTIONS() { return new Response(null, { status: 204, headers: cors }); }

/** POST { question, dog, history: [{role, content}] } → { triage, answer, source } */
export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
  const question = String(body.question ?? "").trim().slice(0, 1500);
  const dog: DogCtx = body.dog ?? {};
  const history: { role: "user" | "assistant"; content: string }[] = Array.isArray(body.history) ? body.history.slice(-8) : [];
  if (!question) return json({ error: "empty" }, 400);

  // Quotas : 3 questions/jour sans abonnement (compte requis pour compter côté serveur ; sinon l'app limite localement)
  const uid = await userIdFrom(req);
  const sb = serviceClient();
  let premium = false;
  if (uid && sb) {
    const { data: prof } = await sb.from("profiles").select("subscription_status").eq("id", uid).maybeSingle();
    premium = ["trial", "active", "founder"].includes(prof?.subscription_status ?? "none");
    if (!premium) {
      const { data: u } = await sb.from("usage").select("messages").eq("user_id", uid).eq("day", new Date().toISOString().slice(0, 10)).maybeSingle();
      if ((u?.messages ?? 0) >= FREE_PER_DAY) return json({ error: "quota", triage: "none", answer: "Vous avez utilisé vos 3 questions offertes aujourd'hui. Le plan de prévention donne des questions illimitées." }, 402);
    }
  }

  const ruled: Triage = ruleTriage(question, dog.breed_id);
  const client = anthropic();
  if (!client) {
    return json({ triage: ruled, answer: ruled === "emergency"
      ? "Ce que vous décrivez peut être une urgence : appelez votre vétérinaire ou un service de garde maintenant. En attendant, gardez-le au calme, ne lui donnez rien par la bouche."
      : "L'assistant n'est pas encore activé sur ce serveur (clé API manquante). En cas de doute, appelez votre vétérinaire.", source: "Règles d'orientation Stan & Will." });
  }

  const sys = systemPrompt(dog) + (ruled === "emergency" ? "\n\nIMPORTANT : les règles de triage ont détecté une URGENCE dans ce message. Ta première phrase doit le dire clairement." : ruled === "consult" ? "\n\nLes règles de triage suggèrent une consultation vétérinaire : dis-le explicitement, avec le délai (jour même / 24–48 h)." : "");
  const messages = [...history.filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content).map((m) => ({ role: m.role, content: String(m.content).slice(0, 1500) })), { role: "user" as const, content: question }];
  // Le dernier message doit venir de l'utilisateur, et l'historique transmis par l'app contient déjà la question : on dédoublonne.
  if (messages.length >= 2 && messages[messages.length - 2].role === "user" && messages[messages.length - 2].content === question) messages.splice(messages.length - 2, 1);

  const res = await client.messages.create({
    model: MODEL, max_tokens: 600, temperature: 0.3, system: sys,
    messages,
    tools: [{
      name: "answer", description: "Réponse structurée à afficher dans l'app.",
      input_schema: { type: "object", properties: { triage: { type: "string", enum: ["none", "watch", "consult", "emergency"] }, answer: { type: "string" }, source: { type: "string" } }, required: ["triage", "answer"] },
    }],
    tool_choice: { type: "tool", name: "answer" },
  });
  const tool = res.content.find((c) => c.type === "tool_use") as any;
  const out = tool?.input ?? { triage: ruled, answer: "Je n'ai pas pu formuler de réponse. En cas de doute, appelez votre vétérinaire." };
  // Le triage final est le plus prudent des deux
  const order: Triage[] = ["none", "watch", "consult", "emergency"];
  const triage = order[Math.max(order.indexOf(out.triage ?? "none"), order.indexOf(ruled))];

  if (uid && sb) {
    await sb.rpc("bump_usage", { p_user: uid, p_messages: 1, p_scans: 0 }).then(() => {}, () => {});
  }
  return json({ triage, answer: String(out.answer).slice(0, 2000), source: out.source ?? "Réponse générée par IA, cadre validé par un vétérinaire." });
}
