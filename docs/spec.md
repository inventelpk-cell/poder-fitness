# Spec de producto — Poder Fitness

Spec de implementación. Una PWA personal, en español, para un solo usuario. Sin cuentas, sin servidor, sin claves y sin permisos del navegador. El pulido de referencia es el registro de Hevy y Strong. La investigación que sostiene las decisiones está en `docs/research.md`.

Los rangos canónicos no se renombran. Ids: `chispa`, `brasa`, `llama`, `incendio`, `tormenta`, `relampago`, `nova`, `eclipse`, `mitico`, `absoluto`. Nombres visibles: Chispa, Brasa, Llama, Incendio, Tormenta, Relámpago, Nova, Eclipse, Mítico, Absoluto.

## 1. Producto

Poder Fitness guarda el entreno en el dispositivo, propone la semana y el arco, y convierte lo registrado en nivel de poder. El juego no pide datos que el entreno no tenga.

Límites que el código no cruza:

- No llama a `Notification`, `geolocation`, `getUserMedia`, `MediaRecorder` ni a permisos de instalación distintos del banner nativo de la PWA.
- No abre red hacia terceros. No hay analítica, fuentes en CDN, imágenes remotas ni API keys.
- No hay login, perfil público ni sincronía entre aparatos. El traslado de datos es un archivo JSON.
- La interfaz va en español, de tú, enérgica y concreta. Sin vida que baje, sin oro, sin tienda, sin «el sistema no perdona» y sin vocabulario de franquicias. El reto se llama **Reto del héroe**. La descarga se llama **semana templo**. El modificador de volumen se llama **cámara de gravedad**.
- Una línea fija en el onboarding y en Ajustes: «Poder Fitness no sustituye el consejo de un profesional sanitario.»

Stack que cumple esto: TypeScript en modo estricto, React 19, Vite, React Router, CSS con variables (sin framework de estilos), IndexedDB a través de `idb`, `vite-plugin-pwa`, y Vitest para las fórmulas y el generador. Las fuentes se empaquetan: Sora (títulos y cifras, peso 700) y Source Sans 3 (texto, pesos 400 y 600), licencia OFL, archivos woff2 dentro del build. Los `switch` sobre uniones (`objetivo`, `rango`, `patron`, `estado`) cierran con comprobación `never`.

## 2. Mapa de pantallas

Navegación móvil, barra inferior de cuatro destinos: **Hoy**, **Plan**, **Historial**, **Tú**. En escritorio (desde 1100 px) la misma lista pasa a una columna izquierda y se añaden Biblioteca, Reto y Poder como destinos propios. En móvil, Biblioteca se abre desde Plan, Reto desde Hoy, y Poder desde Tú.

| Ruta | Qué es |
| --- | --- |
| `/onboarding` | Seis pasos. Solo si no hay perfil. |
| `/` | Hoy: rango, sesión del día, reto, racha semanal. |
| `/plan` | Semana, arco, acceso a biblioteca y al constructor. |
| `/plan/rutina/:id` | Constructor de una rutina. |
| `/biblioteca` | Búsqueda y filtros. |
| `/biblioteca/:id` | Ficha. |
| `/entreno/:id` | Reproductor. Ocupa la pantalla; la barra inferior se esconde. |
| `/entreno/:id/resumen` | Poder ganado y récords de esa sesión. |
| `/historial` | Calendario del mes. |
| `/historial/volumen` | Doce semanas de volumen. |
| `/historial/records` | Récords y 1RM estimado. |
| `/historial/peso` | Peso corporal. |
| `/reto` | Los cuatro medidores de hoy. |
| `/reto/historial` | Días anteriores. |
| `/poder` | Nivel, rangos, logros. |
| `/ajustes` | Unidad, tema, exportar, importar, reiniciar, editar perfil. |

Arranque: si no hay perfil, `/onboarding`. Si hay una sesión `en-curso`, Hoy muestra «Seguir entreno» por encima de la tarjeta del día. Recargar el reproductor no pierde series ni el fin del descanso.

## 3. Onboarding

Seis pasos, con «Paso N de 6», atrás desde el 2, y sin saltar. El botón de cada paso mide al menos 44 px de alto.

1. **Nombre.** Obligatorio, de 1 a 24 caracteres tras recortar espacios. Texto de ayuda del campo: «Cómo quieres que te llamemos».
2. **Nivel.** Tres tarjetas de una sola opción: Principiante, Intermedio, Avanzado. Texto de apoyo: «Principiante: estás empezando o vuelves tras un parón.» «Intermedio: ya entrenas solo desde hace unos meses.» «Avanzado: llevas tiempo con cargas y técnica estable.»
3. **Objetivo.** Una opción: Fuerza, Hipertrofia, Resistencia, Pérdida de grasa. Ids: `fuerza`, `hipertrofia`, `resistencia`, `grasa`.
4. **Equipo.** Varias opciones. «Solo peso corporal» es excluyente: al marcarlo se apagan las demás, y al marcar otra se apaga él. Opciones: mancuernas, barra, banco, polea, máquina, bandas, kettlebell, barra de dominadas, paralelas. El peso corporal está siempre disponible, aunque no se muestre como chip cuando hay otro equipo.
5. **Días.** Un stepper del 1 al 7 y los siete días. Al cambiar el número, la selección vuelve al reparto por defecto, salvo que la persona haya tocado un día después: en ese caso el stepper no borra su elección y no deja continuar hasta que el número de chips coincida con el stepper. Reparto por defecto, lunes = 1: 1 → miércoles; 2 → lunes y jueves; 3 → lunes, miércoles y viernes; 4 → lunes, martes, jueves y viernes; 5 → lunes, martes, miércoles, viernes y sábado; 6 → de lunes a sábado; 7 → toda la semana. La semana del producto empieza el lunes.
6. **Resumen.** Nombre, nivel, objetivo, equipo y días, más el aviso sanitario. Botón: «Empezar».

Al confirmar se escribe el perfil, se crea el arco 1 en semana 1 y el plan de esa semana, y se navega a Hoy. No se pide nada más.

Editar estos datos después vive en Ajustes. Cambiar nivel, objetivo, equipo o días pregunta: «¿Regenero el plan de esta semana? Tu historial se queda.» Sí regenera los días futuros no clavados. No toca la sesión en curso ni las sesiones ya guardadas. El número de arco y la semana del arco no se reinician.

## 4. Biblioteca

### 4.1 Búsqueda y filtros

Campo de búsqueda con etiqueta «Buscar ejercicio». La comparación quita tildes, pasa a minúsculas y busca subcadena en `nombre` y en `alias`. Los filtros se combinan con Y entre dimensiones y con O dentro de cada una: músculo, equipo, patrón, nivel. «Limpiar» deja la búsqueda vacía y todos los filtros apagados. Cero resultados: «Ningún ejercicio con esos filtros.» y el botón Limpiar. Orden por defecto: nombre, locale `es`, sensibilidad base.

La lista muestra nombre, patrón en palabras («Empuje horizontal») y equipo. La fila entera es el enlace a la ficha.

### 4.2 Ficha

Nombre, músculos, equipo, nivel, patrón, diagrama del patrón (sección 12), pasos numerados. Acción primaria: «Usar en una rutina». Si hay una rutina en edición, lo añade al final. Si no, abre el constructor de una rutina nueva con ese ejercicio ya metido. No hay vídeo ni audio de terceros.

### 4.3 Ejercicio propio

En Biblioteca, «Crear ejercicio». Campos obligatorios: nombre (único sin tildes), un músculo principal, un patrón, equipo (al menos uno), nivel, tres pasos de instrucción (cada uno de 10 a 160 caracteres). Alias opcionales. `origen: "usuario"`. Entra en el generador si el equipo y el nivel encajan. Se puede archivar; no se borra si alguna sesión lo cita. Archivado no sale en búsquedas ni en el generador.

### 4.4 Catálogo semilla

`origen: "semilla"`. El generador exige que cada patrón tenga el id de reserva indicado, de nivel principiante y equipo solo `peso-corporal`. Esos ids no se archivan.

