// Rendu HTML partagé. Génère le markup à partir d'un EcoData ; aucune logique
// métier ici. Utilisé tel quel par la popup et par le panneau injecté.
import type { EcoData, EcoScore } from "../types.js";

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

const fmt = (n: number | undefined, unit = "") =>
  n == null ? "—" : `${Math.round(n)}${unit}`;

/** Une ligne de donnée (label + valeur). */
function row(label: string, value: string): string {
  return `<div class="eco-row"><span class="eco-row__label">${esc(label)}</span><span class="eco-row__value">${esc(value)}</span></div>`;
}

/** Carte de score avec la note et le grade colorés. */
function scoreCard(data: EcoData): string {
  const { value, grade, label } = data.score;
  return `
    <div class="eco-score eco-score--${grade}">
      <div class="eco-score__value">${value}<span class="eco-score__max">/100</span></div>
      <div class="eco-score__grade">${grade}</div>
      <div class="eco-score__label">${esc(label)}</div>
    </div>`;
}

/** Échelle des grades A→E, avec mise en avant du grade courant. */
const GRADE_SCALE: ReadonlyArray<[EcoScore["grade"], string, string]> = [
  ["A", "80-100", "Excellent"],
  ["B", "60-79", "Bon"],
  ["C", "40-59", "Moyen"],
  ["D", "20-39", "Médiocre"],
  ["E", "0-19", "Mauvais"],
];

/** Bloc « À savoir » repliable : explique le score, l'échelle et les sources. */
function about(current: EcoScore["grade"]): string {
  const items = GRADE_SCALE.map(([g, range, label]) => {
    const isCurrent = g === current ? " eco-legend__item--current" : "";
    return `<li class="eco-legend__item eco-grade-bg--${g}${isCurrent}">
        <span class="eco-legend__grade">${g}</span>
        <span class="eco-legend__range">${range}</span>
        <span class="eco-legend__label">${label}</span>
      </li>`;
  }).join("");

  return `
    <details class="eco-about">
      <summary>À savoir</summary>
      <p class="eco-about__text">Le score combine la <strong>qualité de l'air</strong> (70 %) et la
        <strong>part de sols artificialisés</strong> (30 %). Plus il est élevé, mieux c'est.</p>
      <ul class="eco-legend">${items}</ul>
      <p class="eco-about__text">L'indice <strong>AQI européen</strong> va de 0 (excellent) à 100+
        (très mauvais) : plus il est bas, meilleur est l'air.</p>
      <p class="eco-about__sources">Sources : geo.api.gouv.fr · Open-Meteo · data.gouv.fr</p>
    </details>`;
}

/** Markup complet du contenu EcoMap pour une commune. */
export function renderEcoData(data: EcoData): string {
  const { commune, air, artificialisation } = data;

  const rows = [
    commune.population != null ? row("Population", commune.population.toLocaleString("fr-FR")) : "",
    air ? row("Qualité de l'air (AQI)", fmt(air.europeanAqi)) : "",
    air ? row("PM2.5", fmt(air.pm25, " µg/m³")) : "",
    air ? row("NO₂", fmt(air.no2, " µg/m³")) : "",
    artificialisation ? row("Sols artificialisés", fmt(artificialisation.pourcentage, " %")) : "",
  ]
    .filter(Boolean)
    .join("");

  return `
    <header class="eco-header">
      <h1 class="eco-title">${esc(commune.nom)}</h1>
      <span class="eco-code">${esc(commune.code)}</span>
    </header>
    ${scoreCard(data)}
    <div class="eco-rows">${rows}</div>
    ${about(data.score.grade)}`;
}

/** Markup d'un état (chargement, erreur, hors zone). */
export function renderMessage(text: string): string {
  return `<div class="eco-message">${esc(text)}</div>`;
}
