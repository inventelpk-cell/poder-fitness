# Spec de producto — Poder Fitness

Spec de implementación. La investigación que la sostiene está en `docs/research.md`. Donde esta spec fija un número, un texto o una rama de un flujo, ese valor es el de producto. La sección **Decisiones cerradas** no se reabre durante la implementación.

Poder Fitness es la PWA personal de Antonio: un cuaderno de entreno en español, con arcos de varias semanas y un nivel de poder que sube al registrar trabajo real. Una sola persona, en su navegador, sin cuenta.

## 1. Decisiones cerradas

El implementador no cambia estas decisiones. Si una de ellas chocara con un bug de plataforma, se documenta el límite en el README y se mantiene la decisión.

1. No hay registro, login, backend, API keys, analítica remota ni fuentes de terceros en runtime.
2. No se llama a `Notification.requestPermission`, geolocalización, cámara, micrófono, sensores de movimiento, ni a `navigator.storage.persist()`. Esta última puede abrir un permiso en Firefox. El seguro de los datos es el JSON.
3. El estado de la persona vive en IndexedDB (base `poder-fitness`). `localStorage` no guarda entrenos, perfil ni XP.
4. El peso se guarda siempre en kilogramos. Libras es solo presentación. La conversión es `lb = kg × 2.2046226218`.
5. El 1RM de producto es Epley: `pesoKg × (1 + reps / 30)`. Se muestra a un decimal. Solo entra una serie de trabajo con 1–10 repeticiones y peso externo mayor que 0. Brzycki no se muestra.
6. La progresión de carga es la doble progresión de la sección 12. No hay un modelo que invente el primer peso.
7. El generador es una función pura. Mismo perfil, mismo pool y mismo historial de memoria producen el mismo plan. No hay llamadas a un modelo de lenguaje.
8. Cada arco dura 4 semanas. La semana 4 es descarga. Al terminar, empieza el arco siguiente solo.
9. La racha de gimnasio es semanal, contra los días elegidos en el perfil. La racha del reto es diaria y tiene un escudo por semana. No hay puntos de vida, oro, tienda, anuncios ni ranking.
10. El reto muestra siempre el Cénit: 100 flexiones, 100 abdominales, 100 sentadillas, 10 km. La cuota del día nace en una banda según el nivel y se puede subir hasta el Cénit o bajar hasta 10 / 10 / 10 / 0,5 km. El registro es parcial y queda en el historial.
11. Los 10 km se anotan a mano. No hay GPS.
12. El audio del descanso son osciladores de Web Audio, creados tras un gesto de la persona. Silencio es un ajuste (volumen 0). No hay archivos de audio.
13. El reloj de descanso guarda `endsAt` (epoch ms). No decrementa un contador con `setInterval` como fuente de verdad.
14. La interfaz y los textos de producto van en español de España. Los identificadores de código y los `id` de la base libre se quedan en su forma técnica.
15. Ningún texto de la app, de los datos de ejemplo, del README o de los tests contiene nombres, frases hechas o títulos de Dragon Ball, One Punch Man, Solo Leveling ni de otra franquicia. Los `id` técnicos de `free-exercise-db` se conservan porque identifican un archivo, no se muestran tal cual.
16. Stack: React 19, TypeScript en `strict`, Vite, Tailwind CSS 4, `vite-plugin-pwa`, `idb`, Recharts, `motion`. Tests de dominio con Vitest. Humo E2E con Playwright.
17. Un solo tema: oscuro. La intensidad tiene tres escalones: Calma, Pulso, Máximo.
18. Hay como máximo una sesión `en_curso`.
19. Importar un JSON sustituye el estado local después de una confirmación. No mezcla en silencio. Un `schemaVersion` distinto de `1` se rechaza y no borra nada.
20. Borrar exige escribir `BORRAR`.
21. La semana empieza el lunes. El día de un entreno es la fecha local del dispositivo, no el día UTC.
22. Las series de calentamiento no suman volumen, 1RM, récords, XP ni contadores del reto.
23. Si faltan los archivos de `public/brand/`, `public/art/` o las imágenes de un ejercicio, la app se usa igual: tokens de esta spec, aura en CSS y un bloque de reserva en la ficha.
24. El plan automático solo usa el pool de la sección 24, con nombre y pasos en español. El resto de la biblioteca enseña el texto de origen y avisa de que los pasos están en el idioma de la ficha.
25. Esta versión no incluye superseries en la interfaz, RPE, calculadora de discos, modo claro, ni compartir nativo. El campo `groupId` existe y vale `null`.

## 2. Fuera de alcance

Cuenta, red social, alimentación, vídeo de clase, wearable, salud del sistema operativo, notificaciones, pagos, varios perfiles, modo entrenador, y cualquier permiso del navegador.

Aviso fijo, no es una funcionalidad: la app no diagnostica ni prescribe tratamiento. El onboarding lo dice y pide confirmación.

## 3. Stack, scripts y carpetas

| Pieza | Elección |
| --- | --- |
| UI | React 19 + TypeScript `strict` |
| Build | Vite |
| Estilos | Tailwind CSS 4, tokens de la sección 5 |
| PWA | `vite-plugin-pwa`, `registerType: 'autoUpdate'`, Workbox |
| Datos | `idb` |
| Gráficos | Recharts |
| Animación | `motion` |
| Dominio | Funciones puras en `src/domain`, sin React ni IndexedDB |
| Unidad | Vitest, sobre `src/domain` |
| Humo | Playwright contra `vite preview` |

Scripts mínimos: `dev`, `build`, `preview`, `test`, `test:e2e`.

```
src/domain/     plan, progresión, e1rm, xp, rachas, reto, unidades
src/data/       IndexedDB, import/export, semilla de ejercicios
src/audio/      descanso
src/screens/    pantallas de la sección 6
src/visual/     de otra persona; la app no depende de que exista
public/brand/   iconos y marca
public/art/     auras, vacíos, marcos
data/exercises/ base y pool
```

`src/domain` no importa de `src/screens` ni de `src/data`. Los tests no arrancan el navegador.

## 4. Identidad

Sensación: sala oscura, energía contenida, el esfuerzo deja un destello. No hay mascota ni personaje con nombre propio. El sujeto es quien entrena.

Tokens, si `src/visual/theme.css` no los redefine:

| Token | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#0B1020` | fondo |
| `--surface` | `#141A2E` | tarjetas |
| `--surface-2` | `#1C243C` | filas y campos |
| `--ink` | `#F4F1EA` | texto |
| `--muted` | `#A8B0C4` | texto secundario |
| `--line` | `#2A3350` | bordes |
| `--naranja` | `#FF6A1A` | acción principal, racha |
| `--azul` | `#3D7EFF` | links, tirón, aura |
| `--amarillo` | `#FFD23F` | récord, Cénit |
| `--ok` | `#3DDC97` | serie hecha |
| `--peligro` | `#FF5A6A` | borrar, error |

Tipografía: una familia de palo seco, títulos en negrita. Si no hay fuente propia, `system-ui`. Títulos de pantalla a 1.5 rem en móvil y 2 rem en escritorio. Números de serie en tabular-nums.

Intensidad, ajuste `themeIntensity`:

| Valor | Nombre | Comportamiento |
| --- | --- | --- |
| `calma` | Calma | Sin líneas de velocidad. Aura al 15 %. Sin marco de impacto. |
| `pulso` | Pulso | Aura al 45 %. Líneas y marco solo en récord y en rango nuevo. |
| `maximo` | Máximo | Aura al 80 %. Marco breve al cerrar una serie. Líneas en récord y rango. |

`prefers-reduced-motion: reduce` equivale a Calma en movimiento, aunque el ajuste esté en Máximo: las auras pueden quedarse estáticas.

Archivos que otra persona puede dejar, y que la app referencia sin exigirlos:

- `public/brand/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `logo-mark.svg`
- `public/art/empty-inicio.svg`, `empty-historial.svg`, `empty-biblioteca.svg`, `empty-poder.svg`
- `public/art/rank-<id>.svg` para cada rango de la sección 13
- `public/art/impact-frame.svg`, `exercise-fallback.svg`

## 5. Mapa de pantallas

Escritorio: a partir de 1024 px, columna izquierda fija de 240 px con Inicio, Plan, Biblioteca, Poder, Historial y Ajustes. El contenido de lectura se queda en un máximo de 1120 px. El reproductor centra una columna de 720 px.

Móvil: barra inferior de cuatro destinos (Inicio, Plan, Biblioteca, Poder), altura cómoda, objetivo táctil mínimo 44 × 44 px. Historial y Ajustes se abren desde Inicio. El reproductor ocupa el viewport y esconde la barra.

Rutas:

| Ruta | Pantalla |
| --- | --- |
| `/onboarding` | Alta inicial |
| `/` | Inicio |
| `/plan` | Semana y arco |
| `/plan/rutina/nueva` y `/plan/rutina/:id` | Constructor |
| `/biblioteca` | Lista |
| `/biblioteca/:exerciseId` | Ficha |
| `/entreno/:sessionId` | Reproductor |
| `/entreno/:sessionId/resumen` | Resumen |
| `/historial` | Calendario y gráficas |
| `/historial/:sessionId` | Detalle de sesión |
| `/poder` | Nivel, rangos, logros |
| `/poder/reto` | Reto del héroe |
| `/ajustes` | Ajustes |
| `/ajustes/datos` | Exportar, importar, borrar |

Si no hay perfil, cualquier ruta que no sea `/onboarding` redirige ahí. Si lo hay, `/onboarding` redirige a Inicio. Una sesión `en_curso` pinta en Inicio un botón primario «Seguir entreno» por encima del plan de hoy.

## 6. Onboarding

Cinco pasos, más el aviso. No se puede saltar. Sí se puede volver atrás. El progreso se ve («2 de 6»). Al terminar se escribe el perfil, los ajustes por defecto y el primer arco, y se abre Inicio.

**Paso 1 — Nombre.** Título: «Cómo te llamamos». Campo de texto, 1–24 caracteres tras recortar espacios, letras (incluye tildes y eñe), espacios, apóstrofo y guion. Placeholder: «Tu nombre». Error: «Escribe un nombre de hasta 24 caracteres». No hay valor por defecto.

**Paso 2 — Nivel.** Tres tarjetas de una sola elección.

- Principiante. «Llevas poco o vuelves después de un parón».
- Intermedio. «Entrenas desde hace meses y conoces los básicos».
- Avanzado. «Llevas años y quieres un bloque más lleno».

**Paso 3 — Objetivo.** Una sola elección: Fuerza, Hipertrofia, Resistencia, Pérdida de grasa. Cada tarjeta tiene una frase:

- Fuerza. «Menos repeticiones, más descanso, pesos que pesen».
- Hipertrofia. «Series medias para ganar músculo».
- Resistencia. «Más repeticiones y descansos cortos».
- Pérdida de grasa. «Sesiones densas y un cierre corto».

**Paso 4 — Equipo.** Varias elecciones. «Cuerpo» viene marcado y no se puede quitar. El resto: Mancuernas, Barra y discos, Banco, Poleas, Máquinas de gimnasio, Kettlebell, Bandas elásticas, Barra de dominadas.

**Paso 5 — Días.** Primero el número, de 1 a 6. Al cambiar el número se preseleccionan estos días (lunes = 0):

| Días | Preselección |
| --- | --- |
| 1 | lun |
| 2 | lun, jue |
| 3 | lun, mié, vie |
| 4 | lun, mar, jue, vie |
| 5 | lun a vie |
| 6 | lun a sáb |

Luego seis chips. La persona mueve la selección hasta dejar exactamente ese número. Si no coincide, el botón final del paso explica «Elige N días». El domingo puede entrar en cualquier combinación que respete el número.

**Paso 6 — Aviso.** Texto: «Poder Fitness organiza tus entrenos y guarda lo que anotas. No es un consejo médico ni sustituye a un profesional. Si algo duele de forma aguda, paras». Casilla obligatoria: «Lo he leído». Botón: «Empezar el arco».

Al confirmar, en una sola transacción:

- Se guarda el perfil con `disclaimerAcceptedAt`.
- Ajustes: unidad `kg`, intensidad `pulso`, volumen de descanso `70`, `barWeightKg` 20, cuota del reto sin override.
- Se genera el arco 1, «Arco del Despertar», desde el lunes de la semana local en curso. Los días de esta semana que ya pasaron quedan como `omitido` y no cuentan para la racha de esta semana. Los días de hoy en adelante se pueden entrenar. La meta semanal de la semana en curso es el número de sesiones `planificado` que caen de hoy al domingo, como mínimo 1 si hoy es un día de entreno, para no exigir sesiones en días ya cerrados. A partir del lunes siguiente la meta es `daysPerWeek`.

Ese recorte de la primera semana es deliberado: si alguien hace el alta un viernes y entrena lunes-miércoles-viernes, no llega ya tarde a dos sesiones.

## 7. Inicio

De arriba abajo:

1. Saludo con el nombre y el rango actual («Brasa»). A la derecha, Ajustes.
2. Tarjeta de poder: nivel, barra de XP hacia el siguiente nivel (`xpEnNivel / xpParaSubir`), racha semanal («Constancia: 3 semanas») y progreso de esta semana («2 de 4»).
3. Tarjeta de hoy.
   - Si hoy hay sesión planificada y no está hecha: nombre del patrón en español (Empuje, Tirón, Pierna, Torso, Cuerpo completo), duración estimada (series de trabajo × 45 s + descansos), botón «Ver sesión» y botón primario «Empezar».
   - Si hoy no toca: «Hoy el arco descansa» y un secundario «Entrenar igual», que abre una sesión suelta (sección 11).
   - Si la sesión de hoy está completada: «Sesión cerrada» y el poder ganado, más «Ver resumen».
   - Si hay `en_curso`: esa tarjeta sustituye a la de hoy.
4. Reto del héroe, cuatro números compactos (`12/40` flexiones, etc.) y acceso a `/poder/reto`.
5. Si no hay ninguna sesión cerrada, estado vacío con el texto «Tu primera sesión está en el plan de hoy» y el hueco de `empty-inicio.svg`. No se muestra una gráfica vacía.

«Ver sesión» abre una hoja o una ruta intermedia dentro de `/plan` anclada al día: lista de ejercicios, series, rango de repeticiones, descanso y equipo, antes de crear la sesión. Empezar desde ahí o desde el botón primario crea la sesión y entra al reproductor.

## 8. Biblioteca

**Lista.** Campo de búsqueda con foco visible. Filtra por subcadena, sin distinguir mayúsculas ni tildes (`flexión` encuentra el nombre en español del pool y, en la base, `Push`). Debounce de 150 ms. Filtros en chips de una o varias opciones, combinados con AND entre dimensiones y OR dentro de la dimensión:

- Músculo: los 17 valores del esquema, con la etiqueta de la sección 9.
- Equipo: los valores del esquema, más «Sin material» para `null` y `body only`.
- Categoría: las 7 del esquema.
- Nivel: beginner, intermediate, expert, etiquetados Principiante, Intermedio, Avanzado.

La lista muestra nombre visible, músculo principal y equipo. 876 filas caben con `content-visibility: auto`. No se añade una librería de virtualización. Vacío de búsqueda: «Nada con esos filtros» y un botón «Limpiar filtros». Vacío de base ausente: «Falta la biblioteca en data/exercises» y la app sigue con el pool embebido del plan.

**Ficha.** Nombre, músculos principales y secundarios, equipo, nivel, categoría, mecánica. Imágenes en el orden del array, con alternancia al pulsar o con dos vistas si el ancho lo permite. Si la imagen no carga, `exercise-fallback.svg` o un rectángulo `--surface-2`. Pasos numerados. Si el ejercicio está en el pool, los pasos son los de la sección 24. Si no, los pasos de origen y la línea «Pasos en el idioma de la ficha». Botones: «Añadir a la rutina…» (lista de rutinas custom; si no hay, lleva al constructor) y, si hay sesión `en_curso`, «Meter en el entreno de hoy».

Desde la ficha no se editan los ejercicios de la base. «Crear ejercicio» vive en el constructor: nombre en español obligatorio, músculo principal, equipo, si es compuesto, tipo de registro (`reps_peso`, `reps`, `tiempo`, `distancia`). El `id` es `custom_` más un uuid. Entra en la biblioteca y en las rutinas. El generador automático no lo usa.

## 9. Contrato de la base de ejercicios

Ruta de entrada, sin que esta spec la descargue:

- `data/exercises/exercises.json`: array JSON.
- `data/exercises/images/<ruta>`: cada string de `images[]`. En runtime se sirven como `/exercises/images/<ruta>`.
- `data/exercises/plan-pool.es.json`: el pool normativo de la sección 24. Viaja en el repositorio aunque la base grande todavía no esté.

Cada elemento de `exercises.json` cumple el esquema de [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (Unlicense), leído en el corte del 6 de octubre de 2026:

```json
{
  "id": "Alternate_Incline_Dumbbell_Curl",
  "name": "Alternate Incline Dumbbell Curl",
  "force": "pull",
  "level": "beginner",
  "mechanic": "isolation",
  "equipment": "dumbbell",
  "primaryMuscles": ["biceps"],
  "secondaryMuscles": ["forearms"],
  "instructions": ["…"],
  "category": "strength",
  "images": ["Alternate_Incline_Dumbbell_Curl/0.jpg"]
}
```

`force`, `mechanic` y `equipment` pueden ser `null`. `level` es `beginner | intermediate | expert`. `category` es `powerlifting | strength | stretching | cardio | olympic weightlifting | strongman | plyometrics`. Los músculos son: abdominals, abductors, adductors, biceps, calves, chest, forearms, glutes, hamstrings, lats, lower back, middle back, neck, quadriceps, shoulders, traps, triceps. Un campo `videoUrl` extra se ignora. No se incrustan vídeos remotos.

Etiquetas de interfaz:

| Músculo | Etiqueta | Grupo de volumen |
| --- | --- | --- |
| chest | Pecho | pecho |
| lats, middle back, lower back, traps | Dorsal, Espalda media, Espalda baja, Trapecio | espalda |
| shoulders | Hombros | hombros |
| biceps, triceps, forearms | Bíceps, Tríceps, Antebrazo | brazos |
| quadriceps, hamstrings, abductors, adductors | Cuádriceps, Isquios, Abductores, Aductores | piernas |
| glutes | Glúteos | gluteos |
| abdominals | Abdominales | core |
| calves | Gemelos | pantorrillas |
| neck | Cuello | espalda |

| Equipo en la base | Etiqueta | Se usa en el plan si el perfil tiene |
| --- | --- | --- |
| body only, null en el pool | Peso corporal | cuerpo (siempre) |
| dumbbell | Mancuerna | mancuernas |
| barbell, e-z curl bar | Barra | barra |
| cable | Polea | poleas |
| machine | Máquina | maquinas |
| kettlebells | Kettlebell | kettlebell |
| bands | Banda | bandas |
| medicine ball, exercise ball, foam roll, other | su nombre | no entra en el plan automático |

El banco y la barra de dominadas no existen en el esquema. Los exige el pool, en el campo `equipo`.

Tipo de registro, si el pool no lo fija:

- `category === cardio` → `distancia` (minutos opcionales y km).
- `category === stretching` o el id es `Plank` → `tiempo`.
- en otro caso → `reps_peso`, y el peso puede quedar en 0.

Al primer arranque se vuelca el JSON a la store `exercises`. Si el archivo cambia en un build nuevo, se actualizan los campos de la base y se respetan los `custom_*`.

## 10. Planes y arcos

### Nombres de arco

Ciclo, y luego el mismo nombre con «II», «III», …: Arco del Despertar, Arco de la Forja, Arco del Umbral, Arco de la Cresta, Arco del Núcleo.

Cada arco guarda `id`, `index` (1…), `name`, `startsOn` (lunes local, `YYYY-MM-DD`), `status` (`activo` | `cerrado`), `profileSnapshot` (nivel, objetivo, equipo, días, weekdays) y `sessions[]` planificadas.

### Patrones de la semana

`weekPatterns(level, daysPerWeek)` devuelve la lista, en el orden de los `weekdays` ya ordenados de lunes a domingo.

Principiante:

| Días | Patrones |
| --- | --- |
| 1 | cuerpo |
| 2 | cuerpo, cuerpo |
| 3 | cuerpo, cuerpo, cuerpo |
| 4 | torso, pierna, torso, pierna |
| 5 | torso, pierna, torso, pierna, cuerpo |
| 6 | torso, pierna, torso, pierna, cuerpo, cuerpo |

Intermedio y avanzado:

| Días | Patrones |
| --- | --- |
| 1 | cuerpo |
| 2 | cuerpo, cuerpo |
| 3 | empuje, tiron, pierna |
| 4 | torso, pierna, torso, pierna |
| 5 | empuje, tiron, pierna, torso, pierna |
| 6 | empuje, tiron, pierna, empuje, tiron, pierna |

Nombres visibles: Cuerpo completo, Empuje, Tirón, Pierna, Torso.

La aparición de un patrón en la semana (0 la primera vez, 1 la segunda) se pasa al selector para rotar la variante.

### Huecos por patrón

Orden de prioridad. El tope de ejercicios es 5 (principiante), 6 (intermedio) o 7 (avanzado). Se recorre la lista y se omiten huecos sin candidato.

| Patrón | Huecos, en orden |
| --- | --- |
| cuerpo | sentadilla, empuje_horizontal, tiron_horizontal, bisagra, core, empuje_vertical, pantorrilla |
| empuje | empuje_horizontal, empuje_vertical, empuje_horizontal, accesorio_empuje, hombro, core |
| tiron | tiron_vertical, tiron_horizontal, tiron_horizontal, accesorio_tiron, core, pantorrilla |
| pierna | sentadilla, bisagra, gluteo, unilateral, pantorrilla, core |
| torso | empuje_horizontal, tiron_horizontal, empuje_vertical, tiron_vertical, accesorio_empuje, core |

Con pérdida de grasa, el último hueco que quepa se reserva a `finisher` si hay candidato. En la semana 4 no hay finisher.

Selector: candidatos del rol cuyo `equipo` esté cubierto por el perfil y que no estén ya en la sesión. Se rota el inicio de la lista con la aparición semanal del patrón y se toma el primero libre. Si un patrón se queda con menos de 4 ejercicios, se rellenan desde esta cola, saltando los ya usados: `Pushups`, `Bodyweight_Squat`, `Inverted_Row`, `Single_Leg_Glute_Bridge`, `Plank`.

### Prescripción

| Objetivo | Series | Reps | Descanso | Intensidad sobre el 1RM, cuando exista |
| --- | --- | --- | --- | --- |
| Fuerza | 4 | 4–6 | 180 s | 0,80 |
| Hipertrofia | 3 | 8–12 | 120 s | 0,70 |
| Resistencia | 3 | 12–15 | 60 s | 0,60 |
| Pérdida de grasa | 3 | 10–15 | 75 s | 0,65 |

Principiante: una serie menos, con mínimo 2, y 30 s más de descanso. El rango de repeticiones no cambia.

Semanas del arco:

- Semana 1 y 2: la prescripción tal cual.
- Semana 3: +1 serie en el primer ejercicio de la sesión, sin pasar de 5 series.
- Semana 4, descarga: 2 series, repeticiones en el suelo del rango, intensidad × 0,9 sobre la carga sugerida, descanso igual, sin finisher. La descarga no reescribe la memoria de carga (sección 12).

`Plank` ignora el rango de repeticiones: 20–45 s, el mismo número de series, descanso 60 s. La doble progresión le suma 5 s hasta 45 y ahí se queda.

Incremento de carga sugerida: 2,5 kg en roles compuestos (`sentadilla`, `bisagra`, `empuje_horizontal`, `empuje_vertical`, `tiron_horizontal`, `tiron_vertical`, `gluteo`, `unilateral`) y 1,25 kg en el resto. Con la unidad en libras, el paso visible es 5 lb y 2,5 lb, guardado en kg.

Si la carga sugerida es menor que `barWeightKg` y el ejercicio pide barra, se sugiere el peso de la barra.

Series de calentamiento, solo en semana 1–3, solo en el primer ejercicio si es compuesto y hay una carga sugerida de al menos 40 kg o el ejercicio pide barra: una serie al 50 % × 8 y otra al 75 % × 4, redondeadas al incremento compuesto, `kind: calentamiento`. Se pueden borrar dentro del reproductor.

Estimación de duración en la tarjeta: por serie de trabajo o calentamiento, 45 s, más los descansos entre series. No se suma descanso después de la última serie del entreno.

### Pantalla Plan

- Cabecera del arco: nombre, «Semana 2 de 4», una línea de qué cambia esta semana («Sube una serie en el primer ejercicio» o «Semana de descarga: menos series, misma técnica»).
- Siete días. El día de entreno muestra el patrón. El resto, «Descanso». Hoy va marcado.
- Acciones: «Empezar» en el día de hoy si toca y no hay sesión hecha; «Adelantar a hoy» en un día futuro de esta semana, que intercambia las fechas de las dos sesiones planificadas; «Rutinas» para la lista custom; «Nuevo arco con mi perfil actual» .
- «Nuevo arco…» cierra el arco activo sin borrar sesiones ya hechas, toma el perfil vigente y abre el arco siguiente del ciclo de nombres, con `startsOn` el lunes de esta semana si no hay sesiones planificadas futuras, o el lunes siguiente si esta semana ya tiene una sesión completada. Las sesiones futuras no hechas del arco viejo pasan a `cancelado` y salen de la racha.

Cambiar nivel, objetivo, equipo o días en Ajustes no reescribe sesiones `completado`, `en_curso` ni `omitido`. Regenera solo las planificadas futuras y deja constancia en el arco (`profileSnapshot` actualizado desde la próxima sesión). La semana ya abierta conserva su meta de racha.

### Constructor de rutinas

Nombre obligatorio, 1–40 caracteres. Lista ordenada de ejercicios del pool, de la biblioteca o custom. Por ejercicio: series (1–10), rango de repeticiones o segundos, descanso (15–300 s, pasos de 15), nota opcional de 140 caracteres. Reordenar con botones Subir y Bajar (también arrastre en puntero fino). Quitar con confirmación. Guardar.

Una rutina se puede lanzar desde Plan → Rutinas → «Hacer hoy». Eso crea una sesión `origen: rutina` que no sustituye a la sesión del arco: si hoy había una del arco sin empezar, esa queda pendiente y la del día sigue pudiéndose hacer después. No se fusionan.

El campo `groupId` se guarda a `null`. No hay control de superserie en esta versión.

## 11. Reproductor

Crear la sesión copia el plan a un documento propio. A partir de ahí, el plan no vuelve a pisar lo que la persona cambie dentro de la sesión.

**Antes de la primera serie**, si entra por «Ver sesión», ve el listado. El botón «Empezar» crea el documento, pone `status: en_curso`, `startedAt`, y navega a `/entreno/:id`. Ese botón es el gesto que crea el `AudioContext` (sección 17).

**Pantalla.** Un ejercicio visible, con su nombre en español o el de la ficha, un acceso a los pasos (hoja con la ficha compacta) y la pista de la última vez: «La última: 60 kg × 8, 8, 8» o «Todavía no hay una marca tuya». Las series son filas: tipo (Trabajo o Calentamiento), peso, repeticiones o segundos, y un control grande «Hecha».

- El peso y las repeticiones vienen rellenos con la memoria (sección 12) o, si no hay memoria, repeticiones en el suelo del rango y peso vacío. Vacío no es 0 hasta que la persona escribe 0. El 0 se guarda y la siguiente vez vuelve a salir 0.
- Teclado numérico en móvil (`inputMode="decimal"`). Paso de 0,5 en el control de peso para no depender solo del teclado.
- «Hecha» exige repeticiones ≥ 1, o segundos ≥ 1, o km > 0 según el tipo. El peso puede ser 0 o vacío; vacío se guarda como 0 en ejercicios de peso corporal y pide un número si el ejercicio tiene equipo de carga (`mancuernas`, `barra`, `poleas`, `maquinas`, `kettlebell`). Las bandas pueden ir a 0.
- Al marcar «Hecha» se escribe **ya** la sesión entera en IndexedDB. Si la escritura falla, la serie no pasa a hecha y se muestra «No se pudo guardar. Prueba otra vez». Solo entonces arranca el descanso, si queda alguna serie posterior en la sesión.
- Desmarcar una serie hecha está permitido, guarda de nuevo y cancela el descanso si era el que acaba de empezar.

**Descanso.** Franja fija abajo, número grande en mm:ss, pausa, +30 s, −15 s (sin bajar de 0) y «Saltar». El sonido de fin y los tres pitidos finales respetan el volumen. Al llegar a 0 el número parpadea en color `--naranja` hasta que se toca «Listo» o se marca otra serie. Con la pestaña oculta el tiempo sigue siendo `endsAt`; al volver, la UI se pone al día y, si ya terminó, suena una vez si el contexto de audio sigue vivo. Si el sistema congeló la página, al volver se corrige el reloj y no se finge que el sonido sonó.

**Sustituir.** Lista filtrada al músculo principal y al equipo del perfil, con búsqueda si no basta. La sustitución vale para esta sesión. Las series ya hechas del ejercicio anterior se quedan en ese ejercicio. El nuevo entra con sus series de trabajo a cero y hereda series, reps y descanso del hueco. Interruptor «Usar este cambio en las sesiones futuras del arco», apagado por defecto. Si se enciende, las sesiones `planificado` futuras que tuvieran el ejercicio original lo cambian.

**Saltar.** El ejercicio pasa a `saltado`. Sale del numerador y del denominador del bonus de sesión. Se puede deshacer mientras la sesión siga `en_curso`.

**Añadir serie** y **añadir ejercicio** (abre la biblioteca) están en un menú «Más» para no llenar la pantalla.

**Terminar.** Si queda alguna serie de trabajo sin marcar, pregunta: «Cierras con series sin anotar. Esas no suman». Acciones: «Volver» y «Cerrar sesión». Cerrar pone `status: completado`, `endedAt`, calcula XP, récords, memoria y reto, escribe, y abre el resumen. No se puede completar una sesión con cero series de trabajo hechas: en ese caso el botón pasa a «Descartar», que deja `status: descartado` fuera de las estadísticas.

**Resumen.** Título «Poder de hoy». XP total y desglose (series, volumen, récords, sesión completa). Récords en `--amarillo` con la palabra «Récord», no solo color. Próxima subida, si la doble progresión se activó: «La próxima, 62,5 kg desde 4 repeticiones». Enlace al historial. Si el rango cambió, primero la pantalla de rango y después el resumen. Botón «A inicio».

**Sesión suelta.** «Entrenar igual» o el estado sin plan crean una sesión `origen: suelta` con cero ejercicios y el mismo reproductor, vacío, con «Añadir ejercicio» como acción primaria. Esas sesiones suman XP, historial y racha semanal (cuentan como sesión completada). No avanzan la casilla del arco de ese día.

**Recuperación.** Al abrir la app, si hay `en_curso`, Inicio la prioriza. Intentar empezar otra pide «Tienes una sesión abierta» con «Seguir» o «Descartar la abierta».

## 12. Progresión, volumen, récords, 1RM

### Memoria

Por `exerciseId`, tras cada sesión `completado` que no sea de descarga:

- `lastWorkingSets`: las series de trabajo en orden, `{ weightKg, reps }`.
- `nextWeightKg` y `nextReps`, con esta regla. Sean `minReps`, `maxReps`, `plannedSets` e `incrementKg` los de esa sesión. Si hay al menos `plannedSets` series de trabajo, todas con `reps >= maxReps` y todas con el mismo `weightKg` (el 0 cuenta como mismo peso): `nextWeightKg = weightKg + incrementKg` y `nextReps = minReps`. Si no: `nextWeightKg` queda en el peso de la última serie de trabajo y `nextReps` en las repeticiones de esa última serie, sin pasar de `maxReps`.
- La descarga no toca `nextWeightKg` ni `nextReps`.
- `Plank` progresa en segundos: si todas las series de trabajo llegan a 45, se queda en 45; si todas llegan al objetivo actual y el objetivo es menor que 45, el siguiente objetivo sube 5 s.

La pista «La última» usa `lastWorkingSets`, no el récord histórico. Es la queja concreta de la v6 de Strong: no se rellenan números de un ciclo viejo.

La carga sugerida del plan, cuando ya hay `nextWeightKg`, manda sobre el porcentaje del 1RM. El porcentaje solo rellena la primera sugerencia cuando existe un 1RM (por ejemplo, de un ejercicio hecho en una sesión suelta) y todavía no hay `nextWeightKg`. Sin ninguno de los dos, el peso va vacío.

### 1RM

```text
e1rm(pesoKg, reps) = pesoKg * (1 + reps / 30)
```

Válido si `kind === trabajo`, `1 <= reps <= 10` y `pesoKg > 0`. Se guarda el mejor por ejercicio (`bestE1rmKg`) y el de cada sesión para la gráfica. Presentación a un decimal, mitad hacia arriba con `Math.round(valor * 10) / 10`. Ejemplo cerrado: 100 kg × 5 → 116,666… → **116,7 kg**. 80 kg × 10 → **106,7 kg**. 100 kg × 11 no actualiza el 1RM.

### Volumen

Por serie de trabajo: `pesoKg × reps`. El peso corporal no se inventa y no entra como kg. Una serie a 0 kg suma 0 de volumen y sí puede sumar XP de serie. El volumen de la sesión y el semanal suman solo eso. La gráfica semanal agrupa por el `muscleGroup` del pool si existe; si no, por el mapa de la sección 9 a partir de `primaryMuscles[0]`.

### Récords

Dentro de una sesión, como mucho un récord de carga y uno de repeticiones por ejercicio:

- Récord de carga: el mejor Epley de la sesión supera a `bestE1rmKg` previo. XP +30.
- Récord de repeticiones: mismo `weightKg` que alguna serie de trabajo anterior (tolerancia 0,01 kg) y más repeticiones, y no se ha dado ya el récord de carga en esa sesión. XP +15.

El calentamiento no compara. El primer registro no es récord: no hay marca previa. Se guarda la marca y no se celebra.

## 13. XP, niveles, rangos, logros

### XP de una serie de trabajo

```text
base(objetivo) = fuerza 14, hipertrofia 12, resistencia 10, perdida_grasa 11
xp = base + (compuesto ? 4 : 0) + min(20, floor(pesoKg * reps / 100))
```

Calentamiento, repeticiones &lt; 1 o serie no hecha: 0. `compuesto` viene del pool o, fuera del pool, de `mechanic === "compound"`.

### XP de la sesión

Suma de las series, más:

- +50 si los ejercicios de trabajo completos (series hechas ≥ series previstas) partidos por los ejercicios previstos, después de quitar los saltados, es ≥ 0,70.
- +20 adicionales si ese ratio es 1.

Tope de la sesión: 600. Lo que pase del tope no se guarda. Los eventos de XP de la sesión se escriben como un solo evento `session` con el desglose dentro, ya recortado.

Vector de prueba, hipertrofia, tres series compuestas a 100 kg × 8 y tres series de aislamiento a 20 kg × 12, todas previstas hechas, sin récord:

- Compuesta: 12 + 4 + floor(800/100) = 24. Tres series: 72.
- Aislamiento: 12 + 0 + floor(240/100) = 14. Tres series: 42.
- Bonus: 50 + 20 = 70.
- Total: **184**.

### Nivel

El nivel empieza en 1. El XP para pasar de `nivel` al siguiente es:

```text
xpParaSubir(nivel) = round(100 * nivel^1.25)
```

| Nivel | XP para el siguiente |
| --- | --- |
| 1 | 100 |
| 2 | 238 |
| 3 | 395 |
| 4 | 566 |
| 5 | 748 |
| 6 | 939 |
| 7 | 1139 |
| 8 | 1345 |
| 9 | 1559 |
| 10 | 1778 |

El nivel no baja, salvo importación de un archivo o borrado. Un evento negativo (se deshace un bonus del reto porque se editó el día) puede dejar la barra a cero en el nivel actual; no baja de nivel.

### Rangos

| Desde el nivel | Id | Nombre | Línea en el desbloqueo |
| --- | --- | --- | --- |
| 1 | chispa | Chispa | «El arco reconoce el primer entreno». |
| 4 | brasa | Brasa | «Ya hay constancia suficiente para notar el calor». |
| 8 | llama | Llama | «El trabajo de estas semanas ya se ve». |
| 12 | hoguera | Hoguera | «Cuatro bloques cortos caben en este fuego». |
| 18 | nucleo | Núcleo | «El centro del plan ya no depende del ánimo de un día». |
| 25 | pulso | Pulso | «La marca sube aunque el día sea normal». |
| 35 | onda | Onda | «El esfuerzo sale hacia la siguiente serie». |
| 45 | cresta | Cresta | «Los récords ya tienen sitio propio». |
| 60 | vortice | Vórtice | «El arco gira y tú sigues dentro». |
| 80 | eclipse | Eclipse interior | «Casi todo el camino está a tus espaldas». |
| 100 | singularidad | Singularidad | «Este nivel no se presta. Se entrena». |

Al pasar de rango, pantalla completa con el nombre, la línea y «Seguir». El botón aparece a los 400 ms. Con movimiento reducido, la pantalla es una tarjeta estática. El id visto se guarda en `lastRankSeen` para no repetir la escena. Hay un enlace en Poder, «Volver a ver el rango», que la muestra otra vez sin volver a dar XP.

### Logros

Se conceden una vez. XP extra en el mismo momento, fuera del tope de 600 de la sesión. Pantalla pequeña encima del resumen o de Inicio, con el nombre. Se pueden acumular y se enseñan en cola, una a una.

| Id | Nombre | Condición | XP |
| --- | --- | --- | --- |
| primera_chispa | Primera chispa | Primera sesión completada | 40 |
| bitacora | Bitácora viva | 4 sesiones completadas | 40 |
| diez | Diez sesiones | 10 sesiones completadas | 40 |
| veinticinco | Veinticinco | 25 sesiones completadas | 40 |
| cincuenta | Cincuenta | 50 sesiones completadas | 40 |
| semana | Semana cerrada | Primera semana de constancia cumplida | 40 |
| cuatro_semanas | Mes de arco | Racha semanal que llega a 4 | 80 |
| record | Marca propia | Primer récord | 40 |
| cenit | Cénit | Un día local con ≥ 100 flexiones, ≥ 100 abdominales, ≥ 100 sentadillas y ≥ 10 km | 200 |
| mitad | Mitad del camino | Un día con ≥ 50, ≥ 50, ≥ 50 y ≥ 5 km | 40 |
| bascula | En la báscula | Primer peso corporal | 40 |
| respaldo | Respaldo | Primera exportación JSON | 40 |
| forja | Forja propia | Primera rutina guardada | 40 |
| sustituto | Cambio en la sala | Una sesión completada con al menos un ejercicio sustituido | 40 |
| descarga | Descarga hecha | Una semana 4 del arco con la meta semanal cumplida | 40 |
| nivel_10 | Nivel 10 | Llegar al nivel 10 | 40 |
| nivel_25 | Nivel 25 | Llegar al nivel 25 | 40 |
| nivel_50 | Nivel 50 | Llegar al nivel 50 | 80 |

## 14. Reto del héroe

Pantalla `/poder/reto`. Título: «Reto del héroe». Subtítulo fijo: «El Cénit es 100 flexiones, 100 abdominales, 100 sentadillas y 10 km en un día».

Cuota por defecto, según el nivel de poder en el momento de abrir el día (se congela en el documento del día la primera vez que se muestra):

| Nivel | Flexiones | Abdominales | Sentadillas | Km |
| --- | --- | --- | --- | --- |
| 1–3 | 20 | 20 | 20 | 1 |
| 4–7 | 40 | 40 | 40 | 2 |
| 8–14 | 60 | 60 | 60 | 4 |
| 15–29 | 80 | 80 | 80 | 6 |
| 30 o más | 100 | 100 | 100 | 10 |

«Ajustar cuota» deja elegir cualquier combinación dentro de 10–100 repeticiones (paso 5) y 0,5–10 km (paso 0,5), sin pasar del Cénit. La cuota elegida queda en ajustes y se usa a partir del día siguiente. El día ya abierto no cambia su meta a mitad de camino.

**De dónde salen los números del día.**

- Series de trabajo de sesiones de esa fecha local, por estas familias. Cada repetición suma 1.
  - Flexiones: `Pushups`, `Incline_Push-Up`, `Decline_Push-Up`, `Push-Ups_-_Close_Triceps_Position`, `Pushups_Close_and_Wide_Hand_Positions`.
  - Abdominales: `Sit-Up`, `Crunch_-_Hands_Overhead`, `Reverse_Crunch`, `Air_Bike`. `Plank` no suma.
  - Sentadillas: `Bodyweight_Squat`, `Bodyweight_Walking_Lunge`, `Goblet_Squat`, `Dumbbell_Squat`, `Barbell_Full_Squat`, `Leg_Press`.
- Anotaciones manuales del mismo día, que se suman a lo anterior. Sirven para el trabajo hecho fuera del reproductor y para los kilómetros.

Los km solo existen en la anotación manual. Control: −0,1, +0,1, +1 y un campo. Las repeticiones: −1, +1, +10 y un campo. Cada pulsación guarda. Se puede anotar en varias veces. El historial lista los días con los cuatro totales, la cuota de aquel día y si se cerró.

**XP del reto.** Solo las anotaciones manuales: 1 por repetición y 8 por kilómetro, redondeando cada anotación con `round(km × 8)`. Si los cuatro totales del día (sesión + manual) cumplen la cuota, +40 una sola vez. Tope 200 XP de reto por día, bonus incluido. Esas repeticiones que ya dieron XP de serie no vuelven a dar XP de reto.

**Racha del reto.** Un día cuenta si algún total es &gt; 0. La racha suma días locales consecutivos. Evaluar al abrir la app y al guardar:

- Si el último día con actividad es hoy, la racha no se duplica.
- Si es ayer, hoy suma 1 al registrar la primera actividad.
- Si es anteayer y queda escudo esta semana, el día intermedio queda cubierto, el escudo pasa a 0 y la racha sigue.
- Si faltan dos o más días, la racha vuelve a 0 y la actividad de hoy la deja en 1. El escudo no se gasta en un hueco que no puede tapar.

El escudo vuelve a 1 cada lunes (identificador de semana ISO) y no se acumula. Un día cubierto por escudo se ve en el historial como «Escudo», distinto de un día con trabajo.

La racha de constancia del gimnasio es otra cifra. Vive en Inicio. Una semana cuenta cuando las sesiones `completado` de lunes a domingo alcanzan la meta congelada el primer día que se abrió esa semana. En la semana del alta, la meta es la de la sección 6. Cumplir la meta a mitad de semana ya sube la racha; no hace falta esperar al domingo. Una semana cerrada por debajo de la meta la deja en 0. Entrenar de más no da dos rachas.

## 15. Historial y estadísticas

**Calendario mensual**, lunes en la primera columna. Un día con sesión completada lleva un punto `--naranja`. Un día solo con reto, un punto `--azul`. Hoy, anillo. Elegir un día lista las sesiones y el reto. Vacío del mes: «Este mes todavía no tiene marcas».

**Detalle de sesión.** Lo anotado, el XP, los récords, y «Repetir esta sesión», que crea una sesión suelta copiando ejercicios y cifras como punto de partida, con las series sin marcar.

**Gráficas**, con una tabla equivalente debajo para lector de pantalla y para cuando Recharts no pinte:

- Volumen semanal, 12 semanas, barras apiladas por grupo muscular.
- 1RM estimado del ejercicio elegido, últimas 16 sesiones que tengan valor.
- Peso corporal, 90 días, un punto por día (el último del día).

**Peso corporal.** En Historial, «Anotar peso». Un valor por guardado, en kg internos, entre 30 y 300. Varios el mismo día: el gráfico usa el último y la lista los enseña todos. No hay altura, grasa ni fotos.

**Récords.** Lista por ejercicio: mejor 1RM, mejor reps a un peso, fecha. Vacío: «Los récords aparecen al repetir un ejercicio».

## 16. Ajustes

- Unidad: Kilogramos o Libras. Al cambiar, las cifras visibles se convierten. Lo guardado sigue en kg. Probar en un entreno con 60 kg debe mostrar 132,3 lb y, al volver a kg, 60.
- Peso de la barra, por defecto 20 kg (45 lb si la unidad está en libras; se guarda en kg).
- Intensidad: Calma, Pulso, Máximo.
- Volumen del descanso: 0–100, por defecto 70. Un botón «Probar sonido» dispara el tono de fin. Ese botón también puede ser el gesto que crea el contexto de audio.
- Perfil: los mismos campos del onboarding, editables, con el efecto sobre el plan descrito en la sección 10.
- Cuota del reto.
- Datos: exportar, importar, borrar.
- Línea de versión de la app y `schemaVersion` 1.

**Exportar** descarga `poder-fitness-AAAA-MM-DD.json`:

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-10-06T12:00:00.000Z",
  "app": "poder-fitness",
  "profile": {},
  "settings": {},
  "exercisesCustom": [],
  "routines": [],
  "arcs": [],
  "sessions": [],
  "memory": [],
  "bodyWeight": [],
  "heroManual": [],
  "heroDays": [],
  "xpEvents": [],
  "achievements": [],
  "streaks": {}
}
```

