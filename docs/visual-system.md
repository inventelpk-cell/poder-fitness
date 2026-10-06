# Sistema visual de Poder Fitness

Sistema gráfico original para la PWA. No incluye pantallas de producto ni datos de entreno: otro agente lo monta encima de estos archivos.

La familia de formas es una sola: hexágono de punta, chevron ascendente y diamante. El trazo de marco es 4 px en emblemas de 128 px. La paleta es fondo casi negro, energía naranja, ámbar y azul.

El wordmark «PODER FITNESS» está trazado a partir de Noto Sans Display Bold (SIL Open Font License). No se redistribuye el archivo de la fuente. El símbolo geométrico es original. No hay personajes, símbolos ni tipografías de ninguna serie.

## Cómo se sirve

Los archivos de `public/` se publican en la raíz del sitio. Un emblema se usa así:

```html
<img src="/art/ranks/forja.svg" alt="" width="96" height="96" />
```

En el CSS del sistema las capas apuntan a `/art/backgrounds/…`. Si la app vive en un subpath, hay que anteponer ese prefijo en esas URLs.

Importa los tokens una vez en la entrada de la app:

```ts
import "./visual/tokens.css";
import "./visual/effects.css";
```

`TransformationScreen` ya importa ambos.

## Tokens

Archivo: `src/visual/tokens.css`.

| Token | Valor | Uso |
| --- | --- | --- |
| `--pf-color-bg` | `#090b10` | Fondo de pantalla |
| `--pf-color-bg-raised` | `#141821` | Placas y medallones |
| `--pf-color-text` | `#f4f0e6` | Texto principal |
| `--pf-color-text-dim` | `#a7a193` | Títulos secundarios |
| `--pf-color-orange` | `#ff6a1a` | Energía, acción |
| `--pf-color-amber` | `#ffc43a` | Rango alto, acento |
| `--pf-color-blue` | `#3b82ff` | Velocidad, recuperación |
| `--pf-color-hot` | `#fff6e4` | Núcleo del rango Mito |
| `--pf-font-display` | Noto Sans Display, Arial Black, Segoe UI | Nombres de rango y botones |
| `--pf-font-body` | Inter, Segoe UI, Helvetica Neue | Texto de interfaz |
| `--pf-radius-sm/md/lg` | 8 / 14 / 22 px | Tarjetas |
| `--pf-radius-pill` | 999 px | Botón Continuar |
| `--pf-motion-fast/base/slow` | 140 / 280 / 640 ms | Microinteracciones |
| `--pf-ease-standard` | curva de revelado | Entradas |
| `--pf-ease-impact` | curva de golpe | Transformación |

Con `prefers-reduced-motion: reduce`, las duraciones de token pasan a 0.

Si quieres la misma tipografía en todos los teléfonos, autoaloja Inter y Noto Sans Display (ambas OFL) y decláralas con `@font-face` usando esos mismos nombres. Sin eso, el sistema cae en Arial Black y Segoe UI.

## Marca

| Archivo | Uso |
| --- | --- |
| `/brand/logo.svg` | Cabecera horizontal |
| `/brand/logo-mark.svg` | Símbolo solo, fondo transparente |
| `/brand/favicon.svg` | Pestaña. A 16 px se lee el hexágono y el chevron |
| `/brand/icon-192.png` | Icono PWA, propósito `any` |
| `/brand/icon-512.png` | Icono PWA, propósito `any` |
| `/brand/maskable-512.png` | Icono adaptable. El símbolo está dentro del círculo central del 80 % |
| `/brand/apple-touch-180.png` | Apple touch, fondo opaco |

Fragmento para el manifiesto de la PWA:

