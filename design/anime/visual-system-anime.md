# HUD anime — Poder Fitness

Dirección del dueño, y manda sobre el estudio: anime a tope. Auras, rayos, trama de manga marcada, paneles cortados, colores eléctricos. Tiene que leerse como el HUD de un juego de lucha. El modo `prefers-reduced-motion: reduce` se queda quieto (sin shake ni parpadeo) y conserva la misma identidad.

No hay personajes, nombres, logos, tipografías de marca ni sonidos de ninguna serie. El sonido de la transformación sale de osciladores de Web Audio. Los colores de rango no se reasignan.

Los mockups de referencia, a 390×844, están en `media/anime/mockups/`:

- `hoy.png` — el poder es el héroe.
- `reproductor.png` — la serie en curso, como un asalto.
- `reproductor-impacto.png` — el golpe al cerrar la serie.

Las cifras de esos PNG (1.840, 720/900, +40 XP) son de muestra. En la app entra el número que la sesión ya calcula.

## Tokens

Enlazar, en este orden, sin CDN:

```html
<link rel="stylesheet" href="tokens/tokens.css" />
<link rel="stylesheet" href="panel/panel.css" />
<link rel="stylesheet" href="efectos/efectos.css" />
```

| Token | Valor | Uso |
| --- | --- | --- |
| `--pf-bg` | `#07080D` | Fondo |
| `--pf-surface` | `#10131A` | Panel |
| `--pf-surface-2` | `#171C28` | Segmento vacío, pista del anillo |
| `--pf-text` | `#F4F1EA` | Texto de interfaz |
| `--pf-text-dim` | `#9AA3B5` | Meta |
| `--pf-oro` / `--pf-gold` | `#FFE14A` | Cifra de poder, +XP, placas |
| `--pf-gold-rank` | `#FFC53D` | Oro de rango (Nova, Eclipse, Mítico). No sustituye al oro eléctrico |
| `--pf-orange` | `#FF5A12` | Acción, fuego |
| `--pf-blue` | `#2E6BFF` | Azul eléctrico |
| `--pf-cyan` | `#3DF0FF` | Cian de cromo |
| `--pf-chamfer` | `32px` | Chaflán superior derecho e inferior izquierdo |
| `--pf-border` | `4px` | Borde luminoso |
| `--pf-skew` | `-14deg` | Placas y barras en paralelogramo |
| `--pf-shadow-lift` | `0 16px 40px rgba(0,0,0,.45)` | Una sombra de apoyo |
| `--pf-touch` | `44px` | Mínimo de tacto |

El glow de una pieza es de un solo color (el aura activa), con núcleo y halo. No se apila un arcoíris. `--pf-aura` cambia con el rango.

`#F4F1EA` sobre `#07080D` es el texto de interfaz. Oro, naranja y cian van en cifras de 24 px o más, en rellenos y en bordes. Una serie hecha lleva la palabra «Hecha» o el sello, no solo un cambio de color. El botón de fuego usa texto `#07080D` sobre `#FF5A12`.

## Tipografía

OFL, archivos en `fuentes/`. El recorte latino incluye Á, É, Í, Ó, Ú y Ñ. No hace falta red.

| Rol | Familia CSS | Archivo | Origen |
| --- | --- | --- | --- |
| Display | `Poder Display` | `bebas-neue-latin-400.woff2` | Bebas Neue, Dharma Type |
| Cifras | `Poder Cifra` | `rajdhani-latin-700.woff2` | Rajdhani 700, Indian Type Foundry |
| Cuerpo | `Poder Sans` | `outfit-latin-400.woff2`, `outfit-latin-600.woff2` | Outfit |
| Series | `Poder Mono` | `jetbrains-mono-latin-500.woff2` | JetBrains Mono |

Cada carpeta de la fuente lleva su `LICENSE-*.txt`. Display en mayúsculas, tracking `0.04em` a `0.12em`. Cifras con `font-variant-numeric: tabular-nums`. Cuerpo a 16 px, interlineado 1.45.

La cifra de poder (`.pf-poder`) va a 64–84 px, Rajdhani 700, `#FFE14A`, con glow del aura del rango. El XP del nivel va debajo, a 16 px, en hueso. El oro no se pone sobre un bloque naranja.

## Panel

`.pf-panel` recorta las esquinas superior derecha e inferior izquierda a 32 px y pinta un borde de 4 px del aura hacia el oro. `.pf-panel--inclinado` baja además el canto superior. `.pf-panel__tono` mete la trama solo en el fondo del panel, detrás del texto.

`.pf-placa` es la etiqueta en paralelogramo (14°). El texto interior deshace el skew.

`panel/panel.svg` es el mismo corte para usarlo como asset. `panel/textura-energia.svg` es la trama marcada sobre el gradiente de rango → `#FFE14A`. Los puntos son negros y se leen; no es un grano al 12 %.

