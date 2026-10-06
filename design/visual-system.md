# Sistema visual de Poder Fitness

Identidad original para la PWA. Fondo oscuro, luz de aura y un solo monograma. La energía sube por cinco fases: tenue, estable, ardiente, relámpago y soberana. No hay mascota ni símbolos de ninguna serie.

La obra es original. Archivo Black y Outfit se usan bajo la [SIL Open Font License](https://scripts.sil.org/OFL). La pantalla de transformación lleva recortes embebidos de esas fuentes y no pide red.

## Paleta

El color de interfaz es carbón y hueso. Naranja, azul y oro son luz, no relleno de grandes superficies.

| Token | Hex | Uso |
| --- | --- | --- |
| `--pf-bg` | `#07080D` | Fondo de la app |
| `--pf-bg-elevated` | `#10131A` | Disco de emblema y base de insignia |
| `--pf-surface` | `#171C28` | Tarjetas |
| `--pf-surface-2` | `#212838` | Tarjeta sobre tarjeta |
| `--pf-line` | `#2C3548` | Divisores y vacíos |
| `--pf-line-strong` | `#3D4860` | Borde con foco |
| `--pf-text` | `#F4F1EA` | Texto principal |
| `--pf-text-dim` | `#9AA3B5` | Texto secundario |
| `--pf-text-faint` | `#6B7488` | Metadatos |
| `--pf-orange` | `#FF6A1A` | Aura cálida, marca, acción |
| `--pf-orange-deep` | `#E24E00` | Naranja apagado |
| `--pf-orange-soft` | `#FF8A3D` | Naranja claro |
| `--pf-gold` | `#FFC53D` | Chispa, impacto, rangos altos |
| `--pf-gold-soft` | `#FFE3A3` | Brillo del oro |
| `--pf-blue` | `#3B82FF` | Mitad fría del símbolo y tormenta |
| `--pf-blue-deep` | `#1D4ED8` | Azul profundo |
| `--pf-cyan` | `#5CE1FF` | Relámpago |

Cada rango tiene además su color en `--pf-rank-*`. No se reasignan.

## Tipografía

| Rol | Familia | Fallback |
| --- | --- | --- |
| Display | Archivo Black | `"Arial Black", Impact, sans-serif` |
| Interfaz | Outfit (400, 520, 600) | `"Avenir Next", "Segoe UI", sans-serif` |
| Cifras de entreno | JetBrains Mono | `ui-monospace, monospace` |

Cargar en la app, si hay red:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Outfit:wght@400;520;600&display=swap" rel="stylesheet" />
```

El nombre de un rango va en Archivo Black, en mayúsculas, con tracking `0.045em`. Las etiquetas cortas («Nuevo rango», «Racha») van en Outfit, 12px, tracking `0.42em`, mayúsculas y color `--pf-text-dim`. El cuerpo va a 16px, interlineado 1.45.

## Forma

| Token | Valor |
| --- | --- |
| `--pf-radius-xs` | 6px |
| `--pf-radius-sm` | 10px |
| `--pf-radius-md` | 16px |
| `--pf-radius-lg` | 24px |
| `--pf-radius-xl` | 32px |
| `--pf-radius-pill` | 999px |

Los emblemas de rango son círculos. Las insignias son squircles de radio 16 en una caja de 64. Esa diferencia tiene que mantenerse: el círculo es transformación, el squircle es logro.

El trazo de marco es 1.5. El glifo interior tiene que seguir leyéndose a 48px. El arco blanco del borde superior es un brillo al 13–14% de opacidad; no se refuerza.

## Luz y sombra

| Token | Valor |
| --- | --- |
| `--pf-shadow-lift` | `0 16px 40px rgba(0, 0, 0, 0.45)` |
| `--pf-shadow-inset` | `inset 0 1px 0 rgba(255, 255, 255, 0.06)` |
| `--pf-glow-orange` | `0 0 32px rgba(255, 106, 26, 0.38)` |
| `--pf-glow-blue` | `0 0 32px rgba(59, 130, 255, 0.32)` |
| `--pf-glow-gold` | `0 0 28px rgba(255, 197, 61, 0.34)` |

Un solo resplandor por pieza. El aura va detrás del emblema, no encima del texto.

## Movimiento

| Token | Valor | Uso |
| --- | --- | --- |
| `--pf-dur-instant` | 80ms | Pulsación |
| `--pf-dur-fast` | 160ms | Hover, toggles |
| `--pf-dur-base` | 240ms | Paneles |
| `--pf-dur-slow` | 480ms | Entradas de pantalla |
| `--pf-dur-drama` | 900ms | Transformación |
| `--pf-ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entradas |
| `--pf-ease-impact` | `cubic-bezier(0.2, 0.9, 0.2, 1)` | Golpe |
| `--pf-ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Respiración del aura |

La respiración del aura dura 3.4–3.6s. Con `prefers-reduced-motion: reduce` no hay flash, líneas ni sacudida: el rango destino aparece quieto.

## Logo

| Archivo | Uso |
| --- | --- |
| `brand/logo-horizontal.svg` | Cabecera y bienvenida, solo sobre fondo oscuro |
| `brand/logo-symbol.svg` | Sello, avatar, pie |
| `brand/favicon.svg` | Favicon. Es el mismo monograma, sin fondo |

El símbolo es una P geométrica: azul a la izquierda, naranja a la derecha, chispa dorada en el contraforma. El aire libre alrededor del símbolo es, como mínimo, el ancho de la barra azul.

`FITNESS` es un descriptor, no un segundo logotipo. No se recolorea el monograma ni se le añade contorno negro.

## Iconos PWA

| Archivo | Tamaño | Notas |
| --- | --- | --- |
| `brand/icon-192.png` | 192 | Fondo a sangre |
| `brand/icon-512.png` | 512 | Fondo a sangre |
| `brand/apple-touch-icon.png` | 180 | Opaco |
| `brand/icon-maskable-512.png` | 512 | El símbolo cabe en el círculo central del 80% |
| `brand/icon.svg` | máster | Fuente del icono normal |
| `brand/icon-maskable.svg` | máster | Fuente del maskable |

Los PNG salen de los máster SVG. No llevan esquinas redondeadas: el sistema operativo recorta.

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.webmanifest" />
```

En el manifest web de la PWA, `icon-512.png` va con `purpose: "any"` e `icon-maskable-512.png` con `purpose: "maskable"`.

## Rangos

El orden es fijo. Cada emblema vive en `ranks/{id}.svg` y se lee a 48px y a 256px.

| Orden | Id | Nombre | Fase | Color | Secundario | Línea |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `chispa` | Chispa | tenue | `#9FD4FF` | `#EAF6FF` | Una chispa basta para empezar. |
| 2 | `brasa` | Brasa | estable | `#FF6A1A` | `#FFB088` | El calor ya se sostiene solo. |
| 3 | `llama` | Llama | ardiente | `#FF4D00` | `#FFC53D` | La llama responde a la constancia. |
| 4 | `incendio` | Incendio | ardiente | `#FF2D00` | `#FFC53D` | El fuego ocupa el cuerpo entero. |
| 5 | `tormenta` | Tormenta | relámpago | `#7AA2FF` | `#D6E4FF` | El aire cambia antes del trueno. |
| 6 | `relampago` | Relámpago | relámpago | `#5CE1FF` | `#F3FCFF` | El instante se parte en dos. |
| 7 | `nova` | Nova | relámpago | `#FFC53D` | `#FFF6D8` | Un núcleo nuevo abre el paso. |
| 8 | `eclipse` | Eclipse | soberana | `#FFC53D` | `#F4F1EA` | La luz se aprieta detrás del disco. |
| 9 | `mitico` | Mítico | soberana | `#FFC53D` | `#9EBEFF` | El aura ya tiene nombre. |
| 10 | `absoluto` | Absoluto | soberana | `#FFF8E8` | `#FFC53D` | Nada queda fuera del círculo. |

Siluetas, en el mismo orden: estrella pequeña, diamante, una llama, dos llamas, tres arcos, rayo, estrella de ocho puntas, creciente, hexágono partido, halo con estrella.

En pantalla el nombre se muestra en mayúsculas (`CHISPA`, `RELÁMPAGO`, `MÍTICO`). El nombre con acentos y mayúscula inicial es el nombre accesible.

## Insignias

Doce logros. El nombre visible está en `manifest.json`, en `insignias`.

| Id | Nombre | Archivo |
| --- | --- | --- |
| `primera-sesion` | Primera sesión | `badges/primera-sesion.svg` |
| `racha-7` | Racha de 7 | `badges/racha-7.svg` |
| `racha-30` | Racha de 30 | `badges/racha-30.svg` |
| `reto-heroe` | Reto del héroe | `badges/reto-heroe.svg` |
| `record-personal` | Récord personal | `badges/record-personal.svg` |
| `arco-terminado` | Arco terminado | `badges/arco-terminado.svg` |
| `cien-entrenos` | 100 entrenos | `badges/cien-entrenos.svg` |
| `volumen` | Volumen | `badges/volumen.svg` |
| `madrugador` | Madrugador | `badges/madrugador.svg` |
| `semana-perfecta` | Semana perfecta | `badges/semana-perfecta.svg` |
| `transformacion` | Transformación | `badges/transformacion.svg` |
| `fuerza` | Fuerza | `badges/fuerza.svg` |

El texto del logro va en HTML, al lado o debajo. No está dibujado dentro del SVG, salvo las cifras 7, 30 y 100, que son el glifo.

## Ilustraciones

Lienzo `1200×750`, fondo `#07080D`, sin texto. El titular lo pone la interfaz.

| Id | Uso |
| --- | --- |
| `onboarding-enciende` | Bienvenida. La barra enciende una columna de aura. |
| `onboarding-rangos` | La escala: chispa, llama, rayo y nova. |
| `onboarding-racha` | Siete brasas. La última es hoy. |
| `onboarding-listo` | Entrada. El símbolo dentro del frame de impacto. |
| `empty-biblioteca` | Biblioteca sin ejercicios. |
| `empty-historial` | Historial sin sesiones. |
| `empty-reto` | Reto todavía no empezado. |
| `empty-rutinas` | Sin rutinas. |

Los vacíos usan el mismo mundo, más bajo de contraste y con un solo punto cálido. No se sustituyen por una caja gris con un icono genérico.

## Efectos

`effects/tokens.css` define las variables. `effects/aura.css` la importa y añade clases.

```html
<div class="pf-aura pf-aura--brasa">…</div>
<div class="pf-speed is-rush"></div>
<div class="pf-impact is-hit"></div>
<div class="pf-shock is-hit"></div>
```

| Clase | Qué hace |
| --- | --- |
| `.pf-aura` | Resplandor detrás del elemento. `--pf-aura` cambia el color. |
| `.pf-aura--{id}` | Fija el color del rango. |
| `.pf-speed` | Líneas radiales. `.is-rush` las dispara una vez. |
| `.pf-impact` | Marco interior. `.is-hit` hace el flash. |
| `.pf-shock` | Anillo que se expande. |

SVG sueltos, fondo transparente, para superponer:

| Archivo | Uso |
| --- | --- |
| `effects/speed-lines.svg` | Líneas radiales. `mix-blend-mode: screen`. |
| `effects/impact-frame.svg` | Esquinas en proporción de teléfono, 390×844. |
| `effects/aura-orb.svg` | Orbe naranja detrás de un emblema. |
| `effects/shockwave.svg` | Tres anillos. |

## Pantalla de transformación

Carpeta autónoma: `transformation/index.html`, `transformation.css`, `transformation.js`. Sin dependencias de red. Al abrirla, muestra Chispa y pasa a Brasa. Un clic, Enter o Espacio repite la secuencia. `?bucle=1` (o `loop=1`) la deja en ciclo para grabar.

Parámetros:

| Parámetro | Efecto |
| --- | --- |
| `desde` o `from` | Rango de origen. Default `chispa`. |
| `hacia` o `to` | Rango de destino. Default `brasa`. |
| `bucle=1` o `loop=1` | Repite. |
| `autoplay=0` | Espera al clic. |
| `controles=1` o `controls=1` | Selectores de rango y botón Repetir. |
| `freeze=from` | Quieto en el origen. También vale `desde`. |
| `freeze=hold` | Quieto en el destino, con aura en respiración. |
| `freeze=impact` | Cartel del golpe. También vale `impacto`. |
| `motion=reduce` | Sin animación. |

La secuencia dura unos 2.6s más la pausa inicial: el rango actual respira, el aura se comprime, entran las líneas, el flash y las esquinas golpean, y el rango nuevo se estampa con su nombre. Al terminar, si la página está en un iframe, envía:

```js
{ type: "poder:transformacion-completa", desde: "chispa", hacia: "brasa" }
```

### Montaje en React

La vía aislada es un iframe. El CSS de la pantalla no se mezcla con el de la app.

```tsx
import { useEffect, useRef } from "react";

type RangoId =
  | "chispa"
  | "brasa"
  | "llama"
  | "incendio"
  | "tormenta"
  | "relampago"
  | "nova"
  | "eclipse"
  | "mitico"
  | "absoluto";

export function Transformacion({
  desde,
  hacia,
  alTerminar,
}: {
  desde: RangoId;
  hacia: RangoId;
  alTerminar?: (detalle: { desde: RangoId; hacia: RangoId }) => void;
}) {
  const marco = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function alMensaje(evento: MessageEvent) {
      if (evento.source !== marco.current?.contentWindow) return;
      if (evento.data?.type !== "poder:transformacion-completa") return;
      alTerminar?.(evento.data);
    }
    window.addEventListener("message", alMensaje);
    return () => window.removeEventListener("message", alMensaje);
  }, [alTerminar]);

  const src = `/transformacion/index.html?desde=${desde}&hacia=${hacia}`;
  return (
    <iframe
      ref={marco}
      title="Transformación de rango"
      src={src}
      className="h-dvh w-full border-0 bg-[#07080D]"
    />
  );
}
```

Copiar la carpeta `transformation/` a `public/transformacion/`.

Para montarla dentro del árbol de React, incluir `transformation.css` y `transformation.js` y llamar a la API. El CSS de la escena vive bajo `.pf-transform`. Las `@font-face` sí son globales, con los nombres `Poder Display` y `Poder Sans`.

```tsx
useEffect(() => {
  const nodo = ref.current;
  if (!nodo || !window.PoderTransformacion) return;
  const api = window.PoderTransformacion.iniciar(nodo, {
    desde,
    hacia,
    auto: true,
    alTerminar,
  });
  return () => api.destruir();
}, [desde, hacia, alTerminar]);
```

El nodo necesita la misma estructura que `index.html` (clases `pf-transform`, `aura`, `emblem`, `rank-name`, `flavor`, `speed`, `frame`, `flash`). `reproducir(desde, hacia)` relanza la secuencia. `mostrar(id)` deja un rango quieto. `rangos` es el catálogo sin los SVG.

## Tokens para Tailwind v4

`effects/tokens.css` es la fuente. En la app se puede mapear así:

```css
@import "tailwindcss";

@theme {
  --color-pf-bg: #07080d;
  --color-pf-bg-elevated: #10131a;
  --color-pf-surface: #171c28;
  --color-pf-surface-2: #212838;
  --color-pf-line: #2c3548;
  --color-pf-line-strong: #3d4860;
  --color-pf-text: #f4f1ea;
  --color-pf-text-dim: #9aa3b5;
  --color-pf-text-faint: #6b7488;
  --color-pf-orange: #ff6a1a;
  --color-pf-orange-deep: #e24e00;
  --color-pf-orange-soft: #ff8a3d;
  --color-pf-gold: #ffc53d;
  --color-pf-gold-soft: #ffe3a3;
  --color-pf-blue: #3b82ff;
  --color-pf-blue-deep: #1d4ed8;
  --color-pf-cyan: #5ce1ff;

  --font-display: "Archivo Black", "Arial Black", Impact, sans-serif;
  --font-sans: "Outfit", "Avenir Next", "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  --radius-pf-xs: 6px;
  --radius-pf-sm: 10px;
  --radius-pf-md: 16px;
  --radius-pf-lg: 24px;
  --radius-pf-xl: 32px;

  --shadow-pf-lift: 0 16px 40px rgba(0, 0, 0, 0.45);
  --shadow-pf-glow-orange: 0 0 32px rgba(255, 106, 26, 0.38);
  --shadow-pf-glow-blue: 0 0 32px rgba(59, 130, 255, 0.32);
  --shadow-pf-glow-gold: 0 0 28px rgba(255, 197, 61, 0.34);

  --ease-pf-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-pf-impact: cubic-bezier(0.2, 0.9, 0.2, 1);
  --ease-pf-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
```

Las duraciones se quedan como variables CSS (`--pf-dur-fast`, etc.). No hace falta convertirlas a una escala de Tailwind.

## Índice

`manifest.json`, junto a estas carpetas, lista cada archivo con `id`, `ruta`, `uso`, `alt` y `peso`. También trae `rangos` e `insignias` con el nombre en español. Las rutas son relativas a la carpeta de medios (`media/` en el almacén del proyecto, `design/` en el repositorio).
