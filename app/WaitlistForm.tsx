"use client";

import { useState } from "react";

const RACES = [
  "Teckel à poil ras",
  "Teckel à poil dur",
  "Teckel à poil long",
  "Bouledogue français",
  "Chihuahua",
  "Spitz nain",
  "Cavalier King Charles",
  "Shih tzu",
  "Labrador",
  "Autre race",
];

export function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [count, setCount] = useState<number | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur");
      setCount(json.position ?? null);
      setStatus("ok");
      form.reset();
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message === "invalid_email" ? "Cette adresse e-mail ne semble pas valide." : "Un souci de notre côté. Réessayez dans une minute.");
    }
  }

  if (status === "ok") {
    return (
      <div className="success" role="status">
        <h3>Bienvenue parmi les fondateurs 🐾</h3>
        <p>
          Vous recevez un e-mail de confirmation dans la minute. Stan et Will vous donnent des nouvelles une fois par
          semaine, et vous serez les premiers servis en décembre.
        </p>
        <p className="fine" style={{ textAlign: "left", marginTop: 10 }}>
          Un ami a un teckel ? Envoyez-lui cette page : chaque fondateur peut en parrainer trois.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card" id="inscription">
      <div className="offer">
        <span className="price">29,99 €</span>
        <span className="old">49,99 €</span>
        <span className="tag">Offre fondateurs</span>
      </div>
      <p style={{ fontSize: 14.5, color: "var(--texte-doux)", marginBottom: 14 }}>
        La première année de l'app, réservée aux 500 premiers inscrits. Rien à payer aujourd'hui : vous serez prévenu
        en premier au lancement, en décembre 2026.
      </p>
      <div className="field">
        <label htmlFor="email">Votre e-mail</label>
        <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required placeholder="vous@exemple.fr" />
      </div>
      {!compact && (
        <div className="row2">
          <div className="field">
            <label htmlFor="dog">Prénom de votre chien (facultatif)</label>
            <input id="dog" name="dog" type="text" placeholder="Gaston" maxLength={40} />
          </div>
          <div className="field">
            <label htmlFor="breed">Sa race</label>
            <select id="breed" name="breed" defaultValue="Teckel à poil ras">
              {RACES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: -9999 }} aria-hidden="true" />
      <label className="consent">
        <input type="checkbox" name="consent" required />
        <span>
          J'accepte de recevoir les nouvelles de Stan & Will par e-mail (une par semaine maximum, désinscription en un
          clic). Données hébergées en Europe, jamais revendues.
        </span>
      </label>
      <button className="btn" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Un instant…" : "Je rejoins les fondateurs"}
      </button>
      {status === "error" && <p className="error">{message}</p>}
      <p className="fine">Gratuit aujourd'hui · Lancement décembre 2026 · iPhone et Android</p>
    </form>
  );
}
