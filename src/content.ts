// Content script injecté dans Google Maps.
// Affiche un panneau EcoMap et le met à jour quand l'utilisateur navigue
// (Maps est une SPA : l'URL change sans recharger la page).
import { URL_DEBOUNCE_MS, URL_POLL_MS } from "./config.js";
import { loadEcoData } from "./core/ecoData.js";
import { parseCoordinates } from "./core/location.js";
import { renderEcoData, renderMessage } from "./ui/render.js";

const PANEL_ID = "ecomap-panel";
const REOPEN_ID = "ecomap-reopen";

/** URL d'une icône de l'extension (déclarée en web_accessible_resources). */
function logoUrl(): string {
  try {
    return chrome.runtime.getURL("icons/icon48.png");
  } catch {
    return "";
  }
}

/** Crée (une seule fois) le panneau + le badge de réouverture, renvoie le conteneur de contenu. */
function ensureContent(): HTMLElement {
  const existing = document.getElementById(PANEL_ID);
  if (existing) return existing.querySelector(".eco-panel__content") as HTMLElement;

  const logo = logoUrl();

  const panel = document.createElement("aside");
  panel.id = PANEL_ID;
  panel.className = "eco-panel";
  panel.innerHTML = `
    <div class="eco-panel__bar"></div>
    <header class="eco-panel__head">
      ${logo ? `<img class="eco-panel__logo" src="${logo}" alt="" />` : ""}
      <span class="eco-panel__brand">EcoMap</span>
      <button class="eco-panel__close" type="button" aria-label="Fermer EcoMap" title="Fermer">×</button>
    </header>
    <div class="eco-panel__content"></div>`;
  document.body.appendChild(panel);

  // Badge flottant pour rouvrir le panneau après l'avoir fermé.
  const reopen = document.createElement("button");
  reopen.id = REOPEN_ID;
  reopen.className = "eco-reopen";
  reopen.type = "button";
  reopen.title = "Ouvrir EcoMap";
  reopen.setAttribute("aria-label", "Ouvrir EcoMap");
  reopen.innerHTML = logo ? `<img src="${logo}" alt="" />` : "🍃";
  reopen.hidden = true;
  document.body.appendChild(reopen);

  panel.querySelector(".eco-panel__close")!.addEventListener("click", () => {
    panel.hidden = true;
    reopen.hidden = false;
  });
  reopen.addEventListener("click", () => {
    panel.hidden = false;
    reopen.hidden = true;
  });

  return panel.querySelector(".eco-panel__content") as HTMLElement;
}

/** Remplace le contenu avec une légère apparition en fondu (pas de saut brut). */
function setContent(content: HTMLElement, html: string): void {
  content.innerHTML = html;
  content.classList.remove("eco-fade-in");
  void content.offsetWidth; // force un reflow pour rejouer l'animation
  content.classList.add("eco-fade-in");
}

/** Active/désactive l'état de chargement sans détruire le contenu affiché. */
function setLoading(content: HTMLElement, on: boolean): void {
  content.closest(".eco-panel")?.classList.toggle("eco-panel--loading", on);
}

let lastKey = "";

/** Recharge les données pour les coordonnées de l'URL courante. */
async function update(url: string): Promise<void> {
  const content = ensureContent();
  const coords = parseCoordinates(url);

  if (!coords) {
    lastKey = "";
    setContent(content, renderMessage("Déplacez la carte sur une commune."));
    return;
  }

  // Coordonnées arrondies (~100 m) : on évite de recharger pour un zoom ou un micro-déplacement.
  const key = `${coords.lat.toFixed(3)},${coords.lon.toFixed(3)}`;
  const hasData = content.querySelector(".eco-header") !== null;
  if (key === lastKey && hasData) return;
  lastKey = key;

  if (hasData) {
    setLoading(content, true); // on garde l'ancien contenu, juste atténué
  } else {
    setContent(content, renderMessage("Chargement…"));
  }

  try {
    const data = await loadEcoData(coords);
    setContent(
      content,
      data ? renderEcoData(data) : renderMessage("Aucune commune française à cet endroit."),
    );
  } catch {
    setContent(content, renderMessage("Données indisponibles pour le moment."));
  } finally {
    setLoading(content, false);
  }
}

/**
 * Surveille les changements d'URL (la SPA ne recharge pas la page) et n'appelle
 * `onChange` qu'après une courte pause, une fois la carte stabilisée.
 */
function watchUrl(onChange: (url: string) => void): void {
  let last = location.href;
  let timer: ReturnType<typeof setTimeout>;

  const schedule = (url: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => onChange(url), URL_DEBOUNCE_MS);
  };

  schedule(last);
  setInterval(() => {
    if (location.href !== last) {
      last = location.href;
      schedule(last);
    }
  }, URL_POLL_MS);
}

watchUrl((url) => void update(url));
