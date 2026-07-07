// Build EcoMap : bundle des entrées TS -> dist/, puis copie des assets statiques.
// Usage : `node build.mjs` (build unique) ou `node build.mjs --watch`.
import * as esbuild from "esbuild";
import { cp, mkdir, rm } from "node:fs/promises";

const watch = process.argv.includes("--watch");
const outdir = "dist";

// On repart d'un dist propre.
await rm(outdir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });

/** Copie les fichiers statiques (manifest, html, css) dans dist/. */
async function copyAssets() {
  await cp("manifest.json", `${outdir}/manifest.json`);
  await cp("public", outdir, { recursive: true });
  await cp("icons", `${outdir}/icons`, { recursive: true });
}

/** @type {import("esbuild").BuildOptions} */
const options = {
  entryPoints: {
    content: "src/content.ts",
    popup: "src/popup.ts",
  },
  bundle: true,
  format: "iife", // les content scripts ne supportent pas les modules ES
  target: "chrome110",
  outdir,
  sourcemap: watch,
  logLevel: "info",
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  await copyAssets();
  console.log("EcoMap : build en watch, dist/ prêt.");
} else {
  await esbuild.build(options);
  await copyAssets();
  console.log("EcoMap : build terminé -> charger le dossier dist/ dans Chrome.");
}