Reservas: `sentadilla-corporal`, `zancada`, `puente-gluteo`, `flexion-pecho`, `flexiones-pike`, `remo-invertido`, `dominadas-australianas`, `plancha`, `curl-toalla`, `fondos-suelo`, `elevaciones-toalla`, `curl-femoral-deslizante`, `gemelos-de-pie`, `escaladores`, `gato-camello`.

Columnas: id, nombre, patrón, músculo, equipo requerido, nivel, prioridad (menor = se prefiere antes). `compuesto: true` marca el salto de carga grande.

| id | nombre | patrón | músculo | equipo | nivel | pri | compuesto |
| --- | --- | --- | --- | --- | --- | --- | --- |
| sentadilla-corporal | Sentadilla | rodilla | cuadriceps | peso-corporal | principiante | 10 | sí |
| sentadilla-goblet | Sentadilla goblet | rodilla | cuadriceps | mancuernas | principiante | 20 | sí |
| sentadilla-trasera | Sentadilla trasera | rodilla | cuadriceps | barra | intermedio | 30 | sí |
| zancada | Zancada | rodilla-unilateral | cuadriceps | peso-corporal | principiante | 10 | sí |
| zancada-mancuernas | Zancada con mancuernas | rodilla-unilateral | cuadriceps | mancuernas | principiante | 20 | sí |
| sentadilla-bulgara | Sentadilla búlgara | rodilla-unilateral | cuadriceps | mancuernas, banco | intermedio | 30 | sí |
| puente-gluteo | Puente de glúteo | cadera | gluteos | peso-corporal | principiante | 10 | sí |
| peso-muerto-rumano-mancuernas | Peso muerto rumano con mancuernas | cadera | isquiotibiales | mancuernas | principiante | 20 | sí |
| peso-muerto-rumano-barra | Peso muerto rumano con barra | cadera | isquiotibiales | barra | intermedio | 30 | sí |
| peso-muerto | Peso muerto | cadera | isquiotibiales | barra | avanzado | 40 | sí |
| flexion-pecho | Flexión de pecho | empuje-horizontal | pecho | peso-corporal | principiante | 10 | sí |
| press-suelo-mancuernas | Press de suelo con mancuernas | empuje-horizontal | pecho | mancuernas | principiante | 20 | sí |
| press-banca-mancuernas | Press banca con mancuernas | empuje-horizontal | pecho | mancuernas, banco | principiante | 25 | sí |
| press-banca-barra | Press banca con barra | empuje-horizontal | pecho | barra, banco | intermedio | 30 | sí |
| press-inclinado-mancuernas | Press inclinado con mancuernas | empuje-horizontal | pecho | mancuernas, banco | intermedio | 40 | sí |
| flexiones-pike | Flexión pike | empuje-vertical | hombros | peso-corporal | principiante | 10 | sí |
| press-hombro-mancuernas | Press de hombro con mancuernas | empuje-vertical | hombros | mancuernas | principiante | 20 | sí |
| press-militar-barra | Press militar con barra | empuje-vertical | hombros | barra | intermedio | 30 | sí |
| remo-invertido | Remo invertido | traccion-horizontal | espalda | peso-corporal | principiante | 10 | sí |
| remo-mancuerna | Remo a una mano | traccion-horizontal | espalda | mancuernas | principiante | 20 | sí |
| remo-barra | Remo con barra | traccion-horizontal | espalda | barra | intermedio | 30 | sí |
| dominadas-australianas | Dominadas australianas | traccion-vertical | espalda | peso-corporal | principiante | 10 | sí |
| jalon-pecho | Jalón al pecho | traccion-vertical | espalda | polea | principiante | 20 | sí |
| dominadas | Dominadas | traccion-vertical | espalda | barra-dominadas | intermedio | 30 | sí |
| plancha | Plancha | core | abdomen | peso-corporal | principiante | 10 | no |
| abdominales | Abdominales | core | abdomen | peso-corporal | principiante | 20 | no |
| bicho-muerto | Bicho muerto | core | abdomen | peso-corporal | principiante | 30 | no |
| curl-toalla | Curl con toalla | biceps | biceps | peso-corporal | principiante | 10 | no |
| curl-mancuernas | Curl con mancuernas | biceps | biceps | mancuernas | principiante | 20 | no |
| curl-banda | Curl con banda | biceps | biceps | banda | principiante | 30 | no |
| fondos-suelo | Fondos en el suelo | triceps | triceps | peso-corporal | principiante | 10 | no |
| extension-triceps-mancuernas | Extensión de tríceps | triceps | triceps | mancuernas | principiante | 20 | no |
| fondos-banco | Fondos en banco | triceps | triceps | banco | principiante | 30 | no |
| elevaciones-toalla | Elevaciones con toalla | hombro-aislamiento | hombros | peso-corporal | principiante | 10 | no |
| elevaciones-laterales | Elevaciones laterales | hombro-aislamiento | hombros | mancuernas | principiante | 20 | no |
| aperturas-invertidas | Aperturas invertidas | hombro-aislamiento | hombros | mancuernas | principiante | 30 | no |
| curl-femoral-deslizante | Curl femoral deslizante | femoral | isquiotibiales | peso-corporal | principiante | 10 | no |
| gemelos-de-pie | Gemelos de pie | gemelo | gemelos | peso-corporal | principiante | 10 | no |
| gemelos-mancuernas | Gemelos con mancuernas | gemelo | gemelos | mancuernas | principiante | 20 | no |
| escaladores | Escaladores | acondicionamiento | cuerpo-completo | peso-corporal | principiante | 10 | no |
| saltos-tijera | Saltos de tijera | acondicionamiento | cuerpo-completo | peso-corporal | principiante | 20 | no |
| gato-camello | Gato-camello | movilidad | espalda | peso-corporal | principiante | 10 | no |

Alias de búsqueda, además del nombre: flexión → `flexion-pecho`; sentadilla → `sentadilla-corporal`; dominada → `dominadas` y `dominadas-australianas`; peso muerto → los tres de cadera con barra o mancuernas; abdominal → `abdominales`.

Instrucciones, en este orden. Cada paso se muestra numerado.

