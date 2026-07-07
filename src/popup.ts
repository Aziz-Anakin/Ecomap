// Logique de la popup (clic sur l'icône de l'extension).
// Lit l'URL de l'onglet actif, en extrait les coordonnées, charge les données.
import { loadEcoData } from "./core/ecoData.js";
import { parseCoordinates } from "./core/location.js";
import { renderEcoData, renderMessage } from "./ui/render.js";

/** URL de l'onglet actif (activeTab donne l'accès au clic sur l'icône). */
async function activeTabUrl(): Promise<string | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url;
}

async function main(): Promise<void> {
  const root = document.getElementById("app");
  if (!root) return;

  const url = await activeTabUrl();
  const coords = url ? parseCoordinates(url) : null;

  if (!coords) {
    root.innerHTML = renderMessage("Ouvrez Google Maps sur une commune, puis rouvrez EcoMap.");
    return;
  }

  root.innerHTML = renderMessage("Chargement…");
  try {
    const data = await loadEcoData(coords);
    root.innerHTML = data
      ? renderEcoData(data)
      : renderMessage("Aucune commune française à cet endroit.");
  } catch {
    root.innerHTML = renderMessage("Données indisponibles pour le moment.");
  }
}

void main();
