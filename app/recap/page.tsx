import { Logo } from "../Logo";

export const metadata = { title: "Récap du dimanche — Stan & Will", robots: { index: false } };

/**
 * Page de confirmation après un clic sur « Ne plus recevoir le récap du dimanche ».
 * La désinscription est faite par la fonction Supabase `email-prefs`, qui redirige ici avec ?statut=ok|invalide|erreur
 * (les fonctions Supabase ne peuvent pas afficher de page HTML elles-mêmes).
 */
const MESSAGES = {
  ok: {
    emoji: "🐾",
    title: "C'est noté",
    text: "Vous ne recevrez plus le récap du dimanche. Vous pouvez le réactiver à tout moment dans l'app : Carnet → Réglages → Récap du dimanche.",
  },
  invalide: {
    emoji: "🔗",
    title: "Lien invalide",
    text: "Ce lien de désinscription n'est pas (ou plus) valide. Vous pouvez arrêter le récap directement dans l'app : Carnet → Réglages → Récap du dimanche.",
  },
  erreur: {
    emoji: "⏳",
    title: "Un instant…",
    text: "La désinscription n'a pas abouti. Réessayez dans quelques minutes depuis l'e-mail, ou coupez le récap dans l'app : Carnet → Réglages.",
  },
} as const;

export default async function Recap({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const { statut } = await searchParams;
  const m = MESSAGES[(statut as keyof typeof MESSAGES) ?? "ok"] ?? MESSAGES.invalide;
  return (
    <main className="wrap" style={{ maxWidth: 560, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="header">
        <a className="logo" href="/"><Logo size={46} />Stan &amp; Will</a>
      </header>
      <section style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 60 }}>
        <div style={{ background: "var(--blanc)", border: "1px solid #E6E0D4", borderRadius: 20, padding: 28, textAlign: "center", width: "100%" }}>
          <div style={{ fontSize: 44 }} aria-hidden>{m.emoji}</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--foret-fonce)", margin: "8px 0 10px" }}>{m.title}</h1>
          <p style={{ fontSize: 16, color: "var(--texte)" }}>{m.text}</p>
          <p style={{ fontSize: 13, color: "var(--texte-doux)", marginTop: 18 }}>Les e-mails liés à votre compte (code de connexion) restent envoyés normalement.</p>
        </div>
      </section>
    </main>
  );
}