- **sentadilla-corporal.** Pies a la anchura de la cadera. Baja hasta donde la espalda siga neutra y los talones no se levanten. Empuja el suelo y sube.
- **sentadilla-goblet.** Sostén una mancuerna pegada al pecho. Siéntate entre las caderas y mantén el pecho abierto. Sube sin bloquear las rodillas de golpe.
- **sentadilla-trasera.** Barra sobre los trapecios, pies firmes. Rompe la cadera y las rodillas a la vez. Sube en un solo movimiento, con la barra en equilibrio.
- **zancada.** Da un paso largo. La rodilla de atrás baja hacia el suelo sin golpearlo. Empuja con la pierna de delante para volver.
- **zancada-mancuernas.** Igual que la zancada, con una mancuerna en cada mano y los brazos quietos. El torso no se inclina hacia el paso. Alterna las piernas.
- **sentadilla-bulgara.** Empeine trasero apoyado en el banco. Baja en vertical con la pierna de delante. Sube sin que la rodilla se cierre hacia dentro.
- **puente-gluteo.** Tumbado, pies apoyados cerca de la cadera. Eleva la pelvis apretando glúteos, sin arquear la lumbar. Baja con control.
- **peso-muerto-rumano-mancuernas.** Mancuernas delante de los muslos, rodillas ligeramente flexionadas. Lleva la cadera atrás hasta notar el femoral. Vuelve de pie cerrando glúteos.
- **peso-muerto-rumano-barra.** La barra roza los muslos en todo el recorrido. La espalda no se redondea. El movimiento sale de la cadera, no de tirar con los brazos.
- **peso-muerto.** Pies bajo la barra, agarre por fuera de las rodillas. Empuja el suelo y acerca la barra al cuerpo. Termina de pie, con la barra quieta, y bájala por el mismo camino.
- **flexion-pecho.** Manos un poco más abiertas que los hombros, cuerpo en bloque. Baja el pecho cerca del suelo. Empuja hasta estirar los codos sin perder el abdomen.
- **press-suelo-mancuernas.** Tumbado en el suelo, mancuernas sobre el pecho. Baja los codos hasta que el brazo toque el suelo con suavidad. Empuja en vertical.
- **press-banca-mancuernas.** En el banco, pies apoyados. Baja las mancuernas a los lados del pecho. Empuja hasta dejar los brazos bajo las mancuernas, no hacia la cara.
- **press-banca-barra.** Agarre un poco más ancho que los hombros. Baja la barra al pecho con los antebrazos verticales. Empuja hacia arriba y un poco atrás, hacia los soportes.
- **press-inclinado-mancuernas.** Banco a unos 30 grados. Baja despacio hacia la parte alta del pecho. Empuja sin chocar las mancuernas arriba.
- **flexiones-pike.** Caderas altas, el cuerpo en V invertida. Flexiona los codos y acerca la cabeza al suelo. Empuja para volver, mirando a los pies.
- **press-hombro-mancuernas.** De pie o sentado, mancuernas a la altura de la cara. Empuja hasta arriba sin arquear la lumbar. Baja hasta que los codos queden bajo las muñecas.
- **press-militar-barra.** Barra en la parte delantera de los hombros. Aprieta glúteos y abdomen. Empuja en vertical y deja bajar la barra con control.
- **remo-invertido.** Cuerpo recto bajo una mesa firme o una barra baja. Tira del pecho hacia el apoyo. Baja sin dejar caer la cadera.
- **remo-mancuerna.** Una mano y una rodilla en el banco, espalda neutra. Lleva la mancuerna hacia la cadera, con el codo cerca del cuerpo. Baja hasta estirar el brazo.
- **remo-barra.** Tronco inclinado, rodillas blandas, espalda neutra. Tira de la barra hacia el ombligo. Baja sin redondear.
- **dominadas-australianas.** Agarre a la anchura de los hombros, cuerpo inclinado y talones en el suelo. Lleva el pecho a la barra. Baja hasta casi estirar los brazos.
- **jalon-pecho.** Siéntate firme y agarra la barra ancha. Lleva la barra hacia la parte alta del pecho, codos hacia abajo. Deja subir sin perder la postura.
- **dominadas.** Cuelga con los hombros activos, no encogidos. Tira hasta que la barbilla pase la barra. Baja del todo, sin balanceo.
- **plancha.** Antebrazos bajo los hombros, cuerpo en línea. Empuja el suelo y no dejes caer la cadera. Respira sin romper la posición. La serie se anota en segundos (campo de duración, no de reps): principiante 20–40, intermedio 30–60, avanzado 45–90. El descanso de la plancha sigue la tabla del objetivo.
- **abdominales.** Tumbado, rodillas flexionadas, lumbares pegadas al suelo. Eleva el tronco hasta que los omóplatos se separen. Baja sin soltar el abdomen de golpe.
- **bicho-muerto.** Espalda lumbar en el suelo, brazos hacia el techo. Estira una pierna y el brazo contrario sin que la lumbar se arquee. Vuelve y cambia de lado. Una repetición es un lado.
- **curl-toalla.** Pisa el centro de una toalla y agarra los extremos. Flexiona los codos contra la resistencia de la tela. Baja despacio.
- **curl-mancuernas.** Codos quietos al lado del cuerpo. Sube las mancuernas sin balancear el tronco. Baja hasta estirar el codo con control.
- **curl-banda.** Pisa la banda, agarra las asas. Igual que el curl con mancuernas: codo quieto, sube y baja sin impulso.
- **fondos-suelo.** Sentado, manos detrás de la cadera, dedos hacia los pies. Flexiona los codos hacia atrás y baja un poco. Empuja hasta estirar, sin encoger los hombros.
- **extension-triceps-mancuernas.** Una mancuerna con las dos manos, por detrás de la cabeza. Estira los codos sin abrirlos del todo hacia los lados. Baja detrás de la nuca.
- **fondos-banco.** Manos en el borde del banco, pies apoyados. Baja el cuerpo cerca del banco. Empuja hasta estirar los codos.
- **elevaciones-toalla.** Pisa la toalla y sujeta los extremos con los brazos a los lados. Elévalos hasta la altura del hombro, contra la tela. Baja sin encoger el cuello.
- **elevaciones-laterales.** Mancuernas a los lados, codos casi estirados. Sube hasta la línea del hombro, con el meñique ligeramente arriba. Baja despacio.
- **aperturas-invertidas.** Tronco inclinado, mancuernas colgando. Abre los brazos hacia los lados, apretando la espalda alta. Vuelve sin impulso.
- **curl-femoral-deslizante.** Tumbado, talones sobre una tela que deslice. Eleva la cadera y arrastra los talones hacia ti. Estira las piernas sin dejar caer la pelvis.
- **gemelos-de-pie.** Punta de los pies en un pequeño escalón o en el suelo. Sube todo lo que puedas sobre los dedos. Baja hasta notar el estirón.
- **gemelos-mancuernas.** Igual, con una mancuerna en una mano y la otra en un apoyo. El movimiento es solo del tobillo. Haz las dos piernas.
- **escaladores.** Posición de flexión. Lleva una rodilla hacia el pecho y cambia de pierna. La cadera no se eleva. Una repetición es un cambio.
- **saltos-tijera.** Salta y abre piernas y brazos a la vez. Vuelve a la posición de firmes al aterrizar. Apoya toda la planta, suave.
- **gato-camello.** A cuatro patas. Redondea la espalda al exhalar y ábrela al inhalar. El movimiento es lento. Una repetición es un ciclo. Series de movilidad: 1 serie de 8, descanso 30 s, en cualquier objetivo. No entra en el volumen en kg ni en el 1RM.

La plancha y el gato-camello son los dos ejercicios de duración o de movilidad con prescripción propia. El resto usa las tablas de series y reps de la sección 6.

## 5. Planes, arcos y constructor

### 5.1 Tipos de día

Ids: `cuerpo`, `torso`, `empuje`, `traccion`, `pierna`, `pulso`.

Según días por semana, nivel y objetivo, la secuencia en el orden de los días elegidos es:

| Días | Condición | Secuencia |
| --- | --- | --- |
| 1 | siempre | cuerpo |
| 2 | siempre | cuerpo, cuerpo |
| 3 | principiante, o fuerza | cuerpo, cuerpo, cuerpo |
| 3 | resistencia | cuerpo, pulso, cuerpo |
| 3 | hipertrofia o grasa, y no principiante | empuje, traccion, pierna |
| 4 | siempre | torso, pierna, torso, pierna |
| 5 | fuerza o hipertrofia | empuje, traccion, pierna, torso, pierna |
| 5 | resistencia o grasa | empuje, traccion, pierna, cuerpo, pulso |
| 6 | siempre | empuje, traccion, pierna, empuje, traccion, pierna |
| 7 | siempre | la de 6 días, más pulso |

Si un tipo se repite en la semana, la segunda copia usa la variante 1 (sección 5.3). En 2 y 3 días de `cuerpo`, las variantes son 0, 1 y, si hay tercero, 2. En 4 días, el segundo torso y la segunda pierna usan variante 1. En 5 días con dos piernas, la segunda es variante 1. En 6 y 7, el segundo empuje, la segunda tracción y la segunda pierna son variante 1.

### 5.2 Huecos de cada día

Se rellenan en este orden. Principiante se queda en 5 ejercicios; el resto, en 6. Pulso siempre lleva 5. Si la lista es más larga, se corta por el final. Si un hueco no tiene candidato, se usa la reserva del patrón.

