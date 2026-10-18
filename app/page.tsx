import { Logo } from "./Logo";
import { WaitlistForm } from "./WaitlistForm";

const Icon = ({ d }: { d: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

export default function Page() {
  return (
    <main>
      <div className="wrap">
        <header className="header">
          <a className="logo" href="#">
            <Logo size={46} />
            Stan &amp; Will
          </a>
          <span className="badge">Paris Sausage Walk · 4 octobre 2026</span>
        </header>

        <section className="hero">
          <div>
            <h1>
              Stan a 7 ans, Will en a 3. <em>L'un a passé l'âge critique, l'autre y entre.</em>
            </h1>
            <p className="lead">
              Un teckel sur quatre connaîtra une hernie discale, le plus souvent entre 4 et 8 ans. Stan &amp; Will est
              l'app qui veille sur le dos, le poids et l'assiette de votre teckel, avec des conseils validés par des
              vétérinaires, et qui vous dit ce qui est prouvé et ce qui n'est qu'un mythe de forum.
            </p>
            <WaitlistForm />
          </div>
          <div>
            <div className="hero-img">
              <img src="/stan-will-jardin.jpg" alt="Stan, teckel à poil dur, et Will, teckel à poil ras, assis dans l'herbe" width={1200} height={1600} />
            </div>
            <p className="caption">Stan (à gauche, poil dur, 7 ans) et Will (poil ras, 3 ans).</p>
          </div>
        </section>

        <section className="stats" aria-label="Chiffres clés">
          <div className="stat">
            <div className="n">1 sur 4</div>
            <div className="t">des teckels aura une maladie du dos au cours de sa vie, 10 à 12 fois plus que les autres chiens.</div>
            <div className="s">Source : Dachshund IVDD UK, enquête sur 2 000 chiens</div>
          </div>
          <div className="stat">
            <div className="n">4 à 8 ans</div>
            <div className="t">la fenêtre où 76 % des hernies discales se déclarent. C'est maintenant que la prévention compte.</div>
            <div className="s">Source : Dachshund IVDD UK</div>
          </div>
          <div className="stat">
            <div className="n">1 200 à 2 800 €</div>
            <div className="t">le coût d'une chirurgie du dos avec rééducation, souvent exclu par l'assurance si elle est prise trop tard.</div>
            <div className="s">Source : HelloSafe, guide teckel 2026</div>
          </div>
        </section>

        <section className="section" id="app">
          <h2>Ce que l'app fera pour votre chien</h2>
          <p className="sub">
            Une réponse utile en moins d'une minute, puis un rituel de 60 secondes par jour. Stan s'occupe de la santé,
            Will de l'assiette.
          </p>
          <div className="features">
            <div className="feature">
              <div className="ico"><Icon d="M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z" /></div>
              <div>
                <h3>Le plan dos de votre teckel</h3>
                <p>Poids de forme, signes à surveiller, gestes qui comptent vraiment (et ceux qui ne servent à rien), protocole « que faire dans l'heure » en cas de doute.</p>
                <span className="who">Stan</span>
              </div>
            </div>
            <div className="feature">
              <div className="ico"><Icon d="M4 7h16M4 12h16M4 17h10M7 3v4M12 3v4M17 3v4" /></div>
              <div>
                <h3>Scan des croquettes</h3>
                <p>Scannez le code-barres : note claire, points forts et faibles, ration en grammes calculée pour votre chien, alternatives au même prix.</p>
                <span className="who">Will</span>
              </div>
            </div>
            <div className="feature">
              <div className="ico"><Icon d="M12 21s-7-4.5-7-10a7 7 0 0114 0c0 5.5-7 10-7 10z" /></div>
              <div>
                <h3>« Peut-il manger ça ? »</h3>
                <p>Une photo de ce qu'il réclame à table, une réponse immédiate en trois niveaux, avec la quantité tolérée.</p>
                <span className="who">Will</span>
              </div>
            </div>
            <div className="feature">
              <div className="ico"><Icon d="M8 10h8M8 14h5M21 12a9 9 0 11-4.2-7.6L21 3v9z" /></div>
              <div>
                <h3>L'assistant qui ne joue pas au vétérinaire</h3>
                <p>Posez vos questions à 2 h du matin : il vous dit « surveiller », « consulter cette semaine » ou « urgence », et vous oriente vers un vrai vétérinaire quand il le faut.</p>
                <span className="who">Stan</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section about">
          <img src="/stan-will-salon.jpg" alt="Will et Stan assis sur un tapis clair" width={1000} height={1333} />
          <div>
            <span className="pill">Pourquoi cette app existe</span>
            <h2 style={{ marginTop: 14 }}>On a construit l'app qu'on aurait voulu avoir pour eux.</h2>
            <blockquote>
              « Quand Stan a eu 4 ans, j'ai cherché partout quoi faire pour son dos. J'ai trouvé des forums, des avis
              contradictoires et beaucoup de peur. Rien de clair, rien de sourcé. Avec Will qui arrive à l'âge critique,
              j'ai décidé de le construire. »
            </blockquote>
            <p style={{ color: "var(--texte-doux)" }}>
              Frédéric, fondateur, et ses deux teckels. Chaque conseil de l'app porte sa source et son niveau de
              preuve, et tout le contenu santé est relu par un vétérinaire référent. Nous reversons 1 € par abonnement
              fondateur à l'association Teckels Sans Doux Foyer.
            </p>
            <p style={{ marginTop: 18 }}>
              <a className="btn" href="#inscription" style={{ display: "inline-block", width: "auto", textDecoration: "none" }}>
                Rejoindre les 500 fondateurs
              </a>
            </p>
          </div>
        </section>

        <footer className="footer">
          <div>
            © 2026 Stan &amp; Will · Édité par Pixglass SRL (Belgique) · <a href="/confidentialite">Confidentialité</a>
          </div>
          <div>
            contact : <a href="mailto:bonjour@stanandwill.com">bonjour@stanandwill.com</a> · Instagram &amp; TikTok : @stanandwill
          </div>
        </footer>
      </div>

      <div className="sticky-cta">
        <a className="btn" href="#inscription">Je rejoins les fondateurs · 29,99 € au lieu de 49,99 €</a>
      </div>
    </main>
  );
}
