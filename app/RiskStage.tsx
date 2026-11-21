"use client";

import { useEffect, useState } from "react";

/**
 * Pièce centrale de la page : un petit chien dessiné, et le point faible de chaque race qui s'allume tour à tour.
 * Chaque chiffre porte sa source (liste complète en bas de page). L'animation se met en pause au survol,
 * au clavier et quand on choisit une race ; elle est coupée si l'appareil demande moins de mouvements.
 */
type Zone = "dos" | "souffle" | "dents" | "coeur";

const BREEDS: { id: string; name: string; zone: Zone; where: string; fact: string; detail: string; source: string }[] = [
  {
    id: "teckel", name: "Teckel", zone: "dos", where: "Son dos",
    fact: "1 teckel sur 4",
    detail: "aura une maladie du dos au cours de sa vie, le plus souvent entre 4 et 8 ans. Le poids et les sauts comptent : cela se prépare.",
    source: "Dachshund IVDD UK",
  },
  {
    id: "bouledogue", name: "Bouledogue français", zone: "souffle", where: "Sa respiration",
    fact: "30 fois plus de risque",
    detail: "de syndrome obstructif des voies respiratoires que les autres chiens. Chaleur et effort se gèrent au quotidien.",
    source: "Royal Veterinary College, VetCompass, 2021",
  },
  {
    id: "chihuahua", name: "Chihuahua", zone: "dents", where: "Ses dents",
    fact: "13,5 % des chihuahuas",
    detail: "suivis par un vétérinaire ont une maladie des gencives : c'est le premier problème de la race, et le plus évitable.",
    source: "Royal Veterinary College, VetCompass, 2020",
  },
  {
    id: "cavalier", name: "Cavalier King Charles", zone: "coeur", where: "Son cœur",
    fact: "Un cœur à surveiller tôt",
    detail: "La maladie de la valve mitrale est particulièrement fréquente et précoce dans la race. Un souffle se dépiste, une respiration se compte.",
    source: "Journal of Veterinary Internal Medicine, 2017",
  },
];

/**
 * Silhouette de chaque race, dessinée à partir de quelques mesures : longueur et hauteur du corps, pattes,
 * museau, oreilles, queue. Un teckel est long et bas, un bouledogue trapu au museau court, un chihuahua minuscule
 * aux grandes oreilles, un cavalier aux longues oreilles tombantes.
 */
type Shape = { bodyW: number; bodyH: number; legH: number; legW: number; head: number; muzzle: number; ear: "tombante" | "dressee" | "longue"; tail: "haute" | "courte" | "panache" };
const SHAPES: Record<string, Shape> = {
  teckel: { bodyW: 250, bodyH: 70, legH: 44, legW: 22, head: 30, muzzle: 34, ear: "tombante", tail: "haute" },
  bouledogue: { bodyW: 168, bodyH: 92, legH: 62, legW: 26, head: 40, muzzle: 8, ear: "dressee", tail: "courte" },
  chihuahua: { bodyW: 128, bodyH: 60, legH: 60, legW: 15, head: 30, muzzle: 14, ear: "dressee", tail: "haute" },
  cavalier: { bodyW: 186, bodyH: 80, legH: 64, legW: 22, head: 33, muzzle: 22, ear: "longue", tail: "panache" },
};
const W = 400, H = 270, GROUND = 244, CHEST = 300;

function geometry(sh: Shape) {
  const bodyBottom = GROUND - sh.legH + 16;
  const bodyTop = bodyBottom - sh.bodyH;
  const bodyLeft = CHEST - sh.bodyW;
  const hx = CHEST + 6, hy = bodyTop - sh.head * 0.25;
  const muzzleEnd = hx + sh.head + sh.muzzle;
  const spots: Record<Zone, { x: number; y: number }> = {
    dos: { x: bodyLeft + sh.bodyW * 0.5, y: bodyTop + 2 },
    souffle: { x: muzzleEnd - 8, y: hy + sh.head * 0.2 },
    dents: { x: hx + sh.head * 0.75 + sh.muzzle * 0.5, y: hy + sh.head * 0.62 },
    coeur: { x: CHEST - 42, y: bodyTop + sh.bodyH * 0.62 },
  };
  return { bodyBottom, bodyTop, bodyLeft, hx, hy, muzzleEnd, spots };
}