No se exporta la biblioteca de 876: vuelve a sembrar desde `data/exercises`. Sí se exportan los custom.

**Importar** lee el archivo en local, comprueba `schemaVersion === 1`, `app === "poder-fitness"` y que las colecciones sean arrays. Si falla: «Este archivo no es una copia de Poder Fitness» y el estado sigue igual. Si vale: «Esto sustituye lo que hay en este navegador» con «Cancelar» y «Sustituir». La sustitución ocurre en una transacción. Después, Inicio.

**Borrar.** Explica que no se puede deshacer sin un JSON. Hay que escribir `BORRAR`. Entonces se borra la base, se recarga y vuelve el onboarding. La caché del service worker puede quedarse; no guarda datos de la persona.

## 17. PWA, offline y audio

Manifiesto: `name` «Poder Fitness», `short_name` «Poder», `display` `standalone`, `start_url` `/`, `background_color` y `theme_color` `#0B1020`, `lang` `es`. Iconos desde `public/brand/` cuando existan. Sin ellos, el build sigue y el manifiesto usa un icono SVG mínimo generado en el repo de la app, un círculo `#FF6A1A` sobre `#0B1020`, para que la instalación no dependa del otro encargo.

Precaché: cascarón, JS, CSS, fuentes locales si las hay, marca, arte presente, `plan-pool.es.json` y las imágenes de los ejercicios del pool. El resto de imágenes entra en caché al abrir la ficha. Sin red, la lista de la biblioteca funciona con lo ya sembrado en IndexedDB; la foto no vista muestra el reserva.

