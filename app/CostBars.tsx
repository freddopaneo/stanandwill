"use client";

import { useEffect, useRef, useState } from "react";

/**
 * « Ce que coûte l'imprévu » : fourchettes de prix observées en France, face au prix de l'app.
 * Les barres se déploient une fois, quand le graphique arrive à l'écran.
 */
const ROWS: { label: string; min: number; max: number; source: string }[] = [
  { label: "Une consultation", min: 30, max: 60, source: "LeComparateurAssurance, 2026" },
  { label: "Un scanner en urgence", min: 500, max: 1500, source: "LeComparateurAssurance, 2026" },
  { label: "Une chirurgie orthopédique", min: 1000, max: 3000, source: "LeComparateurAssurance, 2026" },
  { label: "Une opération de hernie discale", min: 2500, max: 6000, source: "Ymanci, tarifs 2025-2026" },
];
const TOP = 6000;
const eur = (n: number) => n.toLocaleString("fr-FR") + " €";

export function CostBars() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { setShown(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={shown ? "costs shown" : "costs"}>
      {ROWS.map((r, n) => (
        <div className="cost" key={r.label}>
          <div className="cost-head">
            <span className="cost-label">{r.label}</span>
            <span className="cost-value">{eur(r.min)} à {eur(r.max)}</span>
          </div>
          <div className="cost-track">
            <span className="cost-bar" style={{ width: `${Math.max(2, (r.max / TOP) * 100)}%`, transitionDelay: `${n * 140}ms` }} />
          </div>
          <span className="cost-source">Source : {r.source}</span>
        </div>
      ))}
      <div className="cost ours">
        <div className="cost-head">
          <span className="cost-label">Stan &amp; Will, pour prévenir toute l'année</span>
          <span className="cost-value">49,99 € par an</span>
        </div>
        <div className="cost-track">
          <span className="cost-bar" style={{ width: "2%", transitionDelay: "620ms" }} />
        </div>
      </div>
      <p className="cost-note">
        Fourchettes indicatives, variables selon la clinique et la région. Une app ne remplace ni le vétérinaire ni
        une assurance : elle aide à repérer tôt et à prendre les bonnes habitudes.
      </p>
    </div>
  );
}
