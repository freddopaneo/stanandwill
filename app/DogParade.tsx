import { DogLine, type BreedId } from "./DogLine";

/**
 * Bandeau du haut de page : les cinq races défilent à la queue leu leu, au trait, sur une ligne de sol.
 * Purement décoratif (masqué aux lecteurs d'écran) ; immobile si l'appareil demande moins de mouvements.
 */
const ORDER: BreedId[] = ["teckel", "chihuahua", "cavalier", "bouledogue", "spitz"];

export function DogParade() {
  // La file est répétée : quand la première moitié est sortie de l'écran, la seconde a pris sa place, sans à-coup.
  const row = [...ORDER, ...ORDER, ...ORDER, ...ORDER];
  return (
    <div className="parade" aria-hidden="true">
      <div className="parade-track">
        {row.map((b, i) => <DogLine key={i} breed={b} className="parade-dog" />)}
      </div>
    </div>
  );
}