- **cuerpo:** rodilla, empuje-horizontal, traccion-horizontal, cadera, core. El sexto hueco, si existe: acondicionamiento cuando el objetivo es grasa o resistencia; si no, rota `hombro-aislamiento`, `biceps`, `triceps` con el índice de sesión de la semana.
- **torso:** empuje-horizontal, traccion-horizontal, empuje-vertical, traccion-vertical, y un aislamiento que rota igual. El sexto, si existe, es core.
- **empuje:** empuje-horizontal, empuje-vertical, hombro-aislamiento, triceps. El quinto, solo en hipertrofia y si no es principiante, es otro empuje-horizontal.
- **traccion:** traccion-vertical, traccion-horizontal, hombro-aislamiento, biceps. El quinto, misma condición, es otra traccion-horizontal.
- **pierna:** rodilla, cadera, rodilla-unilateral, femoral, gemelo. El sexto es core, salvo grasa y resistencia, que usan acondicionamiento.
- **pulso:** movilidad, core, core, acondicionamiento, acondicionamiento.

Dentro de un mismo día no se repite un id. En la semana, la segunda pierna no puede usar el mismo id de `rodilla` que la primera. Dos huecos seguidos no comparten músculo principal; si el candidato ganador lo comparte, se toma el siguiente de la lista y, si no hay otro, se deja el ganador. No hay superseries.

Tope de series de trabajo por músculo principal en la semana, sumando el plan: principiante 12, intermedio 16, avanzado 20. Al pasar el tope se elimina el último ejercicio de ese músculo que no sea reserva única de su día. El día nunca baja de 4 ejercicios; si hacerlo violara el tope, se baja una serie de trabajo de los aislamientos antes de borrar un ejercicio.

### 5.3 Elección del ejercicio

Candidatos: equipo del usuario contiene todo el equipo del ejercicio (el peso corporal siempre cuenta), nivel permitido (principiante solo ve principiante; intermedio ve principiante e intermedio; avanzado ve los tres), patrón exacto, no archivado.

Orden: los clavados por el usuario en ese hueco van primero. Luego prioridad ascendente, y dentro de la misma prioridad el id en orden alfabético. La variante N toma el candidato N módulo la longitud de la lista. Así el arco siguiente, al sumar 1 a la variante base, rota sin depender del azar.

La semilla aleatoria no se usa. Mismos perfil, número de arco, semana del arco y clavados producen el mismo plan. Vitest fija un caso: principiante, hipertrofia, solo peso corporal, 3 días, arco 1 semana 1, variantes 0, 1 y 2.

### 5.4 Series, reps y descanso

Reps `min–max` y series de trabajo por ejercicio compuesto. El aislamiento usa las mismas reps y una serie menos, con mínimo 2. Pulso y movilidad siguen la sección 4.4 cuando el ejercicio es plancha o gato-camello. Escaladores y saltos de tijera usan la fila de resistencia si el objetivo es resistencia, y si no la fila de grasa; si el objetivo es fuerza o hipertrofia y aun así aparecen, usan 3 series de 12–20 y 45 s.

| Objetivo | Nivel | Series compuesto | Reps | Descanso |
| --- | --- | --- | --- | --- |
| fuerza | principiante | 3 | 5–8 | 150 s |
| fuerza | intermedio | 4 | 3–6 | 180 s |
| fuerza | avanzado | 5 | 3–5 | 180 s |
| hipertrofia | principiante | 3 | 8–12 | 90 s |
| hipertrofia | intermedio | 3 | 8–12 | 90 s |
| hipertrofia | avanzado | 4 | 6–12 | 90 s |
| resistencia | cualquiera | 3 | 12–20 | 45 s |
| grasa | principiante | 3 | 10–15 | 60 s |
| grasa | intermedio o avanzado | 3 | 8–15 | 60 s |

Esas cifras salen de adaptar las zonas de la NSCA (fuerza ≥ 85 % y descansos de minutos; hipertrofia 6–12 y descanso de 30–90 s; resistencia reps altas y descanso corto) a un solo usuario que no se ha medido el 1RM. No se prescribe un porcentaje del 1RM en el generador: sin una marca real, el porcentaje inventa kilos. El 1RM se calcula solo hacia atrás, sobre lo ya hecho (sección 8).

El volumen semanal por músculo se mantiene en la zona en la que Schoenfeld, Ogborn y Krieger vieron más hipertrofia a partir de unas 10 series, sin perseguir un techo que ese trabajo no fijó. Por eso el tope de la sección 5.2 existe.

### 5.5 Carga

Unidad del perfil: `kg` o `lb`. Incremento elegido: en kg, 0,5, 1 o 2,5; en lb, 1, 2,5 o 5. Por defecto 2,5 kg.

Salto de un ejercicio:

- Compuesto: 2,5 kg o 5 lb.
- No compuesto: 1 kg o 2,5 lb.
- Si el incremento del perfil es mayor que esa base, el salto pasa a ser el incremento del perfil.
- Peso corporal con el campo de peso vacío o a 0: no hay salto de kilos. Se progresa en reps.

Redondeo: al múltiplo más cercano del incremento del perfil. Empate: hacia abajo.

Regla de propuesta, evaluada al abrir la sesión, con las dos últimas sesiones `completada` que tengan ese ejercicio y al menos una serie de trabajo:

- Si en las dos todas las series de trabajo llegaron a `repMax` con el mismo peso, proponer peso + salto.
- Si en las dos alguna serie de trabajo se quedó bajo `repMin` con el mismo peso, proponer peso − salto, nunca por debajo de 0.
- Si las dos señales se pisan, o no hay dos sesiones, mantener el último peso.
- Primera vez: el campo queda vacío. Texto de ayuda: «Empieza ligero». No se inventan kilos a partir del peso corporal.

La propuesta se escribe en el campo y, si sube o baja, una línea dice «Sube a 62,5 kg» o «Baja a 60 kg», con botón «Mantener 60 kg» que devuelve el último peso. Nunca se aplica más de un salto de una vez.

Calentamiento, solo en el primer compuesto del día que ya tenga un peso de trabajo W mayor que 0: una serie al 50 % de W redondeada, 8 reps; otra al 75 %, 5 reps. Si el redondeo coincide con W, esa serie no se crea. Tipo `calentamiento`. No suman volumen, XP ni la regla 2-por-2.

### 5.6 Arco

Duración fija: 4 semanas. Nombre visible, cíclico: Arco del Cimiento, Arco de la Ascensión, Arco de la Forja, Arco del Umbral, Arco de la Corona. El índice es `(númeroDeArco − 1) módulo 5`. Detrás va el número de arco en romanos. Pares, en este orden, repetidos mientras quepan: 10 → X, 9 → IX, 5 → V, 4 → IV, 1 → I. Así 1 es I, 4 es IV, 6 es VI, 9 es IX, 14 es XIV y 20 es XX. El arco 6 se llama «Arco del Cimiento VI». No se usa un número arábigo en el título.

Modificador de la semana, aplicado después de la tabla de series:

| Semana | Nombre | Reps objetivo | Series | Carga |
| --- | --- | --- | --- | --- |
| 1 | Cimiento | el mínimo del rango | las de la tabla | última conocida, o vacía |
| 2 | Impulso | el entero más cercano a la media del rango | las de la tabla | última conocida |
| 3 | Cresta | el máximo | las de la tabla | +1 salto solo en los dos primeros compuestos del día, y solo si la regla de subida ya se cumple al empezar la semana |
| 4 | Templo | el mínimo | `max(2, floor(series × 0,6))` | 85 % del último peso, redondeado, y nunca por encima del último |

Texto de la semana 4 en Plan: «Semana templo: menos carga, el poder se asienta.» La semana templo da el mismo XP por serie que las otras. No es un castigo.

Avance: al abrir la app, si la fecha local pasó al lunes siguiente y la semana ISO anterior tenía sesiones completadas ≥ sesiones planificadas, la semana del arco suma 1. Si estaba en 4, empieza el arco siguiente en semana 1 y la variante base suma 1. Si no se cumplió el plan, se repite la misma semana del arco. Texto: «Repites esta semana del arco para asentar el poder.» Una sesión cuenta para la semana ISO en la que se terminó, aunque no caiga en el día pintado. Las de más no estorban. Las abandonadas no cuentan.

Clavado: en el reproductor, al sustituir, el interruptor «Usar este cambio en el plan» (apagado por defecto) fija ese hueco hasta que cambie el número de arco. El generador no lo pisa. «Regenerar semana» en Plan pide confirmación, rehace los días no clavados y no toca el historial.

