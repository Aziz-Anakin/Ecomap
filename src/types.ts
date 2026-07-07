// Types partagés entre toutes les couches (api / core / ui).

/** Coordonnées géographiques extraites de l'URL Google Maps. */
export interface Coordinates {
  lat: number;
  lon: number;
}

/** Une commune renvoyée par geo.api.gouv.fr. */
export interface Commune {
  nom: string;
  code: string;
  population?: number;
  /** Surface en hectares. */
  surface?: number;
}

/** Qualité de l'air courante (Open-Meteo). */
export interface AirQuality {
  /** Indice européen de qualité de l'air (plus bas = mieux). */
  europeanAqi: number;
  pm10?: number;
  pm25?: number;
  no2?: number;
  ozone?: number;
}

/** Part de sols artificialisés sur la commune (data.gouv.fr). */
export interface Artificialisation {
  /** Pourcentage de sols artificialisés (0-100). */
  pourcentage: number;
}

/** Résultat du calcul de score éco. */
export interface EcoScore {
  /** Note de 0 (mauvais) à 100 (excellent). */
  value: number;
  grade: "A" | "B" | "C" | "D" | "E";
  label: string;
}

/** Agrégat de toutes les données pour une commune (champs optionnels = API indisponible). */
export interface EcoData {
  commune: Commune;
  coordinates: Coordinates;
  air?: AirQuality;
  artificialisation?: Artificialisation;
  score: EcoScore;
}
