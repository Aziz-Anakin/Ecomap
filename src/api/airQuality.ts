// API Open-Meteo : qualité de l'air courante à un point donné.
import { API } from "../config.js";
import type { AirQuality, Coordinates } from "../types.js";

interface AirQualityResponse {
  current?: {
    european_aqi?: number;
    pm10?: number;
    pm2_5?: number;
    nitrogen_dioxide?: number;
    ozone?: number;
  };
}

/** Retourne la qualité de l'air courante, ou null si indisponible. */
export async function fetchAirQuality({ lat, lon }: Coordinates): Promise<AirQuality | null> {
  const url = new URL(API.airQuality);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set(
    "current",
    "european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone",
  );

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = (await res.json()) as AirQualityResponse;
  const c = data.current;
  if (!c || c.european_aqi == null) return null;

  return {
    europeanAqi: c.european_aqi,
    pm10: c.pm10,
    pm25: c.pm2_5,
    no2: c.nitrogen_dioxide,
    ozone: c.ozone,
  };
}
