# EcoMap

EcoMap is a small Chrome extension for Google Maps.

It does three simple things:

- detects the town visible on Google Maps;
- shows some environmental data;
- computes a simple eco score.

## Architecture

The source code is written in TypeScript inside `src/`, split into 3 layers:

| Layer       | Role                                                       |
| ----------- | ---------------------------------------------------------- |
| `src/api/`  | Raw network calls, one file per source (geo, air, soil).   |
| `src/core/` | Pure logic (parse coords, aggregate data, eco score).      |
| `src/ui/`   | Shared HTML rendering.                                      |

Two entry points reuse these layers:

- `src/content.ts`: injected into Google Maps, shows a floating panel.
- `src/popup.ts`: popup shown when you click the extension icon.

The build (`esbuild`) bundles these entry points into `dist/` and copies the
manifest, the popup HTML, the CSS and the icons there. **You load `dist/` in
Chrome.**

```
src/
├── config.ts          constants / endpoints
├── types.ts           shared types
├── api/               geo.ts · airQuality.ts · artificialisation.ts
├── core/              location.ts · ecoData.ts · ecoScore.ts
├── ui/                render.ts
├── content.ts         entry: content script
└── popup.ts           entry: popup
```

## APIs used

- `geo.api.gouv.fr` to find the town from coordinates.
- Open-Meteo for air quality.
- data.gouv.fr for soil artificialization (to be wired in
  `src/api/artificialisation.ts`).

## Development

```bash
npm install
npm run build      # one-off build -> dist/
npm run watch      # auto rebuild while developing
npm run typecheck  # TypeScript check
```

## Load the extension

1. `npm install` then `npm run build`.
2. Go to `chrome://extensions`.
3. Turn on Developer mode.
4. Click `Load unpacked`.
5. Select the **`dist/`** folder of the project.
6. Open Google Maps and search for a town.
7. Reload the Google Maps page if needed.
