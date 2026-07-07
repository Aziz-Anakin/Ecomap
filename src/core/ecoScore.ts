// Calcul du score éco. Logique pure : entrées = données, sortie = note 0-100.
import { SCORE_WEIGHTS } from "../config.js";
import type { AirQuality, Artificialisation, EcoScore } from "../types.js";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Convertit l'indice européen de qualité de l'air en note 0-100.
 * L'AQI européen va ~0 (excellent) à ~100+ (très mauvais), donc on inverse.
 */
function airToScore(air: AirQuality): number {
  return clamp(100 - air.europeanAqi, 0, 100);
}

/** Convertit la part de sols artificialisés (0-100) en note 0-100 (moins = mieux). */
function artificialisationToScore(a: Artificialisation): number {
  return clamp(100 - a.pourcentage, 0, 100);
}

function toGrade(value: number): EcoScore["grade"] {
  if (value >= 80) return "A";
  if (value >= 60) return "B";
  if (value >= 40) return "C";
  if (value >= 20) return "D";
  return "E";
}

const LABELS: Record<EcoScore["grade"], string> = {
  A: "Excellent",
  B: "Bon",
  C: "Moyen",
  D: "Médiocre",
  E: "Mauvais",
};

/**
 * Combine les facteurs disponibles en un score pondéré.
 * Les facteurs absents sont ignorés et les poids renormalisés, pour que le
 * score reste sur 100 même avec une seule donnée.
 */
export function computeEcoScore(input: {
  air?: AirQuality | null;
  artificialisation?: Artificialisation | null;
}): EcoScore {
  const parts: Array<{ score: number; weight: number }> = [];

  if (input.air) parts.push({ score: airToScore(input.air), weight: SCORE_WEIGHTS.airQuality });
  if (input.artificialisation) {
    parts.push({
      score: artificialisationToScore(input.artificialisation),
      weight: SCORE_WEIGHTS.artificialisation,
    });
  }

  const totalWeight = parts.reduce((sum, p) => sum + p.weight, 0);
  const value =
    totalWeight === 0
      ? 0
      : Math.round(parts.reduce((sum, p) => sum + p.score * p.weight, 0) / totalWeight);

  const grade = toGrade(value);
  return { value, grade, label: LABELS[grade] };
}
