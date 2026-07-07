// Extraction des coordonnées depuis une URL Google Maps.
// Fonction pure : facile à tester, réutilisée par le content script et la popup.
import type { Coordinates } from "../types.js";

// Une URL Maps ressemble à : .../maps/@48.8566,2.3522,13z/...
const COORDS_RE = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/;

/** Extrait { lat, lon } d'une URL Google Maps, ou null si absent. */
export function parseCoordinates(url: string): Coordinates | null {
  const m = COORDS_RE.exec(url);
  if (!m) return null;

  const lat = Number(m[1]);
  const lon = Number(m[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  return { lat, lon };
}
