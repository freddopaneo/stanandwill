/**
 * Prix de lancement : 40 € la première année sur l'annuel, jusqu'au 31 décembre 2026 inclus (heure de Bruxelles).
 * Fichier sans dépendance, utilisable par la page d'accueil comme par le serveur de paiement.
 */
export const LAUNCH_END = Date.parse("2027-01-01T00:00:00+01:00");
export const launchActive = (now = Date.now()) => now < LAUNCH_END;
