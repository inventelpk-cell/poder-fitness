#!/usr/bin/env node
/**
 * Regenera el catálogo offline de Poder Fitness.
 *
 *   node data/exercises/scripts/build-exercise-db.mjs
 *
 * Hace el trabajo real en build_exercise_db.py (misma carpeta): descarga o
 * reutiliza free-exercise-db (Unlicense), aplica el glosario de gimnasio,
 * escribe exercises.json y catalogs.json, y convierte las imágenes a WebP.
 *
 * La app no necesita ejecutar este script: el JSON y las imágenes ya van
 * en el repositorio.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(here, "build_exercise_db.py");
const result = spawnSync("python3", [script, ...process.argv.slice(2)], {
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
