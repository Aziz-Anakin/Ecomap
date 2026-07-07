// Constantes globales : endpoints des APIs et réglages divers.
// Tout ce qui est "magique" (URL, délais) vit ici pour rester facile à changer.

export const API = {
  /** Communes par coordonnées — https://geo.api.gouv.fr */
  geoCommunes: "https://geo.api.gouv.fr/communes",
  /** Qualité de l'air — https://open-meteo.com/en/docs/air-quality-api */
  airQuality: "https://air-quality-api.open-meteo.com/v1/air-quality",
} as const;

/** Intervalle (ms) entre deux vérifications de l'URL Maps (SPA) côté content script. */
export const URL_POLL_MS = 500;

/** Délai (ms) d'inactivité avant de recharger : évite de recharger pendant qu'on déplace la carte. */
export const URL_DEBOUNCE_MS = 600;

/** Pondération des facteurs dans le score éco (la somme vaut 1). */
export const SCORE_WEIGHTS = {
  airQuality: 0.7,
  artificialisation: 0.3,
} as const;
