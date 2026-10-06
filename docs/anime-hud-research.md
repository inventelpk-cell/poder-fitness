# Estudio visual — HUD anime para Poder Fitness

Dirección cerrada: anime a tope. Auras, rayos, impacto, color intenso, lectura de videojuego. Este texto no abre esa decisión. No cambia rutas, datos ni reglas. No hay vida que baje, ni oro, ni tienda.

No se copian nombres, logos, personajes, tipografías de marca ni efectos reconocibles de ninguna serie. Abajo va el patrón, no el asset.

Mobbin pedía autenticación y no se usó. Las fuentes son artículos públicos.

## 1. Ocho referencias

**1. Barra de super en cuatro bloques.** [Ultra Street Fighter IV / HUD](https://wiki.supercombo.gg/w/Ultra_Street_Fighter_IV/HUD). El medidor se parte en cuatro tramos iguales y solo parpadea al llenarse. El contador de golpes sale al lado de quien actúa. El tiempo es una cifra grande y quieta. Para la app: el tramo de XP del nivel se parte así; el descanso es la cifra grande.

**2. Barra que se lee sin número.** [Street Fighter V / HUD](https://wiki.supercombo.gg/w/Street_Fighter_V/HUD). La barra pasa de un color frío a amarillo hacia el centro y se vacía de fuera adentro. El estado se ve de un vistazo. Para la app: el medidor de nivel se llena de un extremo y se calienta al pasar de la mitad. Es progreso, no vida.

**3. Arco, textura de daño y combo que entra y sale.** [The Hudsucker Proxy](https://skullgirls.com/2011/07/the-hudsucker-proxy/) (bitácora del HUD de Skullgirls). Una tira horizontal no comunicaba el nivel; lo sustituyeron por un arco. El daño reciente lleva otra textura, no solo otro color. El contador entra y sale. El golpe añade un flash corto de textura. Para la app: el descanso es un anillo; la serie hecha se distingue de la actual por forma; el flash dura un golpe.

**4. Paneles en ángulo y capa distinta.** [Salud en Tekken 8](https://esports.gg/news/tekken-8/health-in-tekken-8-explained/) y [barras del HUD](https://tekkenwarehouse.com/tekken8/lifebars/). Las barras no son rectángulos. Retrato y nombre van juntos. La porción recuperable es una capa gris, separada de la barra real, y hay muescas de umbral. Para la app: paneles cortados. La capa gris, si se usa, lleva etiqueta («descanso», «XP de este nivel») y nunca se lee como vida.

**5. El rango se lee antes que el texto.** [Guía de UI tipo miHoYo](https://designbycurio.com/learn/mihoyo-genshin-ui-2024). Esquinas con corchetes, oro sobre índigo oscuro, brillo como luz de dentro. A más rareza, más ornamento, no más colores. Para la app: Chispa casi sin marco; Absoluto con halo y doble borde. Un color de aura por rango, los que ya están fijados.

**6. Carta con ventana y placa.** [Análisis de ficha y de pantalla de resultados](https://www.chungweijin.com/gameux/elvtr-advanced-genshin). El borde dice la calidad. Las cifras van en una placa, no encima del retrato. El resultado tiene que escanearse. Para la app: ficha de ejercicio y récord son cartas; la ilustración ocupa la ventana.

**7. El ejercicio sigue visible mientras cuentas.** [Combates de Ring Fit](https://www.ign.com/wikis/ring-fit-adventure/Fit_Battles) y [cierre de sesión](https://jonlim.ca/blog/ring-fit-adventure-30-day-review/). La demostración se queda en pantalla. Una barra dice cuántas acciones quedan. El tipo de ejercicio tiene color. Al terminar se celebran los totales de esa sesión, no una lluvia de botín. Para la app: el dibujo ocupa el escenario del reproductor; completar serie es el golpe; el resumen lista poder y récords de esa sesión.

**8. Marco que cambia al subir y lista corta del día.** [Arise](https://www.ariseworkout.com/). La ficha de rango cambia de material (bronce, plata, oro, violeta) y los retos del día son una lista con relleno. Para la app: los cuatro anillos del Reto del héroe, con sello al cumplir cada uno. Sin penalización y sin vocabulario de caza.

### Qué se ve barato

- Degradado arcoíris, triple glow y estrellas de stock en cada tarjeta.
- Halftone tan cerrado que el texto de 14 px se rompe.
- Flash rojo a pantalla completa, o shake en cada toque.
- Cadenas de recompensa que no se pueden saltar. Es la queja recurrente de los clientes de gacha: [pantallas de más](https://www.reddit.com/r/gachagaming/comments/1jo1bwa/).
- Un solo violeta neón sobre negro en toda la app.
- Fuentes de logo, brush «manga» falso, o una hoja de estilos servida por CDN.
- Redibujar un aura, un rayo o un sello que ya se reconoce como de una serie.

## 2. Patrones ejecutables

Medidas para esta app. No son el tamaño de los juegos citados.

### Panel

- Chaflán de 14 px en la esquina superior derecha y en la inferior izquierda. El resto del panel queda vivo.
- Barra en paralelogramo de 14° (útil entre 12° y 16°). A 45° parece cinta de obra.
- Borde de 2 px en el color de aura del rango, más una línea interior de 1 px en `#F4F1EA` al 35 %.
- Barra de super: 10 px de alto. El lado cortado no lleva radio.
- Una sombra: `0 16px 40px rgba(0,0,0,.45)`. Un solo glow, 28–32 px, opacidad 0,32–0,38.

### Textura

- Halftone: puntos de 2 px, paso de 6 px, opacidad 0,12. Solo dentro del relleno de la barra.
- Metal: brillo de 1 px en el 18 % superior del panel, blanco al 14 %.
- Energía: el último 20 % del medidor pasa del color de rango a `#FFE14A`.

### Paleta de partida

| Uso | Hex |
| --- | --- |
| Fondo | `#07080D` |
| Superficie | `#10131A` |
| Texto | `#F4F1EA` |
| Oro eléctrico | `#FFE14A` |
| Naranja | `#FF5A12` |
| Azul eléctrico | `#2E6BFF` |
| Cian eléctrico | `#3DF0FF` |

Los colores de rango no se reasignan. Siguen los de `design/visual-system.md`.

### Tipografía

Empaquetar los woff2 en el build. Sin CDN. La spec ya lo exige.

- Display condensada: [Bebas Neue](https://github.com/dharmatype/bebas-neue), OFL. Solo mayúsculas, tracking `0.04em`. Nombres de rango y rótulos de dos a cuatro palabras.
- Cifras de poder: [Rajdhani 700](https://fontsource.org/fonts/rajdhani), OFL, con `font-variant-numeric: tabular-nums`.
- Cuerpo: Source Sans 3 u Outfit, OFL, 16 px, interlineado 1,45. Las series pueden seguir en JetBrains Mono (OFL) para que el peso no baile.

Orbitron se deja fuera de las cifras vivas: se lee mal a velocidad.

### Contador de poder

En Hoy: 64–72 px, Rajdhani 700, `#FFE14A`, glow del aura del rango a 24 px. El XP va debajo, a 16 px, en hueso. El oro no se pone sobre un bloque naranja.

### Medidor de super

Cuatro segmentos iguales, separación 3 px, alto 10 px. Vacío: `#171C28`. Lleno: del color de rango a `#FFE14A`. Al completar el nivel, un pulso de opacidad 1 → 0,65 → 1 en 480 ms, una sola vez. Con movimiento reducido se queda lleno y quieto.

### Anillo de carga

Trazo de 8 px, diámetro 96–120 px, el arco empieza arriba (−90°). Color de rango. La cifra del descanso va dentro, a 40 px, en hueso. Es el descanso que el reproductor ya tiene.

### Flash de impacto

Al completar una serie: velo blanco al 55 % durante 80 ms y, después, el color de rango al 25 % durante 120 ms. Como mucho dos destellos, y nunca tres en un segundo ([WCAG 2.2, criterio 2.3.1](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html)). Sin rojo a pantalla completa.

### Shake

Solo el escenario del ejercicio: 4 px, dos oscilaciones, 160 ms. El formulario de peso y los botones no se mueven.

### Popup de +XP

«+N XP», 28 px, `#FFE14A`. Sube 32 px en 480 ms y se desvanece. Uno a la vez. El número es el XP que la sesión ya calcula.

### Sello de misión

La palabra «Hecho», rotada −8°, de escala 1,12 a 1 en 240 ms. Tinta del color de rango, borde de 3 px. No tapa la cifra del medidor.

### Pantalla de victoria

`/entreno/:id/resumen` ya muestra el poder ganado y los récords. Se presenta así: emblema a 160 px, la cifra de poder cuenta en 700 ms, cada récord es un sello, un botón primario para salir. Sin segunda pantalla de botín.

### Secuencia de transformación

Cuando el XP cruza de rango (la app ya calcula los rangos cruzados): tres beats en unos 900 ms. Corte a negro 80 ms, líneas de velocidad una vez, emblema nuevo con su aura. Un toque la salta. Con movimiento reducido, el emblema nuevo aparece quieto.

## 3. Pantalla por pantalla

La función se queda. Cambia el contenedor.

**Hoy (`/`).** El nivel de poder es el héroe: emblema, cifra y medidor de super del tramo de nivel. La semana son siete pipas (hecha, hoy, prevista, vacía). La sesión del día es un panel cortado. El Reto del héroe sigue en los cuatro anillos, con enlace a `/reto`.

**Reproductor (`/entreno/:id`).** Pantalla de combate. «Ejercicio N de M» es el marcador de asalto. El dibujo ocupa el escenario. Completar serie dispara el flash y, si hay movimiento, el shake. El descanso es el anillo. La lista de series no abre otra pantalla.

**Victoria (`/entreno/:id/resumen`).** Resultado de esa sesión. Poder y récords, nada más.

**Transformación.** Overlay al cruzar rango. No añade rangos ni mueve el umbral de XP.

**Reto (`/reto`).** Los cuatro medidores son las misiones del día. Al llegar al objetivo, sello. El historial de días no gana una animación de reclamo.

**Biblioteca (`/biblioteca`) y ficha.** Carta: ventana de ilustración arriba, placa con nombre, patrón y equipo abajo. Búsqueda y filtros iguales.

**Estadísticas.** Historial, volumen, récords, peso y Poder usan esa misma carta. El récord lleva sello. Poder enseña la escala de rangos.

**Emblemas, de Chispa a Absoluto.** La silueta ya fijada se mantiene (estrella pequeña, diamante, una llama, dos llamas, tres arcos, rayo, estrella de ocho, creciente, hexágono partido, halo con estrella). Crece el marco y el aura. El secundario es el segundo color que ya tiene cada rango.

| Rango | Aura | Ornamento de más |
| --- | --- | --- |
| Chispa `#9FD4FF` | glow 12 px, opacidad 0,22 | un corte |
| Brasa `#FF6A1A` | 16 px, 0,28 | doble corte |
| Llama `#FF4D00` | 18 px, 0,30 | esquinas |
| Incendio `#FF2D00` | 20 px, 0,32 | esquinas y brillo |
| Tormenta `#7AA2FF` | 22 px, 0,32 | arco |
| Relámpago `#5CE1FF` | 24 px, 0,36 | arco y chispa |
| Nova `#FFC53D` | 26 px, 0,36 | doble borde |
| Eclipse `#FFC53D` | 28 px, 0,38 | disco |
| Mítico `#FFC53D` | 30 px, 0,40, segundo stop `#9EBEFF` | doble anillo |
| Absoluto `#FFF8E8` | 32 px, 0,42, segundo stop `#FFC53D` | halo |

## 4. Accesibilidad

`prefers-reduced-motion: reduce` baja al modo sobrio de la misma identidad: sin shake, sin parpadeo, sin líneas de velocidad y sin cifra que cuenta. El medidor lleno se queda lleno. El tema suave de la app puede usar la misma puerta.

El texto de interfaz va en `#F4F1EA` sobre `#07080D`. Oro, naranja y cian se reservan a cifras de 24 px o más, y a rellenos. Una serie hecha lleva la palabra «Hecha» o el sello, no solo un cambio de color.

Completar serie, terminar, +15 s y −15 s miden al menos 44×44 px. El sello no encoge el botón.

## 5. Ilustraciones Everkinetic

Las ilustraciones son CC BY-SA 4.0 ([everkinetic/data](https://github.com/everkinetic/data), [deed](https://creativecommons.org/licenses/by-sa/4.0/)). Se pueden teñir o invertir a línea clara sobre `#07080D`.

Eso es una modificación. Hay que acreditar a Everkinetic, enlazar la licencia y el origen, y decir que el archivo se tiñó o se invirtió. El derivado se publica también en CC BY-SA. La licencia cubre esos SVG, no el código de la app.

Los SVG de origen traen fondo blanco opaco. Al invertirlos, ese fondo tiene que desaparecer o teñirse. Si se queda, la carta es un recuadro blanco.

Sentadilla, Zancada y Curl femoral deslizante no tienen archivo. Hace falta ilustración original, a línea y sobre oscuro, en el mismo estilo. Esa pieza no se atribuye a Everkinetic.

## Ocho piezas que el arte entrega

1. Panel cortado, con borde de 2 px y chaflán de 14 px, en SVG reutilizable.
2. Textura de energía: halftone suave más gradiente del color de rango a `#FFE14A`.
3. Cifra de contador de poder en Rajdhani 700, lista para 64–72 px.
4. Medidor de super de cuatro segmentos, vacío y lleno.
5. Anillo de carga de trazo 8 px, con hueco para la cifra.
6. Un frame de flash de impacto (blanco y color de rango), sin bucle.
7. Popup «+XP» y sello «Hecho».
8. Los diez emblemas, de Chispa a Absoluto, con el ornamento y el aura de la tabla. La victoria y la transformación se montan con estas piezas; no son un undécimo estilo.