Estrategia: el cascarón es precaché. La navegación cae al `index.html` de la app. No hay API que cachear.

**Audio.** Un solo `AudioContext`, creado en «Empezar», «Probar sonido» o la primera «Hecha». Si está `suspended`, `resume()` en ese gesto.

| Evento | Señal |
| --- | --- |
| Pitido, a 3, 2 y 1 s | seno 880 Hz, 40 ms |
| Fin | seno 523 Hz 90 ms y, 100 ms después, seno 784 Hz 90 ms |
| Récord, al abrir el resumen si hubo alguno | cuadrada 660 Hz, 120 ms, una vez |

Ganancia lineal `volumen / 100`. A 0 no se crean osciladores. No hay vibración por API que pida permiso; un `navigator.vibrate` tampoco se usa.

El temporizador pinta con `requestAnimationFrame` mientras la pestaña está visible, leyendo siempre `Date.now()` contra `endsAt`. Un `setTimeout` hacia `endsAt` cubre el momento del sonido. Nada de ir restando un segundo como estado guardado.

## 18. Barra de calidad

- La pantalla de entreno no muestra un spinner de ruta. La sesión que se acaba de crear está ya en memoria.
- Cerrar una serie se ve en el mismo frame: la fila pasa a hecha y, en Máximo, el marco dura 180 ms.
- Los botones primarios usan `--naranja` con texto `#0B1020`. Contraste de texto normal al menos 4,5:1 sobre su fondo. `--muted` sobre `--bg` se reserva a texto grande o se sube hasta cumplir 4,5:1 si es texto de cuerpo.
- Estados vacíos con una frase que dice qué hacer a continuación, no una gráfica en cero.
- Errores de guardado en una frase y un reintento. No hay códigos.
- Números de serie alineados, controles repetidos en el mismo sitio en todos los ejercicios.
- Escritorio: las mismas tareas se completan sin la barra inferior, con foco de teclado en el orden visual. Ratón y teclado llegan a Empezar, Hecha, descanso y Terminar.
- Móvil estrecho, 360 px: el reproductor no hace scroll horizontal. La fila de la serie puede partir en dos líneas.
- `lang="es"` en el documento. Título de la pestaña: «Poder Fitness».

