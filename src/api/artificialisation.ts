// API data.gouv.fr : part de sols artificialisés sur la commune.
//
// NOTE : l'endpoint exact data.gouv.fr (jeu "artificialisation des sols")
// reste à câbler par l'équipe API. Tant qu'il n'est pas branché, on renvoie
// null : le reste de l'app (score, affichage) gère proprement l'absence de
// donnée. Garder la même signature `(code: string) => Promise<... | null>`.
import type { Artificialisation } from "../types.js";

/**
 * Retourne la part de sols artificialisés pour le code commune INSEE donné,
 * ou null si la donnée n'est pas disponible.
 */
export async function fetchArtificialisation(
  _codeCommune: string,
): Promise<Artificialisation | null> {
  // TODO(api) : appeler l'endpoint data.gouv.fr et mapper la réponse.
  return null;
}
