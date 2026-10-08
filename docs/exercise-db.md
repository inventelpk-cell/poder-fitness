# Base de ejercicios

Catálogo offline de Poder Fitness: 290 ejercicios en español, con ilustraciones empaquetadas. No hay API ni red en tiempo de ejecución.

## Por qué esta fuente

La candidata inicial, [free-exercise-db](https://github.com/yuhonas/free-exercise-db), queda descartada para empaquetar la app.

El repositorio declara [The Unlicense](https://unlicense.org/) en `LICENSE.md` (GitHub la identifica como SPDX `Unlicense`) y el README lleva la insignia correspondiente. Esa dedicación no cubre las fotografías. En el [issue #2](https://github.com/yuhonas/free-exercise-db/issues/2) el autor dice que no sabe de dónde salen las imágenes ni si son libres de derechos. El proyecto padre, [wrkout/exercises.json](https://github.com/wrkout/exercises.json), advierte en el [issue #305](https://github.com/wrkout/exercises.json/issues/305) que las fotos se rasparon de internet, que el autor no tiene el copyright y que no conviene usarlas en un proyecto comercial. Una búsqueda inversa las relaciona con bodybuilding.com, cuyo sitio prohíbe redistribuir el contenido. El texto de las instrucciones coincide con esos mismos recopilatorios, así que la Unlicense tampoco limpia el texto. No se ha copiado nada de ese repositorio.

Otras opciones que no sirven para un paquete offline:

- [RepDB](https://github.com/RepDB/exercise-dataset) permite el uso dentro de una app con atribución, pero el término 3 de `LICENSE-DATA.md` prohíbe republicar el conjunto, o uno derivado, como dataset. No se puede versionar aquí.
- [wger](https://wger.de) no pide API key, pero las imágenes públicas están en CC-BY-SA 3 o 4 y las descripciones son HTML suelto, no pasos. No hay imágenes en CC-BY ni en CC0.
- Gym Visual y las bases que exigen cuenta o API key quedan fuera.

La fuente elegida es [everkinetic/data](https://github.com/everkinetic/data), el dataset abierto de Everkinetic creado por Greg Priday. Licencia del repositorio: **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**. El mantenedor confirmó que se puede usar en una app, también comercial, con atribución, y que el share-alike afecta a la obra adaptada (datos e ilustraciones), no al código de la aplicación ([issue #7](https://github.com/everkinetic/data/issues/7)).

CC BY-SA no está en la lista corta MIT, Apache, Unlicense, CC0 o CC-BY. No hay un corpus de ese grupo que traiga a la vez instrucciones y dibujos que se puedan empaquetar. CC BY-SA 4.0 es la licencia libre que sí autoriza el bundling offline de texto e ilustraciones. La traducción es una obra derivada y sigue bajo CC BY-SA 4.0. No se puede relicenciar el JSON ni las imágenes como MIT.

## Crédito para la pantalla Acerca de

Texto listo para mostrar:

> Datos de ejercicios: Everkinetic, creados por Greg Priday.
> https://github.com/everkinetic/data
>
> Licencia: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0).
> https://creativecommons.org/licenses/by-sa/4.0/deed.es
>
> Poder Fitness tradujo al español los nombres, los resúmenes, las instrucciones y los consejos, unificó el vocabulario de músculos y equipo, y empaquetó las ilustraciones para uso offline. Las ilustraciones no se han modificado.
>
> Esta base es una obra derivada y se mantiene bajo CC BY-SA 4.0.

La licencia legal completa, copiada tal cual de `LICENSE.md` del upstream, está en `data/exercises/LICENSE-SOURCE.txt`. La pantalla Acerca de debe poder mostrar ese texto íntegro, no solo el enlace.

El mismo bloque, en campos, está en `credito` dentro de `data/exercises/glossary.es.json`.

## Cómo está organizado el paquete

Todo vive en `data/exercises/`.

| Archivo | Qué es |
| --- | --- |
| `exercises.es.json` | Array de ejercicios. Un objeto por ejercicio. |
| `images/` | Ilustraciones referenciadas. Rutas relativas al directorio `data/exercises/`. |
| `glossary.es.json` | Vocabulario cerrado y crédito. |
| `exercises.types.ts` | Tipos del JSON, para importarlos tal cual. |
| `LICENSE-SOURCE.txt` | CC BY-SA 4.0 completa, texto original. |

Cada ejercicio tiene:

- `id`: slug estable del origen (`bench-press`). No cambia si se retoca el nombre en español.
- `sourceId`: id numérico único de Everkinetic, en string.
- `name`: nombre en español.
- `nameEn`: título original, para auditoría.
- `summary`: resumen corto. Puede ir vacío.
- `instructions`: pasos en tuteo.
- `tips`: consejos. Puede ir vacío.
- `primaryMuscles` y `secondaryMuscles`: id del glosario.
- `equipment`: id del glosario.
- `category`: siempre `fuerza`.
- `mechanic`: `compuesto`, `aislamiento`, `isométrico` o `mixto`.
- `level` y `force`: `null`. El origen no los trae.
- `images`: rutas como `images/0042-relaxation.svg`.

Las ilustraciones vectoriales usan el id de asset del origen (`id_num`):

- `relaxation` es la posición inicial.
- `tension` es la posición de contracción.

Si ese par SVG no existía, se copió el PNG que el propio dataset publica en `src/images-web`, con nombres `images/{id_num}-1.png`, `-2.png`, etc., en el orden del campo `img` upstream. Esos PNG también van bajo CC BY-SA 4.0. No hay hotlinks.

## Conteos

| | |
| --- | ---: |
| Ejercicios | 290 |
| Con al menos una imagen | 287 |
| Sin imagen | 3 |
| Archivos de imagen | 574 |
| SVG (269 ejercicios) | 537 |
| PNG de respaldo (18 ejercicios) | 37 |
| Instrucciones | 1558 |
| Consejos | 65 |
| Categoría `fuerza` | 290 |
| Mecánica `aislamiento` | 226 |
| Mecánica `compuesto` | 58 |
| Mecánica `isométrico` | 3 |
| Mecánica `mixto` | 3 |

Sin imagen: `bent-over-row-with-barbell`, `incline-inner-biceps-curl-with-dumbbell`, `standing-calf-raise-with-dumbbell`.

PNG en lugar de SVG: `arnold-press`, `balance-board`, `barbell-shoulder-press`, `butterfly-machine`, `chin-ups`, `cuban-dumbbell-press`, `dumbbell-raise`, `dumbbell-shoulder-press`, `front-barbell-raises`, `front-raises`, `gironda-sternum-chins`, `incline-chest-press`, `push-up-feet-elevated-2`, `push-ups-close-and-wide-hand-versions`, `seated-shoulder-press-machine`, `standing-one-arm-triceps-extension-with-dumbbell`, `standing-triceps-extension`, `wide-grip-lat-pull-down`.

Se partió de 293 fichas y se quitaron tres duplicados defectuosos:

- `0302`, stub de `smith-machine-incline-bench-press` (la ficha buena es `0081`).
- `0303`, stub de `smith-machine-dead-lifts` (la ficha buena es `0100`).
- `tate-press` (id 27), que repetía `tate-press-with-dumbbell` y además compartía el id de imagen `0020` con las aperturas posteriores con banda.

## Glosario

Los valores de músculos, equipo, categoría y mecánica son id cerrados. La etiqueta visible (`es`) y el inglés de origen están en `glossary.es.json`. Hay que mostrar el `id` o la etiqueta, sin volver a traducirlos en la UI.

Decisiones de vocabulario:

- Máquina Smith: `multipower`.
- Mancuerna, mancuernas y la errata `dumbell`: `mancuernas`.
- Cable y cable machine: `polea`.
- Banco plano agrupa `bench` y `flat bench`.
- Fitball agrupa exercise ball, stability ball y swiss ball.
- Contractora es la butterfly machine.
- `core` se deja así, como se dice en la sala.
- Préstamos que se mantienen en los nombres: press, curl, crunch, pullover, remo, jalón, bosu.

`level` y `force` no tienen valores. El origen no clasifica dificultad ni empuje/tirón.

## Revisión de la traducción

Las instrucciones se tradujeron por lotes y se revisaron más de 40 ejercicios de pecho, espalda, hombros, brazos, piernas, gemelos, abdomen, lumbar y cuello. El tuteo es el de sala: «Túmbate en el banco», «Agarra la barra», «Vuelve a la posición inicial». No quedan frases en inglés.

Correcciones hechas en esa pasada:

- Se eliminaron pasos que solo decían «Pasos.» (`alternating-biceps-curl-with-dumbbell`, `flat-bench-cable-flys`, `front-squat-to-bench-with-barbells`, `triceps-pushdown-with-v-bar-and-cable`).
- Se eliminó un paso que era HTML vacío (`<h3></h3>` en la elevación frontal con mancuernas).
- «Cambia el sentido y también de pie» pasó a «Cambia el sentido y cambia de pie» en los círculos de tobillo.
- «Pelota de estabilidad» y «balón suizo» se unificaron a fitball.

## Limitaciones que el builder debe conocer

- `mechanic` copia el campo `type` de Everkinetic. El origen marca como `isolation` ejercicios que en sala son compuestos. El press de banca inclinado (`incline-bench-press`) es el caso claro: llega como `aislamiento`. No se ha reetiquetado el resto para no inventar una clasificación distinta de la fuente.
- En cuatro fichas el origen no traía tipo o equipo y sí se rellenó, porque si no la UI quedaba vacía: `push-up-feet-elevated` (pecho, hombros, tríceps, peso corporal, banco plano, compuesto), `biceps-curl-with-machine` (máquina), `wide-grip-chin-up` (peso corporal, barra, compuesto) y `biceps-curl-lunge-with-bowling-motion` (compuesto).
- Muchos pasos 1 repiten el resumen. Así venía el inglés: el primer párrafo era a la vez `primer` y primer step.
- Los avisos que en inglés empezaban por `Note:` a veces quedan como paso y a veces como `tips`, con «Ojo:» o «Nota:».
- `underhand-pull-downs` y `underhand-pull-down` describen el mismo jalón. El segundo se titula «Jalón al pecho supino (variante)» para distinguirlos. Los ids siguen siendo los slugs de origen.
- No hay nivel ni fuerza. No inventar `principiante` ni `empuje` en el cliente a partir de este archivo.
- Tres ejercicios no tienen foto. La UI necesita un hueco vacío para esos ids.
- Los SVG llevan un fondo blanco opaco, tal como están en el origen. No se han recortado: modificarlos obligaría a publicar el derivado también en CC BY-SA, y el archivo actual ya cumple porque no se ha tocado el dibujo.
- La base no es consejo médico. Algunos textos del origen mencionan dolor o embarazo; se han traducido, no ampliado.
- El paquete pesa unos 18 MB de imágenes. Cabe en git sin LFS.