### 5.7 Constructor

Desde Plan, «Nueva rutina» o editar una del plan. Nombre obligatorio. Lista ordenable de ejercicios de la biblioteca. En cada uno: series de trabajo (1–6), reps mín y máx (1–30, mín ≤ máx), descanso en segundos (15–300, paso 15) y nota de una línea (0–80 caracteres). Guardar escribe una rutina con id propio.

El plan autogenerado también es editable con el mismo constructor: al guardar un día del plan, ese día queda clavado para el resto del arco. «Soltar este día» quita el clavo y lo vuelve a generar.

«Empezar rutina libre» crea una sesión `en-curso` que no está atada a un día del plan. Suma XP de sesión sin el bonus de plan.

No se puede tener dos sesiones `en-curso`. Al empezar otra, el diálogo es: «Seguir el entreno a medias» o «Descartarlo». Descartar la marca `abandonada`, XP 0, y no se borra del historial.

## 6. Reproductor

Pantalla única, columna de lectura de 720 px como máximo, centrada en escritorio.

Cabecera: nombre del día o de la rutina, «Ejercicio 2 de 6», botón «Terminar». El botón Terminar pide confirmación si queda algún ejercicio pendiente: «Terminar con lo que ya hiciste» o «Volver».

Ejercicio actual: nombre (enlace a la ficha, se abre en un panel y no cierra la sesión), nota, y la línea del anterior. Series en lista. La serie en curso lleva el foco visual (borde ámbar). Cada serie de trabajo tiene peso, reps y, si es de duración, segundos. Completar es un botón con el texto «Completar serie», de 48 px de alto, separado al menos 8 px del campo. No es la misma zona que editar.

Al completar una serie de trabajo o de calentamiento empieza el descanso de ese ejercicio. El descanso muestra la cuenta atrás grande, «+15 s», «−15 s» y el tiempo restante editable. Esos botones cambian el descanso de esta serie y, si se mantiene pulsada la opción «Guardar para este ejercicio», el valor queda en la rutina. Por defecto el ±15 solo afecta a esta vez. La cuenta atrás no tapa los campos de la serie siguiente: el bloque de descanso vive encima de la lista y la lista sigue recibiendo foco y escritura. Hevy deja el temporizador como dueño de la pantalla; aquí no.

El fin del descanso es una marca de tiempo (`endsAt`), no un contador que se muera al bloquear el teléfono. Al volver a ser visible, si `endsAt` ya pasó, suena una vez el cierre y la marca se limpia.

Sustituir: lista del mismo patrón, equipo disponible y nivel permitido, sin los ids ya presentes en la sesión. La nueva ficha hereda series, reps y descanso. El peso se rellena con el historial del ejercicio nuevo, o queda vacío. El ejercicio anterior pasa a `sustituido` y no se borra del registro de la sesión.

Saltar: el ejercicio pasa a `saltado`, sus series no completadas no dan XP, y se muestra el siguiente pendiente. Si era el último pendiente, el salto abre el mismo diálogo que Terminar.

Reordenar: los ejercicios aún `pendiente` se mueven con botones «Subir» y «Bajar» (también arrastre en puntero fino). El ejercicio en curso no se mueve.

Anterior: «Anterior: 60 kg × 8», de la última sesión completada, última serie de trabajo de ese id. Si no hay, «Primera vez. Empieza ligero.» Si la última vez fue solo reps (peso 0), «Anterior: 12 reps».

Sonido, Web Audio, sin archivos y sin permiso. El `AudioContext` se crea en el gesto «Empezar» o «Seguir entreno». Ganancia máxima 0,08.

- Completar serie: cuadrada 880 Hz durante 40 ms y, 50 ms después, 1320 Hz durante 60 ms.
- Tres, dos y un segundos: seno 660 Hz durante 30 ms. Solo si la intensidad no es suave y no hay `prefers-reduced-motion`.
- Descanso terminado: seno 523 Hz 80 ms y seno 784 Hz 80 ms.

Ajustes tiene «Sonido del descanso», encendido por defecto. Apagado elimina los tres.

Atajos, anunciados en un texto «Atajos» al pie del reproductor en escritorio: Ctrl o Cmd + Enter completa la serie enfocada o, si el foco está en un campo de esa serie, la serie de ese campo. Escape no termina el entreno.

Al confirmar el fin: si hay al menos una serie de trabajo completada, estado `completada`, se calcula el XP y se abre el resumen. Si no hay ninguna, estado `abandonada`, XP 0, texto «Sin series de trabajo no hay poder nuevo. El entreno queda en el historial.» y se vuelve a Hoy.

Resumen: nombre del día, duración (de `startedAt` a `finishedAt`), series de trabajo hechas, volumen de la sesión en kg o lb, XP ganado, desglose en una línea («40 de base, 36 de series, 10 por seguir el plan»), récords si los hubo, barra hasta el siguiente nivel. Si el XP cruza un rango nuevo, el despertar (sección 12) se muestra antes del resumen y solo una vez. Botón «Listo» vuelve a Hoy.

Cámara de gravedad: interruptor en la cabecera del reproductor, antes de completar la primera serie de trabajo. A partir de ese momento queda fijo. Antes del rango Llama (`nivelDePoder` < 13) se ve desactivado, con «Se abre en el rango Llama.» Efecto al activarla: +1 serie de trabajo en cada ejercicio que ya tenga series de trabajo, sin pasar de 6; descanso +30 s en cada ejercicio. En semana templo, una línea: «Esta semana es templo. La cámara espera.» El interruptor sigue disponible. XP: ver sección 7.

## 7. Gamificación

### 7.1 Nivel de poder

`xpTotal` es un entero ≥ 0. El nivel de poder es el mayor `n` entre 1 y 100 tal que `xpTotal >= xpParaAlcanzarNivel(n)`.

```ts
function xpParaAlcanzarNivel(nivel: number): number {
  if (nivel <= 1) return 0;
  return Math.round(80 * Math.pow(nivel - 1, 1.45));
}
```

La tabla manda si un motor redondeara distinto. Umbral para entrar en el nivel:

| Rango | Id | Niveles | XP para entrar |
| --- | --- | --- | --- |
| Chispa | chispa | 1–5 | 0 |
| Brasa | brasa | 6–12 | 825 |
| Llama | llama | 13–22 | 2937 |
| Incendio | incendio | 23–32 | 7073 |
| Tormenta | tormenta | 33–44 | 12177 |
| Relámpago | relampago | 45–56 | 19324 |
| Nova | nova | 57–68 | 27413 |
| Eclipse | eclipse | 69–80 | 36327 |
| Mítico | mitico | 81–92 | 45980 |
| Absoluto | absoluto | 93–100 | 56310 |

El nivel 100 se alcanza en 62.627 XP y ya no sube. El XP que sobre se guarda y se muestra («62.627 XP, nivel 100»), sin otro rango. Borrar o corregir un registro puede bajar `xpTotal`. Si baja de umbral, el rango mostrado baja sin animación y sin texto de fracaso: la ficha de Poder enseña el rango que corresponde al XP actual. No hay puntos de vida.

Origen del XP, y solo estos:

1. Sesión `completada`.
2. El reto del héroe, una cifra por día local, sustituible.

El peso corporal, abrir la app, el onboarding y los logros no dan XP. Los logros son medallas, no moneda.

XP de sesión, entero:

```ts
const base = 40;
const porSerie = seriesDeTrabajoCompletadas * 6;
const sobrecarga = hayRecordEnLaSesion ? 15 : 0;
const plan = session.planDayId ? 10 : 0;
const parcial = base + porSerie + sobrecarga + plan;
const camara = session.camaraGravedad ? Math.round(parcial * 0.2) : 0;
const tope = session.camaraGravedad ? 300 : 250;
return Math.min(tope, parcial + camara);
```

