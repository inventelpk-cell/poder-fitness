# Poder Fitness

App de entreno para una sola persona. El plan, el reproductor, el reto del héroe y el nivel de poder viven en el navegador. No hay cuenta, ni servidor, ni red en tiempo de uso.

## Instalar

```bash
npm install
```

## Arrancar en local

```bash
npm run dev
```

Abre la dirección que imprime Vite. El primer arranque pide el onboarding. Los datos quedan en IndexedDB (`poder-fitness`).

## Pruebas

```bash
npm test
npm run typecheck
npm run test:e2e
```

`test:e2e` construye la app y la abre con Playwright. La primera vez hace falta el navegador:

```bash
npx playwright install chromium
```

## Publicar sin servidor

La build es estática:

```bash
npm run build
```

El resultado está en `dist/`. Se puede servir con cualquier hosting de ficheros. En GitHub Pages, publica el contenido de `dist` en la rama que use el sitio y deja la raíz del sitio en `/` (el `base` de Vite es `/`). Tras la primera carga con red, el service worker guarda el shell, las fuentes, los iconos, los dibujos de ejercicios y la pantalla de transformación. IndexedDB no viaja en esa caché: sigue en el aparato.

## Qué hay dentro

- Catálogo semilla del generador de planes, más 290 ejercicios ilustrados de Everkinetic (Greg Priday), traducidos y empaquetados bajo CC BY-SA 4.0. El crédito y la licencia completa están en Ajustes → Acerca de. El texto legal está en `data/exercises/LICENSE-SOURCE.txt`.
- Sistema visual de la rama de arte: emblemas de rango, insignias, ilustraciones y la pantalla de transformación al subir de rango. Las fuentes Archivo Black, Outfit y JetBrains Mono van en el build (SIL Open Font License). No se pide una CDN.
- Everkinetic no trae nivel ni patrón en el origen. `src/catalog/map-everkinetic.ts` se los asigna a los 290, junto con el equipo del spec, sin modificar las ilustraciones. El plan semanal sale de ese catálogo. La semilla solo cubre un hueco cuando no hay candidato. El crédito y la licencia CC BY-SA 4.0 están en Ajustes → Acerca de.
