// Orchestrateur : à partir de coordonnées, récupère toutes les données
// et calcule le score. C'est le seul point d'entrée utilisé par content/popup.
import { fetchAirQuality } from "../api/airQuality.js";
import { fetchArtificialisation } from "../api/artificialisation.js";
import { fetchCommune } from "../api/geo.js";
import type { Coordinates, EcoData } from "../types.js";
import { computeEcoScore } from "./ecoScore.js";

/**
 * Construit l'agrégat EcoData pour un point donné.
 * Retourne null si aucune commune n'est trouvée (hors France p. ex.).
 * Les autres APIs sont optionnelles : une erreur réseau dégrade en douceur.
 */
export async function loadEcoData(coords: Coordinates): Promise<EcoData | null> {
  const commune = await fetchCommune(coords);
  if (!commune) return null;

  // Les deux appels indépendants tournent en parallèle ; on neutralise les rejets.
  const [air, artificialisation] = await Promise.all([
    fetchAirQuality(coords).catch(() => null),
    fetchArtificialisation(commune.code).catch(() => null),
  ]);

  const score = computeEcoScore({ air, artificialisation });

  return {
    commune,
    coordinates: coords,
    air: air ?? undefined,
    artificialisation: artificialisation ?? undefined,
    score,
  };
}
