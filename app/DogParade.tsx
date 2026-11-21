"use client";

import { useEffect, useRef, useState } from "react";
import { DOGS, DogLine, type BreedId } from "./DogLine";

/**
 * Bandeau du haut de page : les cinq races avancent à la queue leu leu, au trait, sur une ligne de sol.
 * De temps en temps la file s'arrête, un chien tourne les yeux vers le visiteur et aboie dans une petite bulle.
 * Purement décoratif (masqué aux lecteurs d'écran) ; immobile si l'appareil demande moins de mouvements.
 */
const ORDER: BreedId[] = ["teckel", "chihuahua", "cavalier", "bouledogue", "spitz"];
// La file est répétée : quand une moitié est sortie de l'écran, l'autre a pris sa place, sans à-coup.
const ROW = [...ORDER, ...ORDER, ...ORDER, ...ORDER];

export function DogParade() {
  const track = useRef<HTMLDivElement>(null);
  const [barking, setBarking] = useState<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let stop: ReturnType<typeof setTimeout>, go: ReturnType<typeof setTimeout>;
    const bark = () => {
      const dogs = Array.from(track.current?.children ?? []) as HTMLElement[];
      // Seuls les chiens entièrement à l'écran peuvent s'arrêter, pour que la bulle ne soit jamais coupée.
      const seen = dogs.map((el, i) => ({ i, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.left > 24 && r.right < window.innerWidth - 64);
      if (seen.length && !document.hidden) {
        setBarking(seen[Math.floor(Math.random() * seen.length)].i);
        go = setTimeout(() => setBarking(null), 2300);
      }
      stop = setTimeout(bark, 7000 + Math.random() * 4000);
    };
    stop = setTimeout(bark, 3500);
    return () => { clearTimeout(stop); clearTimeout(go); };
  }, []);

  return (
    <div className="parade" aria-hidden="true">
      <div ref={track} className={`parade-track${barking !== null ? " halt" : ""}`}>
        {ROW.map((b, i) => {
          const [ex, ey] = DOGS[b].eye;
          return (
            <span key={i} className={`parade-dog${barking === i ? " bark" : ""}`}>
              <DogLine breed={b} lookAtMe={barking === i} />
              {barking === i && (
                <span className="woof" style={{ left: `${(ex / 400) * 100}%`, bottom: `${100 - (ey / 240) * 100 + 22}%` }}>Wouf wouf !</span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