Hay récord si alguna serie de trabajo de la sesión, comparada con el historial anterior de ese id, cumple: más reps con el mismo peso, o más peso con reps ≥ 1, o (peso 0) más reps o más segundos. El calentamiento no cuenta.

Vectores de prueba: 6 series, sin récord, con plan, sin cámara → 40 + 36 + 10 = 86. 40 series de trabajo → tope 250. La misma sesión con cámara, parcial 86 → cámara 17, total 103.

### 7.2 Rachas

- **Semanas en racha.** Semanas ISO consecutivas, ya cerradas, en las que las sesiones completadas fueron al menos las planificadas. La semana en curso no rompe la racha: se muestra «2 de 4 entrenos esta semana». Un lunes sin haber cumplido la anterior deja el contador en 0. Texto entonces: «Esta semana se empieza de nuevo.»
- **Racha del reto.** Días locales consecutivos con las cuatro metas canónicas cumplidas. Ayer sin reto completo la deja en 0. Texto: «La racha del reto vuelve a cero. Tu poder se queda.» No afecta a las semanas en racha ni al XP ya ganado por registros parciales.

No hay día de gracia ni vida que descontar. El descanso entre días de entreno no es un fallo: la racha que importa es la semana.

### 7.3 Reto del héroe

Metas canónicas, fijas: 100 flexiones, 100 abdominales, 100 sentadillas, 10 km. No se cambian en Ajustes.

Cuota sugerida, solo como pista, según el nivel del perfil:

| Nivel | Flexiones | Abdominales | Sentadillas | Km |
| --- | --- | --- | --- | --- |
| principiante | 20 | 20 | 20 | 1 |
| intermedio | 50 | 50 | 50 | 3 |
| avanzado | 100 | 100 | 100 | 10 |

La cuota no sustituye la meta. Completar la cuota de principiante no marca el reto como cumplido ni suma la racha del reto.

Pantalla de hoy: cuatro campos numéricos. Flexiones, abdominales y sentadillas: enteros de 0 a 999. Kilómetros: un decimal, de 0 a 99. Cada uno tiene barra hasta la meta canónica y una marca en la cuota. Texto fijo: «El reto completo es una meta alta. La cuota sugerida respeta tu nivel. Parar antes no baja tu poder.» y «Sin GPS. Tú marcas los kilómetros.»

Guardar escribe el día local (`YYYY-MM-DD` en la zona `Intl.DateTimeFormat().resolvedOptions().timeZone`, sin pedir permiso). Volver a guardar ese día sustituye. El historial permite editar cualquier día pasado: es un diario personal, sin detector de trampas.

Si las sesiones completadas de hoy suman reps de `flexion-pecho`, `abdominales` o `sentadilla-corporal`, se muestra «Hoy en el entreno: N flexiones» y un botón «Usar esas cifras» que copia el número solo si el campo está a 0. Los kilómetros no se copian de ningún sitio.

XP del día, sustituye al XP anterior de esa fecha (la diferencia, positiva o negativa, se aplica a `xpTotal`):

```ts
const flex = (Math.min(log.flexiones, 100) / 100) * 20;
const abd = (Math.min(log.abdominales, 100) / 100) * 20;
const sen = (Math.min(log.sentadillas, 100) / 100) * 20;
const km = (Math.min(log.km, 10) / 10) * 25;
const completo =
  log.flexiones >= 100 &&
  log.abdominales >= 100 &&
  log.sentadillas >= 100 &&
  log.km >= 10
    ? 15
    : 0;
return Math.round(flex + abd + sen + km + completo);
```

El máximo es 100. Vector: 50 flexiones y el resto a 0 → 10. El día canónico completo → 100. Anotar 200 flexiones sigue contando como 20 de ese apartado.

El reto no crea una sesión de entreno. El entreno no marca el reto solo.

### 7.4 Logros

Lista cerrada. Se conceden al detectar la condición y quedan en el almacén. No se retiran si más tarde el XP baja, salvo «reiniciar», que borra todo.

| id | Nombre | Condición |
| --- | --- | --- |
| primera-sesion | Primera sesión | 1 sesión completada |
| diez-sesiones | Diez sesiones | 10 |
| cincuenta-sesiones | Cincuenta sesiones | 50 |
| cien-sesiones | Cien sesiones | 100 |
| semana-completa | Semana cerrada | 1 semana ISO cumplida |
| cuatro-semanas | Arco cerrado | 1 arco que llegó a terminar su semana 4 |
| reto-anotado | Reto anotado | 1 día con algún campo > 0 |
| reto-completo | Reto completo | 1 día canónico |
| reto-siete | Siete días de reto | racha del reto ≥ 7 en algún momento |
| primer-record | Primer récord | 1 serie que cumpla la definición de récord |
| volumen-10k | Diez mil kilos | volumen acumulado de trabajo ≥ 10.000 kg (si la unidad es lb, el umbral equivalente es 22.046 lb de volumen) |
| camara | Cámara de gravedad | 1 sesión completada con la cámara activa |
| primera-pesada | Primera pesada | 1 registro de peso corporal |
| ejercicio-propio | Ejercicio propio | 1 ejercicio de usuario creado |
| rango-brasa … rango-absoluto | El nombre del rango | nueve medallas, una al alcanzar por primera vez cada rango desde Brasa hasta Absoluto |

Poder lista las medallas ganadas y, en un grupo aparte con menos contraste, las que faltan, con la condición en una frase. Nada está oculto detrás de un pago.

## 8. Historial y estadísticas

**Calendario.** Mes visible, lunes en la primera columna. Un día con sesión completada lleva un punto naranja; con reto anotado, un punto azul; con los dos, los dos. El día se abre y lista sesiones (hora, nombre, volumen, XP) y, si existe, el reto. Vacío: «Este día está en blanco.»

**Volumen.** Doce semanas ISO, de la actual hacia atrás. Volumen = suma de `pesoKg × reps` de series de trabajo completadas con peso > 0. El peso corporal a 0 no entra en esa suma; sus reps van a una segunda serie del gráfico, «Repeticiones con el cuerpo». SVG propio, sin librería: barras, eje con números, y una tabla con las mismas cifras debajo, con caption «Volumen de las últimas 12 semanas». La tabla es la versión accesible; el SVG tiene `aria-hidden`.

**Récords.** Por ejercicio, mejor peso en una serie de trabajo, mejor reps a ese peso o por encima, y mejor duración si aplica. Orden: última vez que se batió, la más reciente primero.

**1RM estimado.** Solo con peso > 0.

- 1 rep: el peso.
- De 2 a 10: el menor entre Epley y Brzycki.
  - Epley: `peso × (1 + reps / 30)`.
  - Brzycki: `peso × 36 / (37 − reps)`.
- Más de 10 reps: no se muestra. Texto: «El 1RM estimado pide 10 repeticiones o menos.»

Se guarda el mejor valor por ejercicio. Presentación a un decimal. Vectores: 100 kg × 5 → Epley 116,666…, Brzycki 112,5, se muestra 112,5 kg. 80 kg × 10 → ambos 106,666…, se muestra 106,7 kg. 100 kg × 1 → 100 kg. 50 kg × 12 → sin cifra.

**Peso corporal.** Una cifra por día, en la unidad del perfil, entre 20 y 400 kg (o 44 a 882 lb). Si se guarda otra el mismo día, sustituye. Nota opcional de hasta 80 caracteres. Gráfico de 90 días, misma regla de SVG más tabla. No hay peso objetivo ni XP.

## 9. Ajustes, JSON y PWA

Ajustes:

- Unidad, kg o lb. Al cambiar, las cifras guardadas en kg se convierten solo al mostrar y al exportar en la unidad activa. El almacén interno de peso de barras es siempre kg, con 3 decimales. 1 lb = 0,45359237 kg. Al pasar de lb a kg y volver, el valor mostrado coincide con el incremento (no se acumula error visible).
- Incremento, según la unidad.
- Intensidad del tema: Suave, Media, Plena. Por defecto Media.
- Sonido del descanso.
- Editar perfil (sección 3).
- Exportar, importar, reiniciar.

Exportar descarga `poder-fitness-AAAA-MM-DD.json`:

