// API geo.api.gouv.fr : retrouve la commune à partir de coordonnées.
import { API } from "../config.js";
import type { Commune, Coordinates } from "../types.js";

interface GeoCommuneResponse {
  nom: string;
  code: string;
  population?: number;
  surface?: number;
}

/**
 * Retourne la commune contenant le point donné, ou null si aucune
 * (hors France, en mer, ou erreur réseau).
 */
export async function fetchCommune({ lat, lon }: Coordinates): Promise<Commune | null> {
  const url = new URL(API.geoCommunes);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("fields", "nom,code,population,surface");
  url.searchParams.set("format", "json");

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = (await res.json()) as GeoCommuneResponse[];
  const first = data[0];
  if (!first) return null;

  return {
    nom: first.nom,
    code: first.code,
    population: first.population,
    surface: first.surface,
  };
}
