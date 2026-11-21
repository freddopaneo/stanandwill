import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Honeypot anti-robots
  if (body.website) return NextResponse.json({ ok: true, position: null });

  const email = String(body.email || "").trim().toLowerCase();
  const dog = String(body.dog || "").trim().slice(0, 40);
  const breed = String(body.breed || "").trim().slice(0, 40);
  const SOURCES = ["site", "app-bilan", "evenement", "qr"];
  const source = SOURCES.includes(String(body.source)) ? String(body.source) : "site";
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  if (!body.consent) return NextResponse.json({ error: "consent_required" }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_SEGMENT_ID;
  const from = process.env.MAIL_FROM || "Stan & Will <bonjour@stanandwill.com>";
  if (!apiKey || !segmentId) return NextResponse.json({ error: "not_configured" }, { status: 500 });

  const resend = new Resend(apiKey);

  // 1) Contact dans le segment Resend (données minimales : e-mail, prénom du chien, race, source).
  //    Route appelée par l'app quand un maître demande à être prévenu de l'arrivée du plan dédié à sa race.
  const contact = await resend.contacts.create({
    email,
    firstName: dog || undefined,
    unsubscribed: false,
    // @ts-ignore – champs du nouveau modèle de contacts Resend
    segmentIds: [segmentId],
    // @ts-ignore
    properties: { breed, source, consent_at: new Date().toISOString() },
  } as any);
  if (contact.error && !/already exists/i.test(contact.error.message || "")) {
    console.error("resend contact error", contact.error);
    return NextResponse.json({ error: "contact_failed" }, { status: 502 });
  }

  // 2) E-mail de confirmation (ne bloque pas l'inscription s'il échoue)
  const prenom = dog ? ` et ${dog}` : "";
  try {
    await resend.emails.send({
      from,
      to: email,
      subject: `C'est noté${prenom ? ` pour${prenom.replace(" et", "")}` : ""} : nous vous préviendrons`,
      text: [
        "Bonjour,",
        "",
        breed
          ? `Vous avez demandé à être prévenu quand le plan de prévention dédié à sa race (${breed}) sera prêt dans Stan & Will. C'est noté.`
          : "Vous avez demandé à être tenu au courant des nouveautés de Stan & Will. C'est noté.",
        "",
        "En attendant, l'app fonctionne déjà pour lui : bilan de vigilance, suivi du poids, balades, scanner et assistant.",
        "",
        "Une question sur votre chien ? Répondez simplement à cet e-mail.",
        "",
        "À très vite,",
        "Frédéric, Stan (7 ans, poil dur) et Will (3 ans, poil ras)",
        "",
        "—",
        "Stan & Will est édité par Eureca Design SRL. Vos données sont hébergées en Europe et ne sont jamais revendues. Pour ne plus recevoir nos e-mails, répondez « stop ».",
      ].join("\n"),
    });
  } catch (e) {
    console.error("confirmation email failed", e);
  }

  return NextResponse.json({ ok: true });
}