```json
{
  "schema": 1,
  "app": "poder-fitness",
  "exportedAt": "2026-10-06T12:00:00.000Z",
  "profile": {},
  "exercises": [],
  "routines": [],
  "arcs": [],
  "plans": [],
  "sessions": [],
  "heroLogs": [],
  "bodyWeights": [],
  "achievements": []
}
```

Importar: se elige un archivo, se valida `schema === 1` y `app === "poder-fitness"`, y que cada sesión tenga `id`, `status` y `exercises`. Si falla: «Ese archivo no es una copia de Poder Fitness.» y no se escribe nada. Si vale: resumen con número de sesiones, días de reto y pesadas, más «Esto sustituye lo que hay ahora en este aparato.» Confirmar ejecuta antes una descarga de seguridad con el mismo formato y luego reemplaza los almacenes en una transacción. Cancelar no toca nada.

Reiniciar: botón «Borrar todo», luego hay que escribir `REINICIAR` y confirmar. Texto: «Se borra el entreno, el reto y el perfil. Exporta antes si lo quieres conservar.» Tras ello se vacía IndexedDB, se reescribe la semilla y se vuelve al onboarding.

PWA. `manifest.webmanifest`: `name` «Poder Fitness», `short_name` «Poder», `display` `standalone`, `start_url` `/`, `lang` `es`, `background_color` `#0B0D12`, `theme_color` `#0B0D12`, iconos 192 y 512 en `any` y `maskable`. Si el paquete de arte trae `emblema-{id}.svg` y los iconos, se usan. Si no, el icono es un cuadrado `#FF6A1A` con una P en `#0B0D12`, y el rango se dibuja como el nombre en Sora dentro de un círculo naranja. La app no espera al paquete de arte para funcionar.

Service worker de `vite-plugin-pwa` en precache del shell, fuentes, iconos y diagramas. La navegación cae al `index.html`. IndexedDB no se duplica en la caché del worker. Tras una carga con red, recargar sin red abre Hoy con los datos locales. Actualizar el shell no migra solo: la `version` de la base sube y `idb` ejecuta `upgrade` sin borrar almacenes existentes.

Presupuesto: el catálogo semilla se filtra en el hilo principal. Completar una serie pinta el nuevo estado antes de esperar al disco; si la transacción falla, se muestra «No se pudo guardar. Reintenta.» y se deja la serie sin completar.

## 10. Modelo IndexedDB

Base `poder-fitness`, versión 1.

`profile` (clave `singleton`): `name`, `level`, `goal`, `equipment[]`, `daysPerWeek`, `weekdays[]` (1–7), `unit`, `increment`, `theme`, `sound`, `xpTotal`, `ranksSeen[]`, `createdAt`.

`exercises` (clave `id`; índices `nombre`, `patron`, `nivel`): los campos de la sección 4.4 más `alias[]`, `pasos[3]`, `origen`, `archivado`, `compuesto`.

`routines` (clave `id`): `name`, `items[]` con `exerciseId`, `series`, `repMin`, `repMax`, `descansoSegundos`, `nota`, `updatedAt`.

`arcs` (clave `id`): `number`, `weekInArc` 1–4, `variantBase`, `startedOn` (fecha local del lunes).

`plans` (clave `id`): `arcId`, `weekStart`, `days[]`. Cada día: `date`, `kind`, `variant`, `pinned`, `items[]` (igual que la rutina, más `slot` con el patrón). Un solo plan `active: true`.

`sessions` (clave `id`; índices `byDate`, `byStatus`): `status` (`en-curso` | `completada` | `abandonada`), `startedAt`, `finishedAt`, `date`, `planDayId` o null, `routineId` o null, `camaraGravedad`, `xpAwarded`, `restEndsAt` o null, `exercises[]`. Cada ejercicio de la sesión es una copia: `instanceId`, `exerciseId`, `nombre`, `patron`, `compuesto`, `descansoSegundos`, `repMin`, `repMax`, `estado` (`pendiente` | `en-curso` | `hecho` | `saltado` | `sustituido`), `series[]`. Cada serie: `id`, `kind` (`calentamiento` | `trabajo`), `pesoKg` o null, `reps` o null, `segundos` o null, `completed`, `completedAt`.

`heroLogs` (clave `date`): `flexiones`, `abdominales`, `sentadillas`, `km`, `xpAwarded`.

`bodyWeights` (clave `date`): `kg`, `nota`.

`achievements` (clave `id`): `unlockedAt`.

Las fechas de calendario son `YYYY-MM-DD` locales. Los instantes son ISO UTC.

## 11. Principios visuales y de movimiento

Modo oscuro único. La intensidad no es un modo claro: cambia aura, líneas y fotogramas.

Tokens:

| Token | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#0B0D12` | fondo |
| `--surface` | `#141821` | tarjetas |
| `--surface-2` | `#1C2230` | filas y campos |
| `--text` | `#F4F1EA` | texto |
| `--muted` | `#B7C0D0` | texto secundario; pasa AA sobre `--bg` y sobre `--surface` |
| `--orange` | `#FF6A1A` | acción principal, solo en relleno de botón con texto `--bg`, o en trazos de 3 px |
| `--orange-soft` | `#FFC7A3` | acentos pequeños sobre oscuro |
| `--blue` | `#3D7EFF` | reto, enlaces |
| `--yellow` | `#FFD23A` | foco, récord, fotograma de impacto |
| `--danger` | `#FF8FA2` | descartar y saltar; el botón de daño usa relleno y texto oscuro |

El naranja `#FF6A1A` no se usa para texto de cuerpo sobre el fondo oscuro: no llega a AA en tamaños pequeños. El botón primario es naranja con texto `#0B0D12` en Sora 700.

Aura: un resplandor radial naranja detrás del emblema de rango, radio 120 px. Opacidad 0 en suave, 0,45 en media, 0,8 en plena. No pulsa si `prefers-reduced-motion`.

Líneas de velocidad: cuatro trazos diagonales de 2 px en `--orange-soft` a la izquierda del ejercicio en curso. Solo en media y plena, y solo sin reduced motion.

Fotograma de impacto: al completar una serie, un borde interior amarillo de 2 px durante 80 ms, dos veces (80 ms on, 40 ms off, 80 ms on). En plena se añade un destello de fondo `#FFD23A` al 12 % durante 120 ms. En suave o con reduced motion no hay fotograma; el botón pasa a estado «Hecha» y ya está.

Despertar de rango, una vez por rango, guardado en `ranksSeen`: el emblema entra de escala 0,92 a 1 en 280 ms con curva `ease-out`, un anillo naranja se dibuja en 400 ms y un anillo azul queda al 40 % como estela. A los 120 ms, un fotograma de impacto en el marco del diálogo. Título: «Rango Llama». Frase: «Tu nivel de poder entra en Llama.» Botón: «Seguir». Con reduced motion: el emblema aparece al 100 % sin escala y sin anillos; la frase es la misma.

Cifras de peso, reps, temporizador y XP en Sora, `font-variant-numeric: tabular-nums`. Títulos de pantalla en Sora 700. Cuerpo en Source Sans 3, 18 px en móvil, interlineado 1,45.

Diagramas de patrón, SVG 160×120, trazo 3 px `currentColor`, sin relleno de personaje reconocible de una obra. Una figura geométrica de lado o de frente y una flecha:

- rodilla y rodilla-unilateral: dos segmentos de pierna que se cierran, flecha hacia abajo.
- cadera: torso inclinado, flecha horizontal hacia atrás.
- empuje horizontal: brazos que se estiran desde el pecho, flecha hacia arriba.
- empuje vertical: brazos en vertical, flecha hacia arriba.
- tracción horizontal y vertical: brazos que se acercan al torso, flecha hacia el cuerpo.
- core: bloque rectangular sobre una línea de suelo.
- bíceps y tríceps: un codo que se cierra o se abre.
- hombro: un brazo que se abre a un lado.
- femoral: talón que se acerca a la cadera.
- gemelo: un pie sobre un escalón, flecha hacia arriba.
- acondicionamiento: dos marcas de pie alternas.
- movilidad: una curva de espalda con doble flecha.

