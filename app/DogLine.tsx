/**
 * Les cinq races en dessin au trait : un seul contour fin, sans remplissage, pour rester léger et élégant.
 * Profil tourné vers la droite, dans un cadre 400 × 240. `zones` donne l'emplacement des points faibles sur le dessin.
 */
export type BreedId = "teckel" | "bouledogue" | "chihuahua" | "cavalier" | "spitz";
export type Zone = "dos" | "souffle" | "dents" | "coeur";

type Drawing = { body: string; ear: string; eye: [number, number]; zones: Partial<Record<Zone, [number, number]>> };

export const DOGS: Record<BreedId, Drawing> = {
  // Long et bas, museau fin, oreille tombante
  teckel: {
    body: "M34 96 C40 112 54 122 74 124 C128 114 200 112 250 114 C262 102 272 86 288 76 C300 66 320 66 332 78 L368 94 C379 98 379 108 368 110 L336 116 C322 120 310 124 304 134 C302 148 298 158 294 166 L294 196 C294 202 290 204 284 204 L272 204 L272 170 C220 176 150 176 112 170 L112 196 C112 202 108 204 102 204 L90 204 L88 164 C74 154 70 138 74 124",
    ear: "M298 76 C286 88 285 112 297 124 C309 114 313 94 305 78",
    eye: [330, 86],
    zones: { dos: [166, 113], coeur: [270, 146] },
  },
  // Trapu, grosse tête, museau court, oreilles droites et arrondies
  bouledogue: {
    body: "M124 124 C116 122 112 128 118 134 C150 118 208 116 242 122 C250 108 254 94 260 84 C254 66 258 46 270 42 C282 44 286 60 286 74 C296 70 310 72 318 80 C330 88 336 98 333 108 C336 116 330 124 318 126 C306 130 296 134 292 144 C296 162 292 176 288 184 L288 206 C288 212 284 214 278 214 L266 214 L266 184 C230 190 190 188 164 182 L164 206 C164 212 160 214 154 214 L142 214 L138 180 C122 170 114 150 118 134",
    ear: "M286 74 C290 58 296 46 306 46 C314 52 314 66 310 74",
    eye: [306, 92],
    zones: { souffle: [330, 104], coeur: [262, 156] },
  },
  // Minuscule, crâne rond, grandes oreilles, queue relevée
  chihuahua: {
    body: "M156 92 C142 102 140 124 152 138 C180 132 220 132 246 136 C250 124 254 112 258 104 C252 86 252 68 256 58 C268 60 278 74 282 90 C292 86 304 90 308 100 L326 110 C333 114 331 122 322 123 L304 125 C296 129 290 135 288 143 C290 157 288 167 284 173 L284 208 C284 213 281 215 276 215 L270 215 L270 177 C240 181 210 179 190 173 L190 208 C190 213 187 215 182 215 L176 215 L172 169 C158 161 150 150 152 138",
    ear: "M282 90 C284 76 290 64 300 60 C306 68 306 82 300 92",
    eye: [297, 102],
    zones: { dents: [316, 119], coeur: [262, 152] },
  },
  // Élégant, longues oreilles tombantes, queue en panache
  cavalier: {
    body: "M70 152 C58 132 76 112 104 120 C150 110 210 110 246 116 C256 102 264 88 276 78 C290 66 312 68 322 82 L350 96 C359 100 359 110 350 112 L324 116 C312 122 302 130 298 142 C300 160 296 174 292 182 L292 208 C292 213 288 215 282 215 L272 215 L272 184 C230 190 180 188 146 180 L146 208 C146 213 142 215 136 215 L126 215 L122 174 C106 162 98 140 104 120",
    ear: "M286 72 C268 88 264 124 276 150 C292 146 302 120 300 86",
    eye: [319, 88],
    zones: { coeur: [262, 152], dos: [176, 111] },
  },
  // Petit renard tout rond, queue enroulée sur le dos
  spitz: {
    body: "M184 110 C198 96 196 70 170 66 C134 62 120 102 150 122 C146 142 160 160 180 168 L184 208 C184 213 187 215 192 215 L200 215 L200 174 C220 180 250 180 276 172 L276 208 C276 213 279 215 284 215 L292 215 L292 160 C300 144 302 126 306 114 L322 112 C329 111 331 105 326 102 L308 92 C304 84 296 78 286 78 C284 70 278 62 270 60 C266 68 266 76 268 82 C262 88 256 98 250 108 C232 104 206 104 184 110",
    ear: "M286 78 C288 70 292 64 298 62 C302 68 302 76 298 84",
    eye: [298, 94],
    zones: { coeur: [268, 150] },
  },
};

export function DogLine({ breed, className, lookAtMe }: { breed: BreedId; className?: string; lookAtMe?: boolean }) {
  const d = DOGS[breed];
  return (
    <svg className={className} viewBox="0 0 400 240" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d.body} />
      <path d={d.ear} />
      <circle cx={d.eye[0]} cy={d.eye[1]} r={lookAtMe ? 3.4 : 2.4} fill="currentColor" stroke="none" />
      {/* Le second œil n'apparaît que lorsque le chien se tourne vers le visiteur */}
      {lookAtMe && <circle cx={d.eye[0] - 14} cy={d.eye[1] + 1} r="3.4" fill="currentColor" stroke="none" />}
    </svg>
  );
}
