# Base de ejercicios

Catálogo local para la PWA. No hace falta red ni volver a ejecutar el script para usarlo.

## Conteos

| | |
| --- | --- |
| Ejercicios | 873 |
| Imágenes | 1746 |
| Pasos de instrucción | 3737 |
| Idiomas en cada ficha | español (nombre e instrucciones) e inglés (original) |

Tres ejercicios del upstream se omiten porque no traen imágenes. Otros cinco (`Push Press`, `Side Bridge`, `Side Jackknife`, `One-Arm Kettlebell Swings`, `Iron Cross`) sí tienen foto, pero el upstream deja las instrucciones vacías: los pasos en español y en inglés los escribe este paquete.

## Archivos

- `exercises.json`: lista de ejercicios. Es el archivo que consume la app.
- `catalogs.json`: valores cerrados para filtros.
- `images/<id>/<n>.webp`: fotos. La ruta guardada en cada ficha es relativa a esta carpeta (`images/...`).
- `LICENSE`: texto de la Unlicense, copiado del upstream.
- `CREDITS.md`: atribución para la pantalla Acerca de.
- `scripts/build-exercise-db.mjs`: cómo se regeneró.

## Esquema de cada ejercicio

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | string | Identificador estable del upstream (`Alternate_Incline_Dumbbell_Curl`). |
| `nombre` | string | Nombre en español. |
| `nombreOriginal` | string | Nombre en inglés. |
| `instrucciones` | string[] | Pasos en español, en orden. |
| `instruccionesOriginal` | string[] | Los mismos pasos en inglés. |
| `musculosPrimarios` | string[] | Ids de `catalogs.json` → `musculos`. |
| `musculosSecundarios` | string[] | Ids de `musculos`. Puede ir vacío. |
| `equipo` | string | Id de `equipo`. `sin-especificar` si el upstream no lo traía. |
| `categoria` | string | Id de `categorias`. |
| `nivel` | string | Id de `niveles`. `expert` del upstream se muestra como Avanzado. |
| `fuerza` | string o null | Id de `fuerza`: empuje, tracción o estático. |
| `mecanica` | string o null | Id de `mecanica`: compuesto o aislamiento. |
| `imagenes` | string[] | Al menos una ruta relativa, por ejemplo `images/Plank/0.webp`. |

Los textos visibles (nombre del catálogo, con tildes) están en `catalogs.json`. El ejercicio guarda el `id` para que un retoque del rótulo no cambie los filtros.

`powerlifting` y `strongman` se dejan con el nombre del deporte. La halterofilia olímpica sí se llama Halterofilia.

## Cómo se generó

1. Clonar [free-exercise-db](https://github.com/yuhonas/free-exercise-db) en el commit `f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5`. La licencia del archivo `LICENSE.md` de ese repo es la Unlicense.
2. Tomar las instrucciones en español de [free-exercise-db-es](https://github.com/0x10-z/free-exercise-db-es) en `8615dab5028eca3ff069b1848f40b8c0a27fb393` (`dist/exercises_es.json`), también Unlicense.
3. Traducir nombres con `scripts/name_es.py` y músculos, equipo, categoría y nivel con el mapa de `scripts/build_exercise_db.py`.
4. Corregir las instrucciones: tú en vez de usted, cargada/arrancada/envión, curl femoral, mancuernas, polea, pulgadas a centímetros y libras a kilogramos.
5. Convertir cada JPG a WebP (calidad 80, lado mayor como máximo 1200 px) en `images/`.

```bash
node data/exercises/scripts/build-exercise-db.mjs
```

Opciones: `--skip-images` solo regenera el JSON. `--upstream` y `--spanish` apuntan a copias locales si no quieres descargar.

No usa Git LFS. Las fotos pesan menos que el límite de archivo de Git.