## 19. Accesibilidad

Objetivo: WCAG 2.2 nivel AA en los flujos de la sección 21.

- Cada control tiene nombre accesible en español. El icono de Ajustes se llama «Ajustes».
- El foco se ve con un anillo `--amarillo` de 2 px.
- El descanso anuncia por `aria-live="polite"` al empezar, al cruzar 10 s, 5 s y al llegar a 0, no cada segundo.
- «Récord», «Hecha», «Saltado» y «Escudo» existen como texto.
- La gráfica tiene `aria-label` con el resumen («Volumen de las últimas 12 semanas») y la tabla siguiente es la alternativa.
- El orden de tabulación del reproductor es: pasos, series de arriba abajo, descanso, sustituir, saltar, terminar.
- El rango nuevo mueve el foco al botón «Seguir» y lo devuelve al resumen al cerrar.
- No hay temporizador que avance solo una decisión irreversible. El descanso que llega a cero no marca la serie siguiente.

## 20. Casos límite

1. Alta un domingo. La semana en curso solo incluye el domingo si el domingo está entre los días elegidos; si no, la meta de esa semana es 0 y la constancia no sube ni baja. El arco pinta los días desde el lunes siguiente como primera semana completa. Una meta 0 no cuenta como semana cumplida ni como semana fallida.
2. Dos pestañas abiertas. La última escritura gana. Al volver a una pestaña, se relee la sesión antes de pintar. No hay bloqueo distribuido.
3. Reloj del dispositivo cambiado hacia atrás. La sesión guarda `startedAt` ISO y la fecha local derivada. Si la fecha local cae más de un día antes que `startedAt`, se usa la fecha de `startedAt` convertida a local en el momento del cierre, para no escribir en un año anterior por un reloj mal puesto durante el alta. Si el cambio es de unas horas, manda la fecha local del cierre: es lo que la persona ve en el calendario.
4. Sesión que cruza la medianoche. La fecha del calendario es la del `startedAt` local.
5. Peso con coma decimal. El campo acepta coma y punto y guarda un número.
6. Importar el mismo archivo dos veces. La segunda sustitución deja el mismo estado, sin duplicar XP.
7. Importar con la app a medias de una sesión. La sustitución lo reemplaza todo, sesión abierta incluida.
8. Base de ejercicios ausente en un build. El pool de la sección 24 está en el bundle y el plan, el reto y el reproductor funcionan. La biblioteca muestra el aviso de la sección 8.
9. Imagen 404. Reserva visual, ficha usable.
10. Audio bloqueado. El descanso se ve igual. «Probar sonido» explica «Toca el botón otra vez si no oyes nada» solo si `resume()` rechaza.
11. Volumen 0. No hay pitidos y no hay error.
12. Completar el Cénit con la cuota diaria en 20. El logro Cénit se concede. La cuota del día también se marca cumplida en cuanto se alcanza 20, y el XP de bonus es el de la cuota, no un segundo bonus por el Cénit. El Cénit tiene su propio XP de logro.
13. Editar o descartar una sesión ya cerrada no está permitido en v1, salvo el borrado total. Evita rehacer el libro de XP. «Repetir esta sesión» es el camino si el día salió mal y quiere otra.
14. Sustituir por un ejercicio ya presente en la sesión. Se permite: quedan dos bloques con el mismo id. La memoria de ese id es única y la pista muestra la misma última vez. El 1RM usa el mejor de los dos bloques.
15. Rutina sin ejercicios. No se puede guardar.
16. Día de entreno adelantado dos veces. El intercambio es conmutativo: los ids de sesión planificada cambian de fecha y el documento del arco queda coherente.
17. Perfil con solo «Cuerpo» y objetivo fuerza. El plan sale con flexiones, sentadilla, remo invertido, puente y plancha. No aparecen barra ni polea.
18. Nivel principiante y 6 días. Se usa la tabla de principiante, no la de empuje/tirón/pierna.
19. Semana 3 y un ejercicio añadido a mano. El +1 serie de la semana 3 solo estaba en el primer hueco generado. Lo añadido a mano conserva las series que la persona fijó.
20. Récord en la descarga. Sí se celebra y actualiza `bestE1rmKg`. Lo que no se mueve es `nextWeightKg`.

