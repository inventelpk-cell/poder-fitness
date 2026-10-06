# Poder Fitness

Poder Fitness es un cuaderno de entreno para una sola persona. Vive en el navegador: arcos de cuatro semanas, biblioteca de ejercicios, reproductor de series y un nivel de poder que sube con el trabajo anotado. No hay cuenta ni servidor.

## Requisitos

Node.js 22 o superior (LTS vigente).

## Scripts

```bash
npm install
npm run dev
npm test
npm run test:e2e
npm run build
npm run preview
```

`npm run dev` abre la app en `http://127.0.0.1:5173`. Los tests de dominio usan Vitest. El humo de Playwright arranca el build y lo sirve en el puerto 4173.

## Ejercicios

La biblioteca ya está en el repositorio:

- `data/exercises/exercises.json` — 873 ejercicios en español.
- `data/exercises/images/` — fotos WebP.
- `data/exercises/plan-pool.es.json` — pool que usa el generador de arcos.

En desarrollo y en el build se sirven bajo `/exercises/`. No hace falta descargar nada más.

## Despliegue estático

`npm run build` deja el sitio en `dist/`. No hay backend: cualquier hosting de ficheros estáticos vale.

### Cloudflare Pages

Es el camino más simple, porque la app se publica en la raíz del dominio.

1. Conecta el repositorio.
2. Comando de build: `npm run build`.
3. Directorio de salida: `dist`.
4. Node 22.

`public/_redirects` reenvía las rutas de la app a `index.html`.

### GitHub Pages

Si el sitio es el de la cuenta (`https://usuario.github.io/`), la base por defecto `/` sirve.

Si el sitio es de proyecto (`https://usuario.github.io/poder-fitness/`), hay que construir con esa base:

```bash
VITE_BASE=/poder-fitness/ npm run build
```

Publica el contenido de `dist`. El build copia `index.html` a `404.html` para que las rutas directas vuelvan a la app.

Los fondos y emblemas del sistema visual apuntan a `/art` y `/brand` desde la raíz del sitio. En un sitio de proyecto, define `VITE_BASE` para los iconos del manifiesto y las imágenes que monta la app. Los archivos `src/visual/effects.css` y `src/visual/tokens.css` no se reescriben: en Pages de proyecto la forma fiable de ver el aura es servir el `dist` en la raíz, o usar Cloudflare Pages.

## Datos en el navegador

Perfil, sesiones, rutinas y el nivel se guardan en IndexedDB, en la base `poder-fitness`. No salen del aparato.

Antes de cambiar de navegador o de máquina: Ajustes → Datos → Exportar. Se descarga `poder-fitness-AAAA-MM-DD.json`. En el otro aparato, Importar sustituye lo que hubiera. Borrar pide escribir `BORRAR`.

## Licencia y créditos

El código de la app está en este repositorio. La base de ejercicios y sus fotos son una copia local de [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (commit `f00c92c`), licencia [The Unlicense](data/exercises/LICENSE). El detalle, incluida la traducción al español, está en `data/exercises/CREDITS.md`. La pantalla Acerca de lo muestra dentro de la app.

Los pasos de los 873 ejercicios están en español, también fuera del pool del plan. Por eso la ficha no muestra la frase «Pasos en el idioma de la ficha»: no queda ninguna ficha cuyo texto útil esté solo en inglés. No hay un cambio de idioma.