La trama va en rellenos de medidor, bandas y discos. No va encima del texto de 14 px.

## Medidor, anillo, golpe

**Medidor de super** (`.pf-super`): cuatro segmentos, separación 3 px, alto 12 px, corte en paralelogramo. Vacío: `#171C28`. Lleno: `.is-on`, del color de `--pf-aura` a `#FFE14A`, con trama. Parcial: `.is-parcial` y `--p` (por ejemplo `80%`). Al cerrar el nivel, `.is-pulso` hace una sola vez 1 → 0.65 → 1 en 480 ms. Con movimiento reducido se queda lleno y quieto. `efectos/medidor-super.svg` muestra la fila vacía y la llena.

**Anillo** (`.pf-anillo`): diámetro 112 px dentro de la horquilla 96–120, trazo 8 px, el arco empieza arriba. `--p` de 0 a 1 es el descanso que el reproductor ya tiene. La cifra (`.pf-anillo__cifra`) va dentro, a 40 px, en hueso. `efectos/anillo-carga.svg` es el ejemplar.

**Flash** (`.pf-flash.is-hit`): blanco al 55 % durante 80 ms y después el aura al ~28 % durante 120 ms. Un golpe, dos capas, nunca tres destellos en un segundo. Sin rojo a pantalla completa.

**Shake** (`.pf-escenario.is-shake`): solo el escenario del ejercicio, 4 px, dos oscilaciones, 160 ms. El peso y los botones no se mueven.

**Frame** (`.pf-marco.is-hit`): cuatro esquinas de 118 px, borde 10 px en oro, filete cian, glow. En el PNG de impacto se ven a sangre. `efectos/frame-impacto.svg` es el mismo marco en 390×844.

**+XP** (`.pf-xp.is-hit`): «+N XP», 36 px, `#FFE14A`. Sube 32 px en 480 ms y se desvanece. Uno a la vez.

**Sello** (`.pf-hecho`): la palabra «Hecho», −8°, de escala 1.12 a 1 en 240 ms, borde 3 px del aura. No tapa la cifra del medidor ni encoge el botón.

Rayos: `efectos/rayos.svg`, trazo cian de 8 px con núcleo blanco. Líneas: `efectos/lineas-velocidad.svg`, opacidad alta, `mix-blend-mode: screen`. Partículas: `efectos/particulas.svg`.

## Emblemas

Silueta fija, de menos a más ornamento. El aura está dentro del SVG (se lee aunque se use como `<img>`) y crece de Chispa a Absoluto. Ids fijos.

| Id | Aura | De más |
| --- | --- | --- |
| `chispa` `#9FD4FF` | glow visible, el más corto | un corte en el anillo |
| `brasa` `#FF6A1A` | más ancho | doble corte, diamante |
| `llama` `#FF4D00` | más | una llama y esquinas |
| `incendio` `#FF2D00` | más | dos llamas, esquinas, brillo |
| `tormenta` `#7AA2FF` | más | tres arcos y un arco exterior |
| `relampago` `#5CE1FF` | más | rayo, arco y chispa |
| `nova` `#FFC53D` | más | estrella de ocho y doble borde |
| `eclipse` `#FFC53D` | más | creciente, disco y corona |
| `mitico` `#FFC53D` / `#9EBEFF` | doble anillo | hexágono partido |
| `absoluto` `#FFF8E8` / `#FFC53D` | halo máximo | estrella, cuatro señales, rayos |

Archivo: `emblemas/{id}.svg`. En victoria el emblema va a 160 px.

## Ilustraciones originales

Sentadilla, Zancada y Curl femoral deslizante no tienen archivo Everkinetic. Van en `ilustraciones/`, lienzo 800×640, fondo `#07080D`, línea clara con glow. No llevan texto. No se atribuyen a Everkinetic y no se sustituyen por el logo.

| Id | Archivo |
| --- | --- |
| `sentadilla` | `ilustraciones/sentadilla.svg` |
| `zancada` | `ilustraciones/zancada.svg` |
| `curl-femoral-deslizante` | `ilustraciones/curl-femoral-deslizante.svg` |

`mockups/press-banca.svg` es otro dibujo original, solo para el escenario de los mockups del reproductor.

## Everkinetic

