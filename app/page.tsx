import { Logo } from "./Logo";
import { RiskStage } from "./RiskStage";
import { CostBars } from "./CostBars";
import { DogParade } from "./DogParade";
import { launchActive } from "../lib/launch";

/** La page est recalculée au plus une fois par heure : le prix de lancement disparaît tout seul après le 31 décembre. */
export const revalidate = 3600;

/** Adresse de l'application web (PWA). À remplacer par le domaine définitif via NEXT_PUBLIC_APP_URL. */
const APP = process.env.NEXT_PUBLIC_APP_URL || "https://app.stanandwill.com";

const CONTENTS: { title: string; text: string }[] = [
  { title: "Son bilan de vigilance", text: "Trois minutes de questions sur sa race, son âge, son poids et sa silhouette. Vous repartez avec ses points de vigilance, classés par priorité." },
  { title: "Un geste par semaine", text: "Un plan de prévention court et concret : quoi vérifier, quoi changer, quoi laisser tomber. Chaque conseil indique sa source." },
  { title: "Ses balades comptées", text: "Durée, distance, pas estimés selon son gabarit, objectif du jour. À l'arrivée : la carte du parcours et vos photos." },
  { title: "« Peut-il manger ça ? »", text: "Tapez un aliment ou prenez une photo : réponse immédiate, avec la conduite à tenir s'il en a déjà avalé." },
  { title: "Une réponse à 2 h du matin", text: "L'assistant ne joue pas au vétérinaire : il vous dit « à surveiller », « à montrer cette semaine » ou « urgence », et pourquoi." },
  { title: "Son carnet de santé", text: "Poids, vaccins, événements, fiche d'urgence : tout ce que le vétérinaire vous demandera, déjà rangé." },
];