## 12. Accesibilidad

Objetivo WCAG 2.2 AA.

- `html` con `lang="es"`.
- Cada campo tiene `label` visible. Los errores van en texto, no solo en color: «Escribe tu nombre.»
- Foco visible: contorno 2 px `--yellow`, offset 2 px. Nunca `outline: none` sin reemplazo.
- Objetivo táctil mínimo 44×44. El botón de completar, 48 de alto.
- El contraste del texto usa `--text` o `--muted` sobre `--bg` o `--surface`. Los estados no dependen solo del color: la serie hecha dice «Hecha», el día del calendario tiene texto además del punto.
- `prefers-reduced-motion: reduce` aplica el comportamiento suave de la sección 11.
- `prefers-contrast: more` sube los bordes de tarjeta a 2 px `--text` y pone el aura a 0.
- El temporizador usa `aria-live="polite"`. Anuncia al empezar («Descanso de 90 segundos»), al cruzar 30, 10, 3 y 0, no cada segundo.
- El despertar de rango mueve el foco al título del diálogo y lo atrapa hasta «Seguir».
- El reordenar del reproductor tiene botones con nombre accesible «Subir remo a una mano», no solo un asa de arrastre.
- La construcción del reto y el reproductor se completan con teclado: Tab en un orden que sigue el documento, sin trampas. Se comprobó el hueco de VoiceOver en la base de Zombies, Run!; aquí no hay un lienzo que solo se arrastre.

## 13. Criterios de aceptación

Cada ítem se puede comprobar con Vitest o en el navegador, sin red, tras instalar el service worker.

1. Sin perfil, la raíz redirige a `/onboarding`. Terminar los seis pasos con nombre «Antonio», principiante, hipertrofia, solo peso corporal y 3 días crea un plan de tres días de tipo cuerpo y abre Hoy con «Antonio» y el rango Chispa.
2. Ese plan solo contiene ids cuyo equipo es peso corporal y cuyo nivel es principiante, incluye las reservas cuando el patrón no tiene otra opción, no repite un id en el día y no pone dos veces seguidas el mismo músculo si existe alternativa.
3. Intermedio, fuerza, barra y banco y mancuernas, 4 días: la secuencia es torso, pierna, torso, pierna, y la segunda copia usa otros ids cuando el catálogo tiene más de un candidato.
4. Avanzado con solo peso corporal no recibe `peso-muerto` ni `dominadas`.
5. Buscar «flexion» devuelve «Flexión de pecho». Filtrar músculo abdomen y equipo barra devuelve cero y el vacío descrito. Quitar filtros devuelve el catálogo.
6. La ficha de `flexion-pecho` muestra tres pasos y un SVG. No hay peticiones de red en esa pantalla (pestaña Red vacía de terceros).
7. Crear un ejercicio propio con tres pasos lo lista y, si el equipo encaja, puede salir en un plan regenerado.
8. Empezar el día precarga el peso de la última sesión completada, no el de una anterior. Primera vez: campo vacío y «Empieza ligero.»
9. Dos sesiones seguidas con todas las series de trabajo en el máximo del rango proponen un solo salto, con «Mantener» operativo. Una sesión no basta para subir. Nunca se proponen dos saltos.
10. 100 kg × 5 muestra 1RM 112,5 kg. 50 kg × 12 no muestra 1RM. El volumen ignora calentamiento y peso 0.
11. Completar una serie deja escribir la siguiente mientras el descanso cuenta. A los 15 s añadidos, `endsAt` se retrasa 15 s. Recargar a mitad del descanso conserva las series y la marca de tiempo.
12. Con sonido activo, completar una serie y terminar el descanso producen sonido sin haber pedido permiso de micrófono. Con sonido apagado, no hay llamadas que suenen (el contexto puede existir, la ganancia de esos eventos queda a 0).
13. Sustituir ofrece solo el mismo patrón. «Usar este cambio en el plan» hace que regenerar la semana conserve ese id. Sin el interruptor, regenerar vuelve al id generado.
14. Terminar con cuatro series de trabajo, sin récord, atado al plan y sin cámara otorga 40 + 24 + 10 = 74 XP y lo muestra en el resumen. Una segunda sesión idéntica no duplica el XP de la primera al recargar el resumen.
15. 40 series de trabajo en una sesión otorgan 250, o 300 si la cámara estaba activa y el parcial con el 20 % superaría 300.
16. La cámara está desactivada con el texto de Llama por debajo del nivel 13, y activa por encima. Añade una serie de trabajo sin pasar de 6.
17. Cruzar 825 XP muestra el despertar de Brasa una sola vez. Volver a entrar no lo repite. `ranksSeen` contiene `brasa`.
18. El reto acepta 40, 10, 0 y 0,5. El parcial es 8 + 2 + 0 + 1,25 = 11,25, que redondea a 11 XP. Pasar a 100, 100, 100 y 10 el mismo día deja el XP de ese día en 100, no en 111. El rango no baja por dejar el día a medias.
19. Un día canónico completo sube la racha del reto. El día siguiente vacío la pone a 0 con la frase de la sección 7.2, y el XP total no se reduce por eso.
20. Una semana ISO con 3 sesiones planificadas y 3 completadas, cerrada el lunes, suma 1 a semanas en racha. Dos sesiones no suman. El día de descanso entre medias no la rompe.
21. El calendario pinta el día con sesión y el día con reto. El gráfico de volumen tiene tabla con los mismos doce números.
22. Guardar 80,4 kg de peso corporal y cambiar la unidad a lb muestra el equivalente, y al volver a kg sigue mostrando 80,4.
23. Exportar, borrar el origen en una base vacía de prueba e importar restaura sesiones, reto y XP. Un JSON con `schema: 2` no escribe.
24. Reiniciar sin la frase exacta `REINICIAR` no borra. Con la frase, el siguiente arranque es el onboarding y la semilla sigue en la biblioteca.
25. Con la red cortada después de la primera carga, Hoy, Plan, Biblioteca, una serie y el reto se leen y se escriben. En toda la sesión de prueba no aparece un permiso de notificaciones, ubicación, cámara ni micrófono.
26. En 390 px de ancho, la barra tiene cuatro destinos, el reproductor no se sale y el botón Completar no queda bajo el descanso. En 1280 px, el reproductor no se estira más de 720 px y Plan muestra la semana y el detalle a la vez.
27. Recorrido de teclado: de Hoy a empezar entreno, completar una serie, terminar y llegar al resumen sin ratón. El foco del despertar, si ocurre, queda dentro del diálogo.
28. Con `prefers-reduced-motion: reduce`, completar una serie no anima el fotograma y el despertar no escala el emblema. El texto del rango nuevo sí aparece.
29. Ninguna cadena visible contiene «Dragon Ball», «One Punch», «Saiyan», «Kamehameha» ni el nombre del manga asociado al reto de 100 / 100 / 100 / 10. El reto se llama «Reto del héroe».

## 14. Copy de interfaz

Tuteo, frases cortas, sin exclamaciones en cadena. Botones en infinitivo o en una orden clara de una o dos palabras cuando es la acción de la serie.

| Situación | Texto |
| --- | --- |
| Empezar el día | Empezar entreno |
| Seguir | Seguir entreno |
| Completar | Completar serie |
| Descanso | Descanso |
| Mantener carga | Mantener |
| Sustituir | Sustituir ejercicio |
| Saltar | Saltar ejercicio |
| Fin | Terminar entreno |
| Resumen, botón | Listo |
| Reto | Reto del héroe |
| Cámara | Cámara de gravedad |
| Semana 4 | Semana templo |
| Rango nuevo | Rango {nombre} |
| Exportar | Exportar copia |
| Importar | Importar copia |
| Borrar | Borrar todo |

Vacío de Hoy, día de descanso: «Hoy el plan descansa. El reto sigue disponible.» Vacío de historial: «Cuando cierres un entreno, aparecerá aquí.»