## 21. Criterios de aceptación

1. Dado un navegador limpio, cuando se completa el onboarding con nombre válido, principiante, hipertrofia, solo cuerpo y lunes-miércoles-viernes, entonces Inicio muestra el Arco del Despertar y la próxima sesión de esas tres usa únicamente ejercicios del pool cuyo equipo es cuerpo.
2. Dado ese plan, cuando se pulsa Ver sesión, entonces se leen ejercicios, series y descanso antes de que exista una sesión `en_curso`.
3. Dado el reproductor, cuando se marca una serie, entonces un reinicio inmediato de la página sigue mostrando esa serie hecha.
4. Dado un descanso de 10 s, cuando la pestaña permanece oculta más que ese tiempo, al volver el reloj está en cero o en el remanente real, no en un valor inflado.
5. Dado volumen 70, cuando el descanso termina y el contexto se creó con un gesto, suena el tono de fin sin haber pedido permisos.
6. Dado un ejercicio con última vez 60 × 8, 8, 8, cuando se abre la siguiente sesión, los campos de trabajo muestran 60 y 8, y la serie no está hecha.
7. Dado 0 kg guardado en un ejercicio de peso corporal, la siguiente sesión muestra 0, no un campo vacío.
8. Dadas todas las series de trabajo en el tope del rango y con el mismo peso, la memoria de la siguiente vez suma el incremento y vuelve al suelo del rango.
9. Dada una sesión de semana 4, al cerrarla la memoria de carga queda como estaba.
10. Dado 100 × 5 de trabajo, el historial muestra 116,7 kg. Dado 100 × 11, el 1RM no cambia.
11. Dado el vector de la sección 13, el resumen muestra 184 XP.
12. Dado un calentamiento, no cambia volumen, 1RM, XP ni reto.
13. Al pasar del nivel 3 al 4 aparece el desbloqueo de Brasa una sola vez.
14. Dado el reto, anotar 10 flexiones, salir y anotar otras 10 deja el día en 20, con dos movimientos reflejados en el total.
15. Un día con 100, 100, 100 y 10 concede Cénit.
16. Cambiar a libras convierte la vista y al volver a kg restituye el número guardado.
17. Exportar e importar en un perfil limpio reproduce sesiones, XP, nivel y reto.
18. Un JSON con `schemaVersion` 2 no altera los datos.
19. Borrar sin escribir `BORRAR` no borra. Escribirlo devuelve al onboarding.
20. Con la red cortada después de la primera carga, se puede abrir Inicio, completar una serie y verla tras recargar.
21. El foco recorre el reproductor en el orden de la sección 19 y el descanso no habla cada segundo.
22. No existe en la UI ningún control que pida notificaciones, ubicación, cámara o micrófono.

## 22. Tests

**Vitest, obligatorios, sobre funciones puras.**