const SOURCES: { label: string; href?: string }[] = [
  { label: "Dachshund IVDD UK, enquête de santé sur les teckels (maladie du dos, âge d'apparition)" },
  { label: "Royal Veterinary College, programme VetCompass, 2021 : santé du bouledogue français", href: "https://rvc.ac.uk/vetcompass/news/stop-and-think-before-buying-a-flat-faced-dog-french-bulldog-no-longer-a-typical-dog" },
  { label: "O'Neill et al., BMC Veterinary Research, 2020 : affections courantes du chihuahua", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7014602" },
  { label: "Swift et al., Journal of Veterinary Internal Medicine, 2017 : maladie valvulaire du cavalier King Charles", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5259630" },
  { label: "LeComparateurAssurance, frais vétérinaires pour un chien, 2026", href: "https://www.lecomparateurassurance.com/15-prix-tarifs/106075-prix-soins-veterinaires-france" },
  { label: "Ymanci, prix des pathologies lourdes du chien, tarifs 2025-2026", href: "https://ymanci.fr/assurance-animaux/actualites/sous-estimation-prix-pathologies-lourdes-chien-chat/" },
];

export default function Page() {
  const launch = launchActive();
  return (
    <main>
      <div className="wrap">
        <header className="header">
          <a className="logo" href="/">
            <Logo size={46} />
            Stan &amp; Will
          </a>
          <a className="header-link" href={APP}>Ouvrir l'app</a>
        </header>
      </div>

      <DogParade />

      <section className="hero">
        <div className="wrap hero-inner">
          <p className="hero-kicker">L'application de prévention santé des petits chiens</p>
          <h1><span>Il ne vous dira jamais qu'il a mal.</span> <span>La prévention, c'est le voir à temps.</span></h1>
          <p className="hero-lead">
            Un petit chien cache sa douleur jusqu'au jour où il n'y arrive plus. Dos, souffle, dents, cœur : chaque
            race a ses points faibles, et les premiers signes tiennent à presque rien. Stan &amp; Will vous apprend à
            les reconnaître chez le vôtre, semaine après semaine, pour agir tant qu'il est encore temps.
          </p>
          <a className="cta" href={APP}>Créer la fiche de mon chien</a>
          <p className="hero-note">Trois minutes, gratuit, sans carte bancaire. S'installe sur votre téléphone, sans passer par un store.</p>
        </div>
      </section>

      <section className="band" aria-labelledby="t-races">
        <div className="wrap">
          <h2 id="t-races">Chaque race a son point faible. Le connaître, c'est déjà le protéger.</h2>
          <RiskStage />
          <p className="band-note">
            Plans de prévention complets aujourd'hui : teckel, bouledogue français, chihuahua, spitz nain et cavalier
            King Charles. Autre race ou croisé ? Le bilan général fonctionne déjà, et vous pouvez demander le plan
            dédié depuis l'app.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="t-couts">
        <div className="wrap split">
          <div>
            <h2 id="t-couts">Le jour où ça arrive, on se demande toujours si on aurait pu le voir venir.</h2>
            <p className="sub">
              Un chien qui hésite devant le canapé. Une toux après le jeu. Une haleine qui change. Pris à temps, ce
              sont des habitudes à ajuster. Pris tard, ce sont des nuits d'inquiétude, et des factures que personne
              n'avait prévues.
            </p>
            <p className="sub">
              La prévention ne supprime pas le risque. Elle vous donne des mois d'avance, et des gestes simples pour
              les utiliser.
            </p>
          </div>
          <CostBars />
        </div>
      </section>

      <section className="section tinted" aria-labelledby="t-contenu">
        <div className="wrap">
          <h2 id="t-contenu">Tout ce qu'il faut savoir sur lui, dans votre poche.</h2>
          <p className="sub">Six outils qui tiennent dans une seule application, pensés pour deux minutes par jour.</p>
          <div className="contents">
            {CONTENTS.map((c) => (
              <div className="content" key={c.title}>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="t-pourquoi">
        <div className="wrap about">
          <img src="/stan-will-jardin.jpg" alt="Stan, teckel à poil dur, et Will, teckel à poil ras, assis dans l'herbe" width={900} height={1200} />
          <div>
            <h2 id="t-pourquoi">On a construit l'app qu'on aurait voulu avoir pour eux.</h2>
            <blockquote>
              « Quand Stan a eu 4 ans, j'ai cherché partout quoi faire pour son dos. J'ai trouvé des forums, des avis
              contradictoires et beaucoup de peur. Rien de clair, rien de sourcé. Avec Will qui arrive à l'âge
              critique, j'ai décidé de le construire. »
            </blockquote>
            <p className="about-sign">Frédéric, avec Stan (7 ans, poil dur) et Will (3 ans, poil ras).</p>
            <p className="sub">
              Les groupes de passionnés ne manquent pas, et on y trouve du bon comme du moins bon. Ce qui manquait,
              c'est un outil pour vous, le maître : toutes les informations utiles sur sa race au même endroit,
              triées, sourcées, avec ce qui est prouvé et ce qui n'est qu'une légende de forum. Tout le contenu santé
              est relu par notre vétérinaire référent.
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="t-offre">
        <div className="wrap offer-wrap">
          <h2 id="t-offre">Commencez gratuitement. Abonnez-vous sans risque.</h2>
          <p className="sub center">
            Le bilan de votre chien est gratuit. Le plan de prévention complet s'ouvre avec un abonnement, sans
            engagement, satisfait ou remboursé pendant 14 jours.
          </p>
          <div className="plans">
            <div className="plan best">
              {launch ? (
                <>
                  <p className="plan-tag">Prix de lancement, jusqu'au 31 décembre</p>
                  <h3>Annuel</h3>
                  <p className="plan-price">40 € <span>la première année</span> <s>49,99 €</s></p>
                  <p className="plan-text">Soit 3,33 € par mois. Ensuite 49,99 € par an, résiliable à tout moment.</p>
                </>
              ) : (
                <>
                  <p className="plan-tag">Le plus choisi</p>
                  <h3>Annuel</h3>
                  <p className="plan-price">49,99 € <span>par an</span></p>
                  <p className="plan-text">Soit 4,17 € par mois : 58 % d'économie par rapport au mensuel.</p>
                </>
              )}
            </div>
            <div className="plan">
              <h3>Mensuel</h3>
              <p className="plan-price">9,99 € <span>par mois</span></p>
              <p className="plan-text">Sans engagement, résiliable à tout moment.</p>
            </div>
            <div className="plan">
              <h3>Hebdomadaire</h3>
              <p className="plan-price">6,99 € <span>par semaine</span></p>
              <p className="plan-text">Pour un besoin ponctuel.</p>
            </div>
          </div>
          <a className="cta" href={APP}>Créer la fiche de mon chien</a>
          <p className="hero-note">
            Satisfait ou remboursé pendant 14 jours, sur simple e-mail. Jusqu'à 3 chiens sur le même compte. Paiement
            sécurisé par Stripe.
          </p>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap">
          <details className="sources">
            <summary>Sources des chiffres de cette page</summary>
            <ul>
              {SOURCES.map((s) => (
                <li key={s.label}>{s.href ? <a href={s.href} rel="noopener">{s.label}</a> : s.label}</li>
              ))}
            </ul>
          </details>
          <p>Stan &amp; Will ne pose pas de diagnostic et ne remplace pas une consultation vétérinaire.</p>
          <p>
            © 2026 Stan &amp; Will, édité par Eureca Design SRL (Belgique). <a href="/confidentialite">Confidentialité</a>.
            Contact : <a href="mailto:bonjour@stanandwill.com">bonjour@stanandwill.com</a>
          </p>
        </div>
      </footer>
    </main>
  );
}