```json
{
  "icons": [
    { "src": "/brand/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/brand/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/brand/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

El `apple-touch-icon` apunta a `/brand/apple-touch-180.png`.

## Rangos

Nueve escalones, del novato al mito. El id es el nombre del archivo. `fromRank` y `toRank` aceptan el id (`forja`) o el nombre visible (`Forja`, `Vórtice`).

| Orden | Id | Nombre | Título | Archivo |
| --- | --- | --- | --- | --- |
| 1 | chispa | Chispa | Novato | `/art/ranks/chispa.svg` |
| 2 | brasa | Brasa | Encendido | `/art/ranks/brasa.svg` |
| 3 | pulso | Pulso | Constante | `/art/ranks/pulso.svg` |
| 4 | forja | Forja | Templado | `/art/ranks/forja.svg` |
| 5 | impulso | Impulso | Impulsor | `/art/ranks/impulso.svg` |
| 6 | ascenso | Ascenso | Ascendido | `/art/ranks/ascenso.svg` |
| 7 | vortice | Vórtice | Vorticial | `/art/ranks/vortice.svg` |
| 8 | corona | Corona | Soberano | `/art/ranks/corona.svg` |
| 9 | mito | Mito | Mítico | `/art/ranks/mito.svg` |

El catálogo en código está en `src/visual/ranks.ts` (`RANKS`, `resolveRank`, `rankEmblemSrc`).

Cada emblema añade anillo, color y símbolo. Chispa es un diamante pequeño sobre acero. Mito abre rayos naranja y azul alrededor de un cristal claro. El arco inferior crece con el orden.

## Insignias

Sellos circulares en `/art/badges/`. Mismo grosor de anillo. El símbolo cambia.

| Archivo | Nombre | Cuándo mostrarla |
| --- | --- | --- |
| `racha.svg` | Racha | Días seguidos de entreno |
| `primer-entreno.svg` | Primer entreno | Primera sesión cerrada |
| `reto-heroe.svg` | Reto del héroe | Reto mayor completado |
| `record.svg` | Récord | Marca personal |
| `constancia.svg` | Constancia | Ritmo sostenido |
| `volumen.svg` | Volumen | Series y repeticiones acumuladas |
| `madrugada.svg` | Madrugador | Entreno al amanecer |
| `noche-hierro.svg` | Noche de hierro | Entreno nocturno |
| `semana-plena.svg` | Semana plena | Siete días del arco |
| `cien-sesiones.svg` | Cien sesiones | Cien entrenos |
| `superacion.svg` | Superación | Un límite anterior roto |
| `equilibrio.svg` | Equilibrio | Bloque de equilibrio |
| `guardia.svg` | Guardia | Día de recuperación respetado |
| `precision.svg` | Precisión | Técnica del plan cumplida |

## Ilustraciones

Onboarding, retrato `360×440`, en `/art/onboarding/`:

- `despierta.svg` — Despierta tu núcleo. Figura quieta, anillos de aura.
- `elige-arco.svg` — Elige tu arco. Tres emblemas en un camino ascendente.
- `asciende.svg` — Entrena y asciende. Pose de poder, líneas de velocidad y marco de impacto.

Estados vacíos, `320×220`, en `/art/empty/`:

- `biblioteca.svg` — Biblioteca sin ejercicios.
- `historial.svg` — Historial sin sesiones. El primer nodo ya está encendido.
- `reto.svg` — Reto sellado, todavía sin abrir.
- `rutinas.svg` — Lista vacía, con la marca para crear una rutina.

La figura es un atleta geométrico: casco hexagonal, visera, núcleo en el pecho y extremidades de un solo trazo. No es un personaje con nombre.

## Fondos y efectos

SVG en `/art/backgrounds/`:

| Clase | Asset | Uso |
| --- | --- | --- |
| `.pf-layer-aura` | `aura-radial.svg` | Resplandor naranja que enfría a azul |
| `.pf-layer-aura-myth` | `aura-myth.svg` | La misma capa, más intensa, para Mito |
| `.pf-layer-speed` | `speed-lines.svg` | Trazos diagonales |
| `.pf-layer-grid` | `hex-grid.svg` | Rejilla repetible |
| `.pf-layer-vignette` | `vignette.svg` | Oscurece los bordes |
| `.pf-layer-impact` | `impact-frame.svg` | Esquinas de impacto |

Coloca la capa dentro de un padre `position: relative`.

```html
<div class="pf-surface" style="position: relative; min-height: 100dvh">
  <div class="pf-layer-grid"></div>
  <div class="pf-layer-aura pf-aura-live"></div>
  <div class="pf-layer-vignette"></div>
</div>
```

`.pf-aura-live` y `.pf-speed-live` animan. Sin la clase, la capa queda quieta. `.pf-glow-orange`, `.pf-glow-blue` y `.pf-glow-amber` son sombras de emblema. `.pf-display` y `.pf-kicker` fijan la voz tipográfica.

Con `prefers-reduced-motion`, esas animaciones no corren.

## Pantalla de transformación

Archivo: `src/visual/TransformationScreen.tsx`.

Props:

| Prop | Tipo | Rol |
| --- | --- | --- |
| `rankName` | `string` | Nombre visible del rango nuevo. Ejemplo: `Forja` |
| `rankTitle` | `string` | Título del rango. Ejemplo: `Templado` |
| `fromRank` | `string` | Id, nombre o ruta `.svg` del rango anterior |
| `toRank` | `string` | Id, nombre o ruta `.svg` del rango nuevo |
| `onContinue` | `() => void` opcional | Si existe, muestra el botón Continuar y la sección es un diálogo |

```tsx
import { TransformationScreen } from "./visual/TransformationScreen";

export function Desbloqueo() {
  return (
    <TransformationScreen
      rankName="Forja"
      rankTitle="Templado"
      fromRank="pulso"
      toRank="forja"
      onContinue={() => {
        window.history.back();
      }}
    />
  );
}
```

La secuencia, en unos 1,6 s: líneas de velocidad, un solo destello cálido, el emblema anterior se apaga, el nuevo entra con un golpe de escala, el anillo gira y el nombre sube. En el rango Mito el fondo cambia a `aura-myth.svg`.

El texto del rango es HTML, no va dentro del SVG. El emblema es decorativo (`alt=""`): el nombre está en el `h1`.

Si `toRank` no carga, aparece un hexágono de reserva en el color de acento, no un icono roto.

Con `prefers-reduced-motion: reduce` no hay destello, ni giro, ni el emblema anterior. Se muestra el estado final: aura quieta, marco, emblema nuevo, nombre y título.

React 18 o superior. No añade dependencias. El JSX asume el runtime clásico (`import React`) o el automático.

## Inventario

`public/art/manifest.json` lista cada asset con `path`, `type`, `purpose` y `name` en español. Los emblemas incluyen además `id`, `title` y `order`.