function Dog({ id }: { id: string }) {
  const sh = SHAPES[id];
  const g = geometry(sh);
  const r = sh.head;
  const leg = (x: number, dark: boolean) => (
    <rect x={x} y={g.bodyBottom - 22} width={sh.legW} height={GROUND - g.bodyBottom + 22} rx={sh.legW / 2} fill={dark ? "#17493A" : "#1E5B45"} />
  );
  const tailBase = { x: g.bodyLeft + 10, y: g.bodyTop + sh.bodyH * 0.3 };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="presentation">
      <ellipse cx={(g.bodyLeft + g.muzzleEnd) / 2} cy={GROUND + 6} rx={(g.muzzleEnd - g.bodyLeft) / 2} ry="8" fill="#14291F" opacity=".08" />
      {sh.tail === "haute" && <path d={`M${tailBase.x} ${tailBase.y} C${tailBase.x - 22} ${tailBase.y - 10} ${tailBase.x - 30} ${tailBase.y - 34} ${tailBase.x - 20} ${tailBase.y - 54}`} fill="none" stroke="#1E5B45" strokeWidth="11" strokeLinecap="round" />}
      {sh.tail === "courte" && <circle cx={tailBase.x - 4} cy={tailBase.y} r="10" fill="#1E5B45" />}
      {sh.tail === "panache" && <path d={`M${tailBase.x} ${tailBase.y} C${tailBase.x - 30} ${tailBase.y + 6} ${tailBase.x - 46} ${tailBase.y + 30} ${tailBase.x - 40} ${tailBase.y + 52}`} fill="none" stroke="#1E5B45" strokeWidth="20" strokeLinecap="round" />}
      {leg(g.bodyLeft + 46, true)}
      {leg(CHEST - 66, true)}
      {leg(g.bodyLeft + 18, false)}
      {leg(CHEST - 36, false)}
      <rect x={g.bodyLeft} y={g.bodyTop} width={sh.bodyW + 10} height={sh.bodyH} rx={sh.bodyH / 2} fill="#1E5B45" />
      {/* cou */}
      <path d={`M${CHEST - 34} ${g.bodyTop + 8} L${g.hx - r * 0.5} ${g.hy - r * 0.2} L${g.hx + r * 0.5} ${g.hy + r * 0.8} L${CHEST + 8} ${g.bodyTop + sh.bodyH * 0.7} Z`} fill="#1E5B45" />
      {/* museau puis tête */}
      <rect x={g.hx} y={g.hy - r * 0.05} width={r + sh.muzzle} height={r * 0.82} rx={r * 0.36} fill="#1E5B45" />
      <circle cx={g.hx} cy={g.hy} r={r} fill="#1E5B45" />
      <circle cx={g.muzzleEnd - 4} cy={g.hy + r * 0.12} r="6.5" fill="#14291F" />
      <circle cx={g.hx + r * 0.4} cy={g.hy - r * 0.22} r="4.2" fill="#FBF8F2" />
      {sh.ear === "tombante" && <path d={`M${g.hx - r * 0.55} ${g.hy - r * 0.8} C${g.hx - r * 1.25} ${g.hy - r * 0.3} ${g.hx - r * 1.2} ${g.hy + r * 0.9} ${g.hx - r * 0.5} ${g.hy + r * 1.05} C${g.hx - r * 0.1} ${g.hy + r * 0.4} ${g.hx - r * 0.05} ${g.hy - r * 0.3} ${g.hx - r * 0.55} ${g.hy - r * 0.8} Z`} fill="#14291F" />}
      {sh.ear === "longue" && <path d={`M${g.hx - r * 0.5} ${g.hy - r * 0.85} C${g.hx - r * 1.45} ${g.hy - r * 0.2} ${g.hx - r * 1.5} ${g.hy + r * 1.5} ${g.hx - r * 0.75} ${g.hy + r * 1.75} C${g.hx - r * 0.15} ${g.hy + r * 1.3} ${g.hx + r * 0.1} ${g.hy} ${g.hx - r * 0.5} ${g.hy - r * 0.85} Z`} fill="#14291F" />}
      {sh.ear === "dressee" && <path d={`M${g.hx - r * 0.85} ${g.hy - r * 0.45} L${g.hx - r * 0.75} ${g.hy - r * 1.6} L${g.hx + r * 0.2} ${g.hy - r * 0.95} Z`} fill="#14291F" stroke="#14291F" strokeWidth="8" strokeLinejoin="round" />}
      {/* collier miel */}
      <path d={`M${g.hx - r * 0.75} ${g.hy + r * 0.72} L${g.hx + r * 0.2} ${g.hy + r * 1.05}`} fill="none" stroke="#F2B544" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

export function RiskStage() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % BREEDS.length), 4200);
    return () => clearInterval(t);
  }, [paused]);

  const b = BREEDS[i];
  const spot = geometry(SHAPES[b.id]).spots[b.zone];

  return (
    <div className="stage" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)}>
      <div className="stage-tabs" role="tablist" aria-label="Choisir une race">
        {BREEDS.map((x, n) => (
          <button key={x.id} role="tab" aria-selected={n === i} className={n === i ? "on" : ""} onClick={() => { setI(n); setPaused(true); }}>
            {x.name}
          </button>
        ))}
      </div>

      <div className="stage-body">
        <div className="dog" aria-hidden="true">
          <Dog id={b.id} />
          <span key={b.id} className={b.zone === "souffle" || b.zone === "dents" ? "spot below" : "spot"} style={{ left: `${(spot.x / W) * 100}%`, top: `${(spot.y / H) * 100}%` }}>
            <span className="spot-ring" />
            <span className="spot-dot" />
            <span className="spot-label">{b.where}</span>
          </span>
        </div>

        <div className="stage-text" key={b.id} aria-live="polite">
          <p className="stage-breed">{b.name}</p>
          <p className="stage-fact">{b.fact}</p>
          <p className="stage-detail">{b.detail}</p>
          <p className="stage-source">Source : {b.source}</p>
        </div>
      </div>

      <div className="stage-progress" aria-hidden="true">
        {BREEDS.map((x, n) => <span key={x.id} className={n === i ? (paused ? "on still" : "on") : ""} />)}
      </div>
    </div>
  );
}
