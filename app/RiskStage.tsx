"use client";

import { useEffect, useState } from "react";
import { DOGS, DogLine, type BreedId, type Zone } from "./DogLine";

/**
 * Pièce centrale de la page : chaque race dessinée au trait, et son point faible qui s'allume tour à tour.
 * Chaque chiffre porte sa source (liste complète en bas de page). L'animation se met en pause au survol,
 * au clavier et quand on choisit une race ; elle est coupée si l'appareil demande moins de mouvements.
 */
const BREEDS: { id: BreedId; name: string; zone: Zone; where: string; fact: string; detail: string; source: string }[] = [
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
  const spot = DOGS[b.id].zones[b.zone] ?? [200, 120];

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
          <DogLine breed={b.id} key={`dessin-${b.id}`} />
          <span key={`point-${b.id}`} className={b.zone === "souffle" || b.zone === "dents" ? "spot below" : "spot"} style={{ left: `${(spot[0] / 400) * 100}%`, top: `${(spot[1] / 240) * 100}%` }}>
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