- `weekPatterns` para las 12 combinaciones de nivel agrupado (principiante frente a intermedio) y días 1–6. Avanzado coincide con intermedio.
- Selector de ejercicios: solo cuerpo; mancuernas sin banco; barra con banco y dominadas. Los ids resultantes pertenecen al pool y respetan el equipo. La segunda aparición semanal de «cuerpo» no repite el mismo primer ejercicio si hay alternativa.
- Semana 4: 2 series, sin finisher, y la memoria no baja.
- Epley: los dos ejemplos de la sección 12 y el rechazo de reps 0, 11 y de peso 0.
- Doble progresión: sube, no sube si falta una serie, no sube si los pesos de las series no coinciden, no se mueve en descarga.
- XP: el vector de 184, el tope de 600, calentamiento a 0.
- `xpParaSubir` para los niveles 1 a 10 de la tabla.
- Rango en los niveles 1, 3, 4, 8, 99 y 100.
- Reto: banda por nivel, suma parcial, Cénit, escudo que tapa un día y que no tapa dos, escudo que reaparece el lunes siguiente.
- Constancia: primera semana recortada por el alta, semana cumplida a mitad, semana fallida que pone la racha a 0, cambio de días del perfil que no altera la meta ya congelada.
- Unidades: 60 kg → 132,277… lb de redondeo visible a un decimal (132,3) y vuelta a 60 kg exactos desde el valor guardado, no desde el redondeo.
- Importación: rechaza versión 2; la versión 1 conserva el total de XP.

**Playwright, humo, un navegador de escritorio y uno con viewport 390 × 844.**

1. Onboarding completo hasta Inicio.
2. Ver sesión, empezar, marcar una serie, ver el descanso, terminar, leer un XP mayor que 0 en el resumen.
3. Buscar «flexión» en la biblioteca y abrir la ficha.
4. Anotar una parte del reto y verla en el historial del día.
5. Exportar no entra en el humo automático si el diálogo de descarga es frágil; sí entra un test de dominio del JSON. El humo de ajustes comprueba que la pantalla de datos muestra Exportar, Importar y Borrar.

## 23. README de la implementación

Cuando exista la app, el `README.md` de la raíz va en español y contiene, como mínimo:

1. Qué es Poder Fitness, en un párrafo, sin franquicias ajenas.
2. Requisitos: Node vigente LTS.
3. `npm install`, `npm run dev`, `npm test`, `npm run test:e2e`, `npm run build`, `npm run preview`.
4. Dónde colocar `data/exercises/exercises.json` y las imágenes, y que el pool ya viene en el repo.
5. Despliegue estático. Build de Vite (`dist/`). Dos caminos gratuitos documentados con pasos reales: GitHub Pages del repositorio y Cloudflare Pages con el mismo `dist`. La configuración de `base` de Vite se explica para Pages de proyecto.
6. Los datos se quedan en el navegador. Cómo exportar el JSON antes de cambiar de máquina.
7. Licencia de la app y atribución Unlicense de la base de ejercicios, con enlace al repositorio de origen.

Este encargo de documentación no crea ese README todavía: el de la raíz sigue siendo el del repositorio hasta que se implemente.

## 24. Pool normativo

Archivo `data/exercises/plan-pool.es.json`, array de objetos:

```json
{
  "id": "Pushups",
  "nombre": "Flexión",
  "pasos": ["Coloca las manos bajo los hombros y el cuerpo en línea.", "Baja el pecho hasta cerca del suelo sin perder la línea.", "Empuja el suelo hasta estirar los codos sin bloquearlos con un latigazo."],
  "roles": ["empuje_horizontal"],
  "compound": true,
  "logging": "reps_peso",
  "equipo": ["cuerpo"],
  "muscleGroup": "pecho"
}
```

`logging` es `reps_peso`, `reps`, `tiempo` o `distancia`. En este pool todo es `reps_peso` menos `Plank` (`tiempo`). El peso 0 es válido en todo el pool de cuerpo.

Prioridad dentro del rol: el orden de cada lista es el orden de candidatos.

**sentadilla.** `Barbell_Full_Squat` (barra, compuesto, piernas, «Sentadilla con barra»). `Goblet_Squat` (mancuernas, compuesto, piernas, «Sentadilla en copa»). `Dumbbell_Squat` (mancuernas, compuesto, piernas, «Sentadilla con mancuernas»). `Leg_Press` (maquinas, compuesto, piernas, «Prensa de piernas»). `Bodyweight_Squat` (cuerpo, compuesto, piernas, «Sentadilla»).

**bisagra.** `Barbell_Deadlift` (barra, compuesto, espalda, «Peso muerto»). `Romanian_Deadlift` (barra, compuesto, piernas, «Peso muerto rumano»). `Stiff-Legged_Dumbbell_Deadlift` (mancuernas, compuesto, piernas, «Peso muerto con mancuernas»). `One-Arm_Kettlebell_Swings` (kettlebell, compuesto, piernas, «Balanceo con kettlebell»). `Single_Leg_Glute_Bridge` (cuerpo, compuesto, gluteos, «Puente a una pierna»).

**empuje_horizontal.** `Barbell_Bench_Press_-_Medium_Grip` (barra y banco, compuesto, pecho, «Press de banca»). `Dumbbell_Bench_Press` (mancuernas y banco, compuesto, pecho, «Press de banca con mancuernas»). `Pushups` (cuerpo, compuesto, pecho, «Flexión»). `Decline_Push-Up` (cuerpo, compuesto, pecho, «Flexión con pies altos»). `Incline_Push-Up` (cuerpo, compuesto, pecho, «Flexión con manos altas»).

**tiron_horizontal.** `Bent_Over_Barbell_Row` (barra, compuesto, espalda, «Remo con barra»). `Bent_Over_Two-Dumbbell_Row` (mancuernas, compuesto, espalda, «Remo con mancuernas»). `Seated_Cable_Rows` (poleas, compuesto, espalda, «Remo en polea»). `Inverted_Row` (cuerpo, compuesto, espalda, «Remo invertido»).

**empuje_vertical.** `Standing_Military_Press` (barra, compuesto, hombros, «Press militar»). `Dumbbell_Shoulder_Press` (mancuernas, compuesto, hombros, «Press de hombros con mancuernas»). `Seated_Dumbbell_Press` (mancuernas y banco, compuesto, hombros, «Press de hombros sentado»).

**tiron_vertical.** `Pullups` (dominadas, compuesto, espalda, «Dominada»). `Chin-Up` (dominadas, compuesto, espalda, «Dominada supina»). `Close-Grip_Front_Lat_Pulldown` (poleas, compuesto, espalda, «Jalón al pecho»).

**gluteo.** `Barbell_Hip_Thrust` (barra y banco, compuesto, gluteos, «Empuje de cadera»). `Single_Leg_Glute_Bridge` ya listado. `Glute_Kickback` (cuerpo, aislamiento, gluteos, «Patada de glúteo»).

**unilateral.** `Dumbbell_Lunges` (mancuernas, compuesto, piernas, «Zancada con mancuernas»). `Bodyweight_Walking_Lunge` (cuerpo, compuesto, piernas, «Zancada»). `Leg_Extensions` (maquinas, aislamiento, piernas, «Extensión de piernas»). `Lying_Leg_Curls` (maquinas, aislamiento, piernas, «Curl femoral tumbado»).

**accesorio_empuje.** `Dumbbell_Flyes` (mancuernas y banco, aislamiento, pecho, «Apertura con mancuernas»). `Bench_Dips` (cuerpo, compuesto, brazos, «Fondo en banco»). `Triceps_Pushdown` (poleas, aislamiento, brazos, «Extensión de tríceps en polea»). `Push-Ups_-_Close_Triceps_Position` (cuerpo, compuesto, brazos, «Flexión cerrada»). `Dumbbell_One-Arm_Triceps_Extension` (mancuernas, aislamiento, brazos, «Extensión de tríceps con mancuerna»).

**accesorio_tiron.** `Face_Pull` (poleas, aislamiento, hombros, «Tirón a la cara»). `Band_Pull_Apart` (bandas, aislamiento, hombros, «Apertura con banda»). `Hammer_Curls` (mancuernas, aislamiento, brazos, «Curl martillo»). `Barbell_Curl` (barra, aislamiento, brazos, «Curl con barra»).

**hombro.** `Side_Lateral_Raise` (mancuernas, aislamiento, hombros, «Elevación lateral»). `Lateral_Raise_-_With_Bands` (bandas, aislamiento, hombros, «Elevación lateral con banda»).

**pantorrilla.** `Rocking_Standing_Calf_Raise` (barra, aislamiento, pantorrillas, «Gemelo de pie con barra»). `Calf_Raise_On_A_Dumbbell` (mancuernas, aislamiento, pantorrillas, «Gemelo con mancuerna»). `Seated_Calf_Raise` (maquinas, aislamiento, pantorrillas, «Gemelo sentado»). `Calf_Raises_-_With_Bands` (bandas, aislamiento, pantorrillas, «Gemelo con banda»).

**core.** `Plank` (cuerpo, aislamiento, core, tiempo, «Plancha»). `Reverse_Crunch` (cuerpo, aislamiento, core, «Encogimiento inverso»). `Sit-Up` (cuerpo, aislamiento, core, «Abdominal»). `Cable_Crunch` (poleas, aislamiento, core, «Encogimiento en polea»). `Air_Bike` (cuerpo, aislamiento, core, «Bicicleta en el suelo»).

