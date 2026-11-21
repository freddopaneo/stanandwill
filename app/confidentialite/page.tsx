import { Logo } from "../Logo";

export const metadata = { title: "Confidentialité — Stan & Will" };

/**
 * Politique de confidentialité du site et de l'application.
 * Le passage entre crochets [À confirmer…] (section 11) est à lever avec le juriste avant la mise en ligne.
 */
export default function Confidentialite() {
  return (
    <main className="wrap legal">
      <header className="header">
        <a className="logo" href="/"><Logo size={46} />Stan &amp; Will</a>
      </header>
      <h1>Politique de confidentialité</h1>
      <p className="legal-version">Version du 21 novembre 2026</p>
      <p>Cette page explique quelles données Stan &amp; Will traite, pourquoi, où elles sont conservées et comment exercer vos droits. Elle couvre le site stanandwill.com et l'application Stan &amp; Will (version web et applications mobiles).</p>

      <h2>1. Qui est responsable de vos données</h2>
      <p>Stan &amp; Will est édité par Eureca Design SRL, société de droit belge. Siège social : Drève Richelle 161, bte 15, WOP, bâtiment D, 1410 Waterloo, Belgique. Numéro d'entreprise : 0537.183.030.</p>
      <p>Pour toute question sur vos données : bonjour@stanandwill.com.</p>

      <h2>2. Les données que nous traitons</h2>
      <p>Nous ne demandons que ce qui sert à la prévention santé de votre chien.</p>
      <ul>
        <li>Votre compte : votre adresse e-mail, vos choix de consentement (e-mails, statistiques), la langue et le pays.</li>
        <li>Votre chien : son prénom, sa race, sa variété, son sexe, son mois de naissance, son poids, sa silhouette, sa stérilisation et les antécédents que vous déclarez.</li>
        <li>Son carnet : pesées, événements de santé, documents que vous ajoutez, gestes de prévention réalisés.</li>
        <li>Ses balades : date, durée, distance et pas estimés. Le tracé GPS et les photos de balade restent sur votre téléphone (voir la section 4).</li>
        <li>Le scanner et l'assistant : les aliments ou photos que vous soumettez, vos questions et les réponses données, ainsi que le nombre d'utilisations par jour.</li>
        <li>Votre abonnement : son statut (essai, actif, expiré) et l'identifiant client attribué par notre prestataire de paiement. Nous ne voyons ni ne conservons jamais votre numéro de carte.</li>
        <li>Les données techniques : rapports de plantage sans donnée personnelle, et, seulement si vous l'acceptez, des statistiques d'usage anonymes.</li>
      </ul>
      <p>Nous ne collectons aucune donnée de santé vous concernant : les informations de santé portent uniquement sur votre chien.</p>

      <h2>3. Pourquoi, et sur quelle base</h2>
      <ul>
        <li>Vous fournir l'application (bilan, plan de prévention, carnet, balades, scanner, assistant) : exécution du contrat qui nous lie.</li>
        <li>Gérer votre abonnement et vos paiements : exécution du contrat et obligations comptables légales.</li>
        <li>Vous envoyer les e-mails de service (code de connexion, bienvenue, confirmation d'abonnement) : exécution du contrat.</li>
        <li>Vous envoyer le récap du dimanche et les conseils de saison : votre consentement, que vous retirez en un clic depuis chaque e-mail ou depuis les réglages.</li>
        <li>Mesurer l'usage de l'application de façon anonyme : votre consentement, désactivé par défaut.</li>
        <li>Détecter et corriger les plantages : notre intérêt légitime à assurer la sécurité et le bon fonctionnement du service.</li>
      </ul>

      <h2>4. Ce qui reste sur votre téléphone</h2>
      <p>Certaines données ne quittent jamais votre appareil et ne nous sont pas transmises :</p>
      <ul>
        <li>le tracé GPS de vos balades, utilisé pour afficher la carte du parcours ;</li>
        <li>les photos prises pendant une balade ;</li>
        <li>la balade en cours, sauvegardée pour ne pas être perdue si l'application se ferme.</li>
      </ul>
      <p>Ces données sont effacées quand vous supprimez la balade ou réinitialisez l'application. Elles ne sont pas retrouvées si vous changez de téléphone.</p>

      <h2>5. L'intelligence artificielle</h2>
      <p>Le scanner et l'assistant utilisent un modèle d'intelligence artificielle. Leurs réponses sont produites automatiquement, à partir de contenus relus par notre vétérinaire référent. Elles ne constituent pas un diagnostic et ne remplacent pas une consultation vétérinaire.</p>
      <p>Le modèle reçoit le profil de votre chien et votre question ou votre photo. Il ne reçoit jamais votre identité : ni votre adresse e-mail, ni votre nom.</p>
      <p>Les situations d'urgence sont repérées par des règles fixes, indépendantes du modèle, afin que l'orientation vers un vétérinaire ne dépende jamais de l'intelligence artificielle seule.</p>

      <h2>6. Nos prestataires</h2>
      <p>Nous faisons appel à des prestataires qui traitent des données pour notre compte, dans le cadre de contrats conformes au RGPD.</p>
      <ul>
        <li>Supabase (Union européenne, Francfort) : base de données, comptes et stockage.</li>
        <li>Vercel : hébergement du site, de l'application web et du serveur (région de Francfort pour les traitements).</li>
        <li>Stripe : paiement des abonnements pris sur le web. Apple et Google pour les achats réalisés dans leurs boutiques, via RevenueCat.</li>
        <li>Resend : envoi des e-mails.</li>
        <li>Anthropic : modèle d'intelligence artificielle du scanner et de l'assistant.</li>
        <li>Sentry (Union européenne) : rapports de plantage.</li>
        <li>PostHog (Union européenne) : statistiques anonymes, uniquement avec votre accord.</li>
        <li>Open-Meteo : météo du jour, à partir d'une position arrondie à environ un kilomètre.</li>
        <li>OpenStreetMap : fond de carte des balades. Votre appareil télécharge les images de la zone affichée ; le tracé lui-même n'est pas transmis.</li>
      </ul>
      <p>Certains de ces prestataires peuvent traiter des données en dehors de l'Union européenne, notamment aux États-Unis. Ces transferts sont encadrés par les clauses contractuelles types de la Commission européenne ou par une décision d'adéquation.</p>
      <p>Nous ne vendons ni ne louons vos données, et nous n'affichons aucune publicité.</p>

      <h2>7. Combien de temps nous conservons vos données</h2>
      <ul>
        <li>Compte, chiens et carnet : tant que votre compte existe.</li>
        <li>Photos envoyées au scanner : supprimées au plus tard 30 jours après l'analyse.</li>
        <li>Questions posées à l'assistant et réponses : tant que votre compte est actif.</li>
        <li>Données de facturation : 7 ans, durée imposée par la loi comptable.</li>
        <li>Demande à être prévenu de l'arrivée d'un plan pour une race : jusqu'à votre désinscription.</li>
        <li>Après suppression du compte : vos données et vos fichiers sont effacés.</li>
      </ul>

      <h2>8. Vos droits</h2>
      <p>Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité. Vous pouvez retirer un consentement à tout moment.</p>
      <ul>
        <li>Exporter vos données : dans l'application, Carnet, puis Réglages.</li>
        <li>Supprimer votre compte et vos données : dans l'application, Carnet, puis Réglages.</li>
        <li>Arrêter les e-mails : lien de désinscription dans chaque e-mail, ou Réglages.</li>
        <li>Toute autre demande : bonjour@stanandwill.com. Nous répondons dans un délai d'un mois.</li>
      </ul>
      <p>Vous pouvez aussi introduire une réclamation auprès de l'Autorité de protection des données (Belgique) ou de la CNIL (France).</p>

      <h2>9. Stockage sur votre appareil et cookies</h2>
      <p>L'application enregistre sur votre appareil ce qui lui permet de fonctionner : votre session, les données de votre chien et vos réglages. Le site et l'application n'utilisent aucun cookie publicitaire ni traceur tiers à des fins de publicité.</p>
      <p>Les statistiques d'usage ne sont activées que si vous dites oui, et vous pouvez changer d'avis dans les réglages.</p>

      <h2>10. Sécurité</h2>
      <p>Les échanges sont chiffrés. Chaque compte n'accède qu'à ses propres données, par des règles appliquées au niveau de la base de données. Les clés qui donnent accès aux services tiers ne sont jamais placées dans l'application.</p>

      <h2>11. Mineurs</h2>
      <p>Stan &amp; Will s'adresse aux personnes majeures. [À confirmer avec le juriste : âge minimal et mention à retenir.]</p>

      <h2>12. Évolution de cette politique</h2>
      <p>Nous mettons cette page à jour quand l'application évolue. En cas de changement important, nous vous prévenons dans l'application ou par e-mail avant son entrée en vigueur.</p>
    </main>
  );
}
