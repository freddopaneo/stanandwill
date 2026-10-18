import { Logo } from "../Logo";

export const metadata = { title: "Confidentialité — Stan & Will" };

export default function Confidentialite() {
  return (
    <main className="wrap" style={{ maxWidth: 760, paddingBottom: 60 }}>
      <header className="header">
        <a className="logo" href="/"><Logo size={46} />Stan &amp; Will</a>
      </header>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--foret-fonce)", marginBottom: 16 }}>Politique de confidentialité</h1>
      <p style={{ color: "var(--texte-doux)", marginBottom: 18 }}>Version du 3 octobre 2026 — liste d'attente avant lancement.</p>

      <h2 style={h2}>Qui traite vos données</h2>
      <p style={p}>Pixglass SRL (Belgique), éditeur de Stan &amp; Will. Contact : bonjour@stanandwill.com.</p>

      <h2 style={h2}>Ce que nous collectons</h2>
      <p style={p}>Votre adresse e-mail, et si vous le souhaitez le prénom et la race de votre chien, ainsi que la date et la source de votre inscription. Rien d'autre.</p>

      <h2 style={h2}>Pourquoi</h2>
      <p style={p}>Pour vous prévenir du lancement de l'app, vous réserver l'offre fondateurs, et vous envoyer au maximum un e-mail par semaine sur l'avancement du projet. Base légale : votre consentement, donné en cochant la case du formulaire.</p>

      <h2 style={h2}>Où et combien de temps</h2>
      <p style={p}>Vos données sont hébergées dans l'Union européenne (prestataire d'envoi d'e-mails Resend, région UE). Elles sont conservées jusqu'à votre désinscription, et au plus tard 12 mois après le lancement si vous n'avez pas créé de compte.</p>

      <h2 style={h2}>Vos droits</h2>
      <p style={p}>Vous pouvez à tout moment vous désinscrire (lien dans chaque e-mail ou réponse « stop »), demander l'accès, la correction ou la suppression de vos données en écrivant à bonjour@stanandwill.com. Vous pouvez aussi saisir l'Autorité de protection des données (Belgique) ou la CNIL (France).</p>

      <h2 style={h2}>Ce que nous ne faisons pas</h2>
      <p style={p}>Nous ne vendons ni ne louons vos données, nous n'utilisons pas de cookies publicitaires sur cette page, et nous ne vous écrirons jamais plus d'une fois par semaine.</p>
    </main>
  );
}

const h2: React.CSSProperties = { fontSize: 20, fontWeight: 800, color: "var(--foret)", margin: "22px 0 6px" };
const p: React.CSSProperties = { color: "var(--texte)", fontSize: 16 };