**finisher.** `Mountain_Climbers` (cuerpo, compuesto, core, «Escalador»). `Air_Bike` si todavía no está en la sesión.

Pasos, tres por ejercicio, en el mismo orden de ids. Van literales al JSON:

- Sentadilla con barra. Apoya la barra sobre la espalda alta y da un paso atrás. Baja hasta que el muslo pase la horizontal si tu movilidad lo permite. Sube empujando el suelo, con las rodillas siguiendo la punta de los pies.
- Sentadilla en copa. Sujeta una mancuerna contra el pecho. Siéntate entre las caderas, talones quietos. Ponte de pie sin echar el tronco hacia atrás.
- Sentadilla con mancuernas. Mancuernas a los lados. Baja con el pecho abierto. Sube hasta extender caderas y rodillas.
- Prensa de piernas. Pies a la anchura de la cadera en la plataforma. Baja sin despegar la zona lumbar del respaldo. Empuja sin bloquear las rodillas con un golpe.
- Sentadilla. Pies firmes, brazos al frente si te ayudan a equilibrar. Baja y sube con el mismo ritmo. Las rodillas no se cierran hacia dentro.
- Peso muerto. La barra sobre el medio del pie, cadera atrás, espalda neutra. Empuja el suelo y lleva la barra pegada a las piernas. Al bajar, la barra vuelve por el mismo camino.
- Peso muerto rumano. Rodillas casi quietas, cadera atrás, barra cerca del muslo. Baja hasta notar el isquio, sin redondear la espalda. Vuelve a extender la cadera.
- Peso muerto con mancuernas. Igual que el rumano, mancuernas junto a las piernas. La espalda se mantiene neutra. Cierras de pie, glúteos activos.
- Balanceo con kettlebell. El impulso sale de la cadera, no del hombro. El brazo acompaña hasta la altura del pecho. Dejas caer la kettlebell hacia atrás entre las piernas con la espalda neutra.
- Puente a una pierna. Tumbado, un pie apoyado, la otra pierna estirada. Sube la cadera hasta alinear hombro, cadera y rodilla. Baja sin perder el contacto del hombro con el suelo.
- Press de banca. Escápulas juntas, pies en el suelo. Baja la barra al pecho medio. Empuja hacia arriba con una leve diagonal hacia la cara.
- Press de banca con mancuernas. Las mancuernas bajan a los lados del pecho. Empujas hasta dejar los brazos extendidos sobre los hombros. No chocas las mancuernas a propósito.
- Flexión. Manos bajo los hombros, cuerpo en una línea. El pecho se acerca al suelo. Empujas hasta arriba sin perder la línea.
- Flexión con pies altos. Pies en un escalón, manos en el suelo. El mismo recorrido de la flexión. Cuanto más alto el pie, más peso recibe el torso.
- Flexión con manos altas. Manos en un banco o un escalón. Cuerpo en línea. Baja y sube el pecho hacia el apoyo.
- Remo con barra. Tronco cerca de la horizontal, barra hacia el ombligo. Aprietas la espalda al llegar. Bajas la barra sin soltar la tensión.
- Remo con mancuernas. Una mano y una rodilla en el banco, o las dos mancuernas con el tronco inclinado. Llevas la mancuerna hacia la cadera. Bajas despacio.
- Remo en polea. Sentado, pecho abierto, tiras del agarre hacia el abdomen. Los hombros no suben a las orejas. Vuelves sin dejar caer la pila de pesos.
- Remo invertido. Cuerpo bajo una mesa firme o una barra baja, talones apoyados. Tiras del pecho hacia el apoyo. Bajas hasta estirar los brazos.
- Press militar. Barra desde la parte alta del pecho, abdominal firme. Empujas en vertical sin arquear de más la lumbar. Bajas a la clavícula con control.
- Press de hombros con mancuernas. De pie, mancuernas a la altura de las orejas. Empujas hasta arriba. Bajas hasta que el codo quede cerca de noventa grados.
- Press de hombros sentado. Espalda contra el banco, pies en el suelo. El mismo recorrido. No separas la espalda del banco para ayudar.
- Dominada. Agarre prono, cuerpo estable. Tiras hasta que la barbilla supere la barra. Bajas hasta casi estirar los brazos.
- Dominada supina. Agarre supino, a la anchura de los hombros. Tiras con los codos hacia el suelo. Bajas del todo, sin un tirón al final.
- Jalón al pecho. Agarre a la anchura de los hombros, tiras hacia la parte alta del pecho. El tronco se echa atrás solo un poco. Subes sin encoger los hombros.
- Empuje de cadera. Espalda alta en el banco, barra sobre la cadera protegida. Empujas la cadera hasta extenderla. Bajas sin rebotar en el suelo.
- Patada de glúteo. A cuatro patas, extiendes la cadera con la rodilla flexionada. El movimiento es corto y atrás, no hacia el techo con la lumbar. Vuelves sin perder el apoyo de las manos.
- Zancada con mancuernas. Das un paso largo, la rodilla de atrás se acerca al suelo. El tronco sigue erguido. Empujas para volver.
- Zancada. El mismo paso, manos en la cadera si quieres. Cada repetición es un paso. El pie de delante no se despega de talón.
- Extensión de piernas. Ajustas el rodillo sobre los tobillos. Extiendes las rodillas sin levantar el muslo del asiento. Bajas sin soltar el peso.
- Curl femoral tumbado. Rodillo sobre los talones. Flexionas las rodillas llevando los talones hacia el glúteo. Bajas lento.
- Apertura con mancuernas. En el banco, ligera flexión de codos fija. Abres hasta notar el pecho. Cierras sin chocar las mancuernas.
- Fondo en banco. Manos en el borde, pies delante. Bajas los codos hacia atrás. Subes sin encoger los hombros.
- Extensión de tríceps en polea. Codos quietos al lado del tronco. Extiendes hacia abajo. Vuelves hasta unos noventa grados.
- Flexión cerrada. Manos más juntas que en la flexión, codos cerca del cuerpo. Bajas el cuerpo en bloque. Empujas hasta arriba.
- Extensión de tríceps con mancuerna. Un brazo arriba, codo apuntando al techo. Bajas la mancuerna por detrás de la cabeza. Extiendes sin mover el codo de sitio.
- Tirón a la cara. Polea alta, cuerda hacia la cara, codos altos. Separas las manos al llegar. Vuelves sin perder la postura del pecho.
- Apertura con banda. Banda al frente, brazos estirados. Abres hasta que las manos queden a los lados. Vuelves sin que la banda te arrastre.
- Curl martillo. Mancuernas con el pulgar hacia arriba. Flexionas el codo. Bajas del todo.
- Curl con barra. Codos quietos, barra hacia los hombros. No te echas atrás para pasar el punto difícil. Bajas controlando.
- Elevación lateral. Mancuernas a los lados, un poco de flexión en el codo. Subes hasta la altura del hombro. Bajas sin balancear el tronco.
- Elevación lateral con banda. Un pie sobre la banda. El mismo recorrido lateral. La muñeca se queda neutra.
- Gemelo de pie con barra. Barra sobre la espalda, pies en un escalón si lo tienes. Subes a la punta. Bajas el talón por debajo del escalón si hay recorrido.
- Gemelo con mancuerna. Una mancuerna en una mano y la otra en un apoyo. Subes y bajas un pie cada vez. El movimiento es de tobillo, no de rodilla.
- Gemelo sentado. Rodillas bajo las almohadillas. Empujas con la punta del pie. Bajas hasta estirar el gemelo.
- Gemelo con banda. La banda pisa bajo el antepié y la sujetas con las manos. Empujas la punta. Vuelves despacio.
- Plancha. Antebrazos bajo los hombros, cuerpo en línea desde la cabeza a los talones. Aprietas abdomen y glúteo. Respiras sin dejar caer la cadera. El tiempo manda, no las repeticiones.
- Encogimiento inverso. Tumbado, rodillas flexionadas. Llevas las rodillas hacia el pecho despegando la cadera. Bajas sin arquear la lumbar de un golpe.
- Abdominal. Tumbado, pies firmes. Subes la caja torácica hacia la pelvis. Bajas un vértebra a vértebra, sin tirar del cuello con las manos.
- Encogimiento en polea. De rodillas, la cuerda junto a la cara. Flexionas el tronco hacia abajo. Vuelves sin sentarte sobre los talones.
- Bicicleta en el suelo. Espalda en el suelo, un codo busca la rodilla contraria mientras la otra pierna se estira. Alternas sin tirar del cuello. Cada lado es una repetición.
- Escalador. En posición de flexión, llevas una rodilla hacia el pecho y cambias. La cadera no sube en balancín. El ritmo es el que puedas sostener con la espalda neutra.

Esos pasos son el texto de producto. No se sustituyen por las instrucciones en inglés de la base. Las imágenes, si se copian de la base, se buscan por el mismo `id`.

## 25. Qué queda atado a la investigación

La pantalla única, el peso de la última vez, el descanso por ejercicio y el guardado inmediato responden a Hevy y a Strong. La vista previa y el poder saltar responden a Nike Training Club. El plan explicable y el peso en blanco la primera vez responden a Fitbod. La conversión real de unidades y el 0 kg recordado responden a JEFIT. El arco con nombre y la recompensa al cerrar responden a Zombies, Run! y a Habitica, sin puntos de vida ni tienda. El Cénit escalable y el escudo responden a las RPG de fitness y a la evidencia sobre rachas. El detalle de cada fuente está en `docs/research.md`.