Los SVG de [everkinetic/data](https://github.com/everkinetic/data) siguen en CC BY-SA 4.0 ([deed](https://creativecommons.org/licenses/by-sa/4.0/)). No se editan. `everkinetic/linea.css` los presenta como línea clara tintada sobre `#07080D`.

```html
<div class="pf-ek pf-ek--hueso">
  <img src="ejercicios/press-banca.svg" alt="Press banca" />
</div>
```

Clases de tinta: `pf-ek--hueso`, `pf-ek--cian`, `pf-ek--oro`. La hoja invierte el blanco opaco (`invert` + `contrast`) y tiñe con `mix-blend-mode: multiply`. Si el fondo blanco se quedara, la carta sería un recuadro blanco.

Texto de crédito, listo para la ficha:

> Ilustraciones de ejercicio: Everkinetic (https://github.com/everkinetic/data), licencia CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). En Poder Fitness se muestran como línea clara tintada sobre fondo oscuro mediante CSS. Esa presentación es una modificación visual; los archivos SVG originales no se alteran. Una exportación de esa vista es un derivado y sigue bajo CC BY-SA 4.0. Sentadilla, Zancada y Curl femoral deslizante son dibujos originales de Poder Fitness y no pertenecen a Everkinetic.

La licencia cubre esos SVG, no el código de la app.

## Transformación

Carpeta autónoma: `transformacion/index.html`, `transformacion.css`, `transformacion.js`. Sin red. Se puede grabar: al abrir `?demo=1` recorre Chispa → Brasa y se queda en el emblema nuevo.

Beats, unos 3,1 s: el origen respira un instante, la pantalla se va a negro, el aura carga, entran rayos y líneas, un flash blanco y luego el color del rango, el emblema nuevo golpea con el frame, el nombre se estampa, salen partículas y el plano queda sostenido. Un clic, Enter o Espacio salta al final; si ya terminó, repite. El sonido son tres osciladores (sierra de carga, cuadrada de golpe, seno corto). Si el navegador bloquea el audio hasta un gesto, la imagen igual corre; el toque reanuda el contexto.

Al terminar, si está en un iframe:

```js
{ type: "poder:transformacion-completa", desde: "chispa", hacia: "brasa" }
```

| Parámetro | Efecto |
| --- | --- |
| `demo=1` | Fuerza Chispa → Brasa y autoplay |
| `desde` / `from`, `hacia` / `to` | Rangos. Ids en ASCII (`relampago`, `mitico`) |
| `bucle=1` o `loop=1` | Repite tras una pausa |
| `autoplay=0` | Espera al clic |
| `motion=reduce` | Quieto, aunque el sistema no lo pida |

Con `prefers-reduced-motion: reduce` no hay shake, flash, líneas en movimiento ni barrido de sonido. Aparece el emblema de destino, el nombre, el aura quieta y el marco. La misma pieza, sin el golpe.

Montaje aislado:

```html
<iframe title="Transformación de rango" src="transformacion/index.html?desde=chispa&hacia=brasa"></iframe>
```

## Pantallas

La función no cambia. Cambia el contenedor.

**Hoy (`/`).** El nivel de poder es el héroe: emblema, `.pf-poder`, XP en hueso y `.pf-super` del tramo de este nivel. Detrás, rayos y líneas de velocidad. La semana son siete pipas (hecha, hoy, prevista, vacía) dentro de un panel inclinado. La sesión del día es un panel cortado con la acción principal (mínimo 44 px). El Reto del héroe sigue en cuatro anillos, con enlace a `/reto`.

**Reproductor (`/entreno/:id`).** Pantalla de combate. «Ejercicio N de M» es el marcador de asalto. La ilustración ocupa la ventana de la carta; debajo, la placa con nombre, patrón y carga. Completar serie dispara `.pf-flash`, `.pf-marco`, `.pf-xp` y, si hay movimiento, `.pf-escenario.is-shake`. El descanso es `.pf-anillo` con la cifra dentro; −15 y +15 miden 44×44. La lista de series no abre otra pantalla. Cada serie hecha dice «Hecha».

**Victoria (`/entreno/:id/resumen`).** Emblema a 160 px, la cifra de poder cuenta en 700 ms (con movimiento reducido, el total quieto), cada récord es un `.pf-hecho`, un botón primario para salir. Sin segunda pantalla de botín.

**Reto (`/reto`).** Los cuatro medidores son las misiones del día. Al llegar al objetivo, sello «Hecho». El historial de días no gana una animación de reclamo.

**Biblioteca (`/biblioteca`) y ficha.** Carta `.pf-panel`: ventana de ilustración arriba (Everkinetic con `.pf-ek`, o el SVG original si es Sentadilla, Zancada o Curl femoral deslizante), placa con nombre, patrón y equipo abajo. Búsqueda y filtros iguales.

**Estadísticas.** Historial, volumen, récords, peso y Poder usan esa carta. El récord lleva sello. Poder enseña la escala de los diez emblemas, de Chispa a Absoluto.

## Movimiento reducido

La puerta es `prefers-reduced-motion: reduce` y, en la transformación, también `motion=reduce`.

- Sin shake, sin flash, sin líneas que entren disparadas, sin cifra que cuenta, sin pulso del medidor.
- El medidor lleno se queda lleno. El sello y el +XP pueden estar visibles y quietos.
- Rayos y marco pueden quedarse como dibujo estático: son la identidad, no un parpadeo.
- El tema suave de la app puede usar la misma puerta.

Completar serie, terminar, +15 s y −15 s miden al menos 44×44 px.
