# Investigación de producto — Poder Fitness

Fecha de corte: 6 de octubre de 2026. Esta nota cierra la investigación **antes** de la spec (`docs/spec.md`). Todo lo que la spec da por cerrado sale de aquí o de una restricción explícita del encargo (un solo usuario, sin cuenta, sin backend, sin permisos del navegador, homenaje original).

Poder Fitness es una PWA personal, en español, para una persona. El ambiente es de poder creciente, rangos y arcos de entrenamiento. La interfaz, los textos, el audio y el arte tienen que ser originales. Esta investigación nombra apps reales para aprender de ellas. Esos nombres no pasan a la interfaz ni a los datos de la app.

## Cómo se investigó

Se revisaron fichas de tienda, reseñas de usuarios, hilos de Reddit, teardowns de UX y fuentes de entrenamiento. Cuando una reseña y un artículo se contradicen, manda el patrón que se repite en varias fuentes, no una queja suelta. Las cifras de fórmulas (1RM, XP, rachas) que la spec fija están calculadas en esta nota para que el implementador no las reinterprete.

## Qué se busca en cada app

Para cada producto: qué flujo hace bien, de qué se quejan usuarios reales, y qué patrón adopta o supera Poder Fitness.

---

## Hevy

**Qué es.** Registro de fuerza con rutinas, historial, descanso y progreso. Muy citado como el estándar actual de “anotar la serie sin pelearse con la app”.

**Qué hace bien.**

- La sesión vive en una sola pantalla. El valor de la última vez ya está puesto. La acción es confirmar o corregir, no teclear desde cero. Un teardown del flujo lo resume así: entre serie y serie la tolerancia a la fricción es casi cero, y el progreso sale del mismo registro, sin un formulario extra al terminar ([Hevy teardown, Tarun Rai](https://www.tarunrai.com/post/hevy-app-teardown)).
- El temporizador de descanso arranca al completar la serie. Rutinas reutilizables. Las series de calentamiento se pueden marcar y no deben mezclarse con el trabajo.
- Comparativas de 2026 le dan a Hevy la ventaja en plantillas ilimitadas en el plan gratuito, gráficos más ricos y feed social; a Strong, la ventaja en velocidad pura de registro ([Strong vs Hevy, RepReturn](https://repreturn.com/strong-app-vs-hevy/); [Hevy vs Strong, PRPath](https://prpath.app/blog/strong-vs-hevy-2026.html)).

**De qué se quejan.**

- Lentitud y toques que tardan segundos en registrarse, sobre todo al anotar durante la sesión ([r/Hevy, julio 2025](https://www.reddit.com/r/Hevy/comments/1lzdan1/app_performe_issue/)).
- Series que se saltan, notas que desaparecen, un ejercicio sustituido que vuelve al original, y pantallas en negro al hacer scroll ([r/Hevy, bugs tras una actualización](https://www.reddit.com/r/Hevy/comments/1lfbiyy/anyone_elses_app_acting_buggy_after_an_update/)).
- Desincronización del reloj: descanso, repeticiones y series divergen entre teléfono y wearable; entrenos duplicados o no guardados ([r/Hevy, abril 2025](https://www.reddit.com/r/Hevy/comments/1jzjeb6/frustrated/); [r/Hevy, desconexión](https://www.reddit.com/r/Hevy/comments/1jjgwpv/why_havent_they_fixed_apple_watch_syncing_yet/)).

**Patrón para Poder Fitness.** Copiar la pantalla única, el precargado de la última serie de trabajo y el descanso automático. Superarlo en durabilidad: cada serie se escribe en IndexedDB **antes** de arrancar el descanso. No hay wearable ni sync, así que esa clase de bug no existe. Las notas de la sesión se guardan con la misma escritura. El rendimiento de la pantalla de entreno es requisito de aceptación, no un pulido posterior.

## Strong

**Qué es.** Registro mínimo de gimnasio. La promesa de la ficha de Play es anotar rápido, ver el 1RM estimado, el volumen, los récords y el descanso ([Strong en Google Play](https://play.google.com/store/apps/details?hl=en_US&id=io.strongapp.strong)).

**Qué hace bien.**

- Velocidad. RepReturn describe la interfaz como diseñada para el hueco de 60–120 segundos entre series: peso anterior cargado, descanso solo, búsqueda corta, calculadora de discos a un toque ([Strong vs Hevy](https://repreturn.com/strong-app-vs-hevy/)).
- Tipos de serie (calentamiento, fallo, descendente) y superseries. El recuerdo del último peso es la motivación que los usuarios nombran en reseñas positivas ([reseñas de Strong](https://appsupports.co/464254577/strong-workout-tracker-gym-log/positive-reviews)).
- Un patrón de diario bien resuelto, documentado en herramientas del mismo género: el calentamiento no entra en volumen, récords ni progresión; la superserie no dispara el descanso hasta cerrar la ronda ([modelo de diario de LiftTrace](https://traceapps.github.io/docs/lifttrace/diary/)).

**De qué se quejan.**

- La actualización v6 borró descansos por ejercicio y dejó un descanso global. Quien tenía 3 minutos en un básico y 20 segundos entre accesorios tuvo que rehacerlo todo. También desapareció la historia visible en el reloj, justo la referencia de la sobrecarga progresiva ([r/strongapp, temporizadores](https://www.reddit.com/r/strongapp/comments/1kliz3t/rest_timers_erased/); [reseña de la v6](https://www.reddit.com/r/strongapp/comments/1kspk8x/review_of_the_new_strong_app_update_after_months/)).
- El autocompletado pasó de “la última sesión” a valores que los usuarios perciben como aleatorios, sacados de sesiones viejas.
- Congelación al volver del descanso, batería, y entrenos que se pierden cuando el sync del reloj falla ([reseñas agregadas](https://mwm.ai/apps/strong-workout-tracker-gym-log/464254577)).

**Patrón para Poder Fitness.** El descanso es por ejercicio y vive en la plantilla de la sesión. La referencia de carga es **la última serie de trabajo**, nunca un máximo antiguo ni una sesión de descarga. El calentamiento queda fuera de volumen, 1RM, XP y récords. Las superseries no entran en la primera versión de la interfaz; el modelo de datos ya guarda un `groupId` para no migrar después. No hay calculadora de discos en v1.

## Fitbod

**Qué es.** Generador de entrenos a partir de objetivo, equipo y recuperación, con sugerencia de peso y repeticiones. Es el referente de “que la app programe”.

**Qué hace bien.**

- Quitar la página en blanco del lunes: hay una sesión propuesta.
- Quien lleva años con la app se queda por el registro y por el empujón de subir peso, y usa rutinas guardadas cuando el generador no convence ([r/fitbod, 3 años de uso](https://www.reddit.com/r/fitbod/comments/1irxlk2/using_fitbod_for_over_3_years_working_out_for_10/)).
- Sustituir un ejercicio a mitad de sesión es parte del flujo, y los usuarios lo consideran obligatorio.

**De qué se quejan.**

- El generador repite, ignora equipo que el usuario sí tiene si no lo usó hace poco, ordena mal los ejercicios y no entiende que dos patrones del mismo músculo en el mismo día suman fatiga ([r/fitbod, “I think I'm done”](https://www.reddit.com/r/fitbod/comments/1ltvded/i_think_im_done/); [dejé de fiarme](https://www.reddit.com/r/fitbod/comments/1jpeeko/i_stopped_trusting_fitbod_with_my_fitness_journey/)).
- La progresión no lineal se siente arbitraria: a veces no sube en un año, a veces sube de golpe. El peso de un press de piernas no se puede comparar con el de una extensión, pero la app trata la “fuerza estimada” como si fueran la misma moneda ([reseña de un año, con formación en ciencias del ejercicio](https://www.reddit.com/r/fitbod/comments/1joklkd/review_of_fitbod_after_one_year_of_use/)).
- Cambiar el objetivo de días por semana rompe la racha pasada. El objetivo de 7 días reaparece solo.
- Ejercicios custom que no entran en el algoritmo: el usuario paga por programar y acaba programando a mano.
- La búsqueda tiene muchos filtros y aun así cuesta encontrar el ejercicio.

**Patrón para Poder Fitness.** Habrá plan semanal autogenerado, porque el encargo lo pide y porque el vacío inicial es real. El generador es **determinista y explicable**: mismo perfil, mismo plan. No hay modelo de lenguaje ni “recuperación muscular” opaca. La sugerencia de carga solo aparece cuando ya hay una serie de trabajo registrada; antes, el peso va en blanco. Sustituir y saltar están en el reproductor. Cambiar el objetivo no reescribe el historial ni la racha ya cerrada. Los ejercicios custom entran en rutinas custom; el generador automático solo usa el pool curado.

## JEFIT

**Qué es.** Biblioteca grande, rutinas, gráficos y variaciones de ejercicio. Quien viene de Hevy destaca el modo oscuro, las variaciones y un generador que reutiliza los últimos pesos ([r/jefit, desde Hevy y Fitbod](https://www.reddit.com/r/jefit/comments/1n1bfxg/coming_from_hevy_fitbod_pleasantly_surprised_from/)).

**Qué hace bien.**

- Ficha de ejercicio con instrucciones y mucha variedad. FitHero, en el mismo género de registro, publica la misma expectativa: vídeo o imagen, 1RM, gráficos, kg/lb, calendario, racha y copia de seguridad ([FitHero en Play](https://play.google.com/store/apps/details?id=com.fnp.fithero&hl=en_US)).
- Objetivos por ejercicio con un porcentaje de avance. Útil, pero fácil de convertir en otra barra más. Poder Fitness no añade una meta numérica paralela al plan: el plan ya es la meta de la semana.

**De qué se quejan.**

- Pasar de libras a kilos cambia la etiqueta y no el valor, y puede resetear el progreso ([r/jefit, sugerencia de grupos musculares](https://www.reddit.com/r/jefit/comments/1ge102z/new_suggestion/)).
- Un ejercicio a 0 kg no recuerda el 0. El peso corporal se guarda mal ([hilo de peticiones](https://www.reddit.com/r/jefit/comments/1gresrc/feature_request_megathread_share_your_suggestions/)).
- Los grupos musculares son demasiado gruesos (“upper leg”) para un volumen creíble. En el mismo hilo, el propio equipo mencionó más granularidad, conversión real de unidades y pesos de arranque a partir del historial.
- Añadir un ejercicio puede resetear el día del programa. La sync de Android ha llegado a mezclar rutinas y a exigir restaurar una copia ([r/jefit, sync](https://www.reddit.com/r/jefit/comments/1eg4bn8/android_sync_missing_routine_issues/)).
- Tras un cambio de base de datos, el camino “músculo → ejercicio → añadirlo al entreno” se rompió y obligó a dar un rodeo ([reseña de usuario largo](https://www.reddit.com/r/jefit/comments/1pmvzdz/is_this_the_best_free_workout_app_jefit_app_review/)).

**Patrón para Poder Fitness.** Filtros por músculo, equipo, categoría y nivel, y ficha con imágenes e instrucciones. La conversión kg/lb es aritmética (`kg = lb / 2.2046226218`) y no toca el número guardado, que vive siempre en kg. El 0 es un valor válido y se vuelve a mostrar. El volumen usa un mapa de grupos más fino que “pierna superior”, documentado en la spec, sabiendo que la base libre trae límites (el peso muerto viene etiquetado como “lower back”). No hay sync: la copia de seguridad es un JSON que el usuario guarda donde quiera.

## Nike Training Club

**Qué es.** Sesiones guiadas y programas de varias semanas, con filtros por duración, nivel, intensidad y equipo.

**Qué hace bien.**

- El filtro y la ficha previa permiten elegir con información: duración, foco y material antes de darle a empezar ([despiece de UI de NTC](https://screensdesign.com/showcase/nike-training-club-wellness)).
- Programas multsemana con un día asignable. El modo “pizarra” (lista de ejercicios a tu ritmo) es el que los usuarios de casa echan de menos cuando desaparece.
- Una reseña de Lifehacker valora la variedad y el precio (gratis) y señala la falta de comunidad y los cuelgues al salir y volver ([Lifehacker](https://au.lifehacker.com/nike-training-club-app/115728/review/nike-training-club-review-better-than-i-expected-for-a-free-app)).

**De qué se quejan.**

- El giro a “clase” quitó la lista de ejercicios, la vista previa, el temporizador y la posibilidad de saltar o repetir. La gente elige a ciegas y no puede preparar el material ([reseñas negativas agregadas](https://appsupports.co/301521403/nike-training-club/negative-reviews)).
- El plan termina antes de la fecha, o desaparece si abres la app sin red ([reseñas de App Store](https://apps.apple.com/by/app/nike-training-club/id301521403?platform=watch&see-all=reviews)).
- La voz se entierra bajo la música. Hay intros repetidas en cada sesión. Los programas antiguos se borran.
- Un estudio de UX sobre la app resume tres huecos: poca flexibilidad dentro de la guía, poco feedback durante la serie, y poca personalización según el historial ([Charmaine Qiu](https://charmaineqiu.com/Nike-Your-Personal-Trainer-UI-UX-CUI-1)).

**Patrón para Poder Fitness.** Antes de empezar se ve la sesión completa: ejercicios, series, repeticiones, descanso y equipo. Durante la sesión se puede saltar o sustituir. El ritmo lo marca la persona, no un vídeo. El plan de la semana sigue disponible sin red. No hay música de fondo ni locución: el único audio es el descanso, generado en el dispositivo.

## Zombies, Run!

**Qué es.** Carrera con episodios, personajes y una base que se construye con las salidas. Es el referente de narrativa aplicada al ejercicio.

**Qué hace bien.**

- La historia da una razón para la siguiente sesión. Una entrevista cualitativa a 30 usuarios (16–53 años, 13 países) encontró cuatro temas: por qué empiezan y se quedan, qué funciones prefieren, qué efectos notan, y pros y contras. La inmersión y los personajes alargan la sesión y el uso en el tiempo ([Farič et al., vía Universidad de Edimburgo](https://www.research.ed.ac.uk/en/publications/running-app-zombies-run-users-engagement-with-physical-activity-a/)).
- En Reddit, gente que no sostenía una carrera cuenta que la misión siguiente les saca de casa, incluso años después ([r/Runner5](https://www.reddit.com/r/Runner5/comments/1dujfn6/anyone_care_to_share_their_success_stories/); [r/running](https://www.reddit.com/r/running/comments/jlzvgh/zombies_run/)).
- La duración de la misión se puede ajustar a la salida real. Quien no quiere un sprint sorpresa desactiva las persecuciones.

**De qué se quejan.**

- Distrae a quien quiere desconectar. No sustituye a un plan de running serio ni da métricas finas ([r/running, ¿merece la pena?](https://www.reddit.com/r/running/comments/2vvi64/zombies_run_worth_getting_personal_reviews_and/)).
- Bugs de persecución que no terminan, pasos que no cuentan, modo radio roto, y miedo a que el archivo narrativo se quede a medias ([r/Runner5, empezar ahora](https://www.reddit.com/r/Runner5/comments/1d171th/would_you_start_zombies_run_now/)).
- Depende de GPS, música del teléfono y, en la práctica, de conexión y de una suscripción para el archivo completo.

**Patrón para Poder Fitness.** El arco de cuatro semanas es la “misión”: tiene nombre, una semana más exigente y una semana de descarga que se siente como cierre, no como castigo. No hay audio narrativo, mapa ni GPS. La recompensa de la sesión es el poder ganado y, cuando toca, el rango. La narrativa cabe en cuatro frases de interfaz, no en un episodio.

## Habitica

**Qué es.** Hábitos, diarias y tareas con XP, oro, equipo y misiones. El esfuerzo real sube de nivel al personaje ([reseña de Lifehacker](https://lifehacker.com/tech/habitica-productivity-app-review)).

**Qué hace bien.**

- Separar lo diario, lo positivo/negativo y lo puntual. El XP sale de hacer la cosa, y las tareas difíciles pagan más.
- La racha y el color de “esto se está poniendo rojo” motivan a gente a la que el disfraz de juego no le importa ([r/habitica, 2025](https://www.reddit.com/r/habitica/comments/1jdarmo/is_habitica_still_effective_how_do_you_use_it_in/)).

**De qué se quejan.**

- A las pocas semanas el juego se repite: otro nivel, otro aspecto, y se acaba el contenido ([el mismo hilo](https://www.reddit.com/r/habitica/comments/1jdarmo/is_habitica_still_effective_how_do_you_use_it_in/)).
- La configuración es confusa (una diaria “1 vez por semana” frente a “cada 7 días”). Falta un calendario; la racha numérica no basta para ver el mes ([feedback de 110 días](https://www.reddit.com/r/habitica/comments/1h7ww0d/my_110_days_feedback/)).
- Se puede ganar XP sin hacer la tarea, o marcarla hecha por la recompensa y no hacerla. La culpa de ese autoengaño hace abandonar ([r/adhdwomen](https://www.reddit.com/r/adhdwomen/comments/1he75qh/does_anyone_have_any_experience_with_habitica/)).
- Los logros no dan nada útil. Las gemas y los cosméticos de pago vacían el motivo para ser constante ([r/habitica, “love this app, but”](https://www.reddit.com/r/habitica/comments/1gczx6c/love_this_app_but/)).
- Lifehacker señala actualizaciones lentas y las mejores piezas detrás de pago.

**Patrón para Poder Fitness.** El XP solo sale de series, distancia y retos registrados, con un techo por sesión y por día para que inflar el diario no sea el juego. No hay puntos de vida que bajen, ni oro, ni tienda. El calendario del historial cubre el hueco que la racha numérica no cubre. Los rangos son pocos y están atados al nivel, con una animación de desbloqueo que se puede saltar. Los logros son una lista corta, con un XP único, y se pueden leer sin pagar nada porque no hay pago.

## Apps de fitness RPG y de temática anime

No hay una sola app llamada “Fitness RPG” que domine la categoría. Las que cubren el encargo, con reseñas públicas, son estas.

### LEVELING: Fitness

Ficha: [App Store](https://apps.apple.com/gb/app/leveling-fitness/id6624294081). Reseñas: [listado](https://apps.apple.com/us/app/leveling-fitness/id6624294081?see-all=reviews).

Hace bien el bucle diario (misión, quest urgente, animación para ver el gesto) y engancha a quien quiere el marco de “subir de nivel”. Las quejas que se repiten:

- Anuncios entre series que rompen la concentración. Hay quien acelera el temporizador para no verlos y luego la app le acusa de hacer trampa.
- Mantenimiento que impide entrenar y al día siguiente penaliza el día perdido.
- A partir de cierto nivel, las mismas sesiones con más repeticiones. Contenido bloqueado.
- No funciona bien sin datos. Los días de entreno no se cambian sin crear otra cuenta.
- El reparto de XP del primer día se percibe como injusto.

### Arise

Ficha: [Google Play](https://play.google.com/store/apps/details?hl=en_US&id=llc.sololeveling.Arise).

Plan personal y misiones con estética de anime. Quejas en la ficha: está pensada para gimnasio con máquinas; el nivel más suave sigue siendo demasiado duro para volver después de un parón; el descanso se para con la pantalla apagada; regenerar la misión no hace nada; no hay versión de calistenia del mismo día.

### Level UP: Fitness

Fichas: [Play](https://play.google.com/store/apps/details?hl=en_US&id=com.DreamForgeEntertainment.LevelUP), [reseñas agregadas 2026](https://justuseapp.com/en/app/6499099763/level-up-fitness/reviews), [WorldsApps](https://worldsapps.com/reviews-level-up-fitness).

Hace bien la fantasía de mazmorra, equipo y título. Las reseñas hablan de progreso borrado tras una actualización o un login, botones que no compran, cuentas que no entran, y un reto diario de flexiones, abdominales y sentadillas que se infla por encima de lo que la persona marcó y no se puede bajar sin una moneda premium. Una reseña pide poder mover el progreso entre dispositivos y se encuentra con que el login crea una partida nueva.

### Level Up: Anime Workout RPG

Ficha: [Play](https://play.google.com/store/apps/details?hl=en_IN&id=com.demo.leveluprpg). Promete clase, XP por cualquier actividad, rachas, rutinas y **funcionamiento offline sin cuenta**. Es el más cercano al encargo en restricciones. No hay un cuerpo de reseñas largo todavía; la ficha ya avisa de anuncios en el tramo gratuito y de mejoras de pago.

### Fitscape y Walking RPG

[Fitscape](https://apps.apple.com/us/app/fitscape-fitness-rpg-quests/id1602746868?see-all=reviews) promete un mundo compartido. A las tres semanas un reseñador no había visto a otro jugador, las misiones quedan separadas por varios niveles, y sin reloj compatible el personaje no sube. [Walking RPG](https://apps.apple.com/us/app/walking-rpg-hero-health-game/id1252580641?see-all=reviews) premia más los recados dentro de la app que andar o correr de más: por encima de un tope de pasos, el esfuerzo extra no cambia la progresión.

### FitHero y QuestFit

FitHero es un registro de gimnasio competente (vídeo, 1RM, calendario, backup, modo oscuro), con el nombre de “héroe” y sin el bucle de rango ([Play](https://play.google.com/store/apps/details?id=com.fnp.fithero&hl=en_US)). QuestFit, en itch.io, ata clases y regiones a entrenos reales, con rachas y guardado local, sin anuncios ([QuestFit](https://specoprecon.itch.io/questfit)). Otro QuestFit de hackathon usa la cámara para contar repeticiones ([repo](https://github.com/stran1023/questfit)); eso queda fuera por el veto a permisos.

**Patrón para Poder Fitness.** El rango y el arco se ven en la primera semana, sin anuncio y sin servidor que pueda borrar la partida. El reto grande (100 / 100 / 100 / 10 km) es un logro, no la cuota del día 1. La cuota diaria baja con el nivel de poder y se puede registrar a trozos. El descanso usa un instante de fin (`endsAt`) para que un pantallazo no lo deje en cero. No hay anti-trampas: es una app de una persona, en su máquina.

## Evidencia que fija las reglas de entrenamiento

Estas fuentes deciden números de la spec. No son “inspiración”.

- **Fuerza.** Cargas altas, en torno al 80 % del 1RM, 2–3 series por ejercicio, mejoran la fuerza. **Hipertrofia.** Hay relación dosis-respuesta a partir de unas 10 series semanales por grupo muscular. **Potencia.** 30–70 % del 1RM movido rápido. El entrenamiento con el propio cuerpo y con bandas también funciona. La adherencia manda: un plan que no se puede sostener no sirve ([ACSM, actualización 2026 del posicionamiento de fuerza](https://acsm.org/resistance-training-guidelines-update-2026/); [diapositivas del posicionamiento](https://www.acsm.org/wp-content/uploads/2026/03/Pronouncement-ppt-deck_resistance-training-ps.pdf)).
- **Cómo subir el peso.** Cuando en dos sesiones seguidas se superan en 1–2 repeticiones el rango previsto, la carga sube un 2–10 %. Los músculos pequeños suben un porcentaje menor ([posicionamiento ACSM 2009, PDF](https://acsm.org/wp-content/uploads/2025/01/Progression-Models-in-Resistance-Training-for-Healthy-Adults.pdf)). La spec convierte eso en doble progresión dentro de un rango, con incrementos fijos en kg, que es lo que una persona puede cargar de verdad en una barra o una mancuerna.
- **1RM estimado.** Epley: `peso × (1 + repeticiones / 30)`. Brzycki: `peso × 36 / (37 − repeticiones)`. Por encima de 10 repeticiones las fórmulas se desvían. El número de producto es Epley, redondeado a un decimal, solo con series de trabajo de 1 a 10 repeticiones ([resumen de uso de las fórmulas](https://winsport.uk/articles/1rm-percentage-chart-training)).
- **Rangos prácticos.** Fuerza en repeticiones bajas y descanso largo; hipertrofia en un rango medio (la revisión de Schoenfeld, Grgic y colaboradores recuerda que la hipertrofia también ocurre fuera del “8–12”, siempre que la serie se acerque al esfuerzo) ([PMC7927075](https://pmc.ncbi.nlm.nih.gov/articles/PMC7927075/)). La spec igual elige un rango por objetivo para que el generador sea testeable, y lo declara como prescripción de producto, no como la única zona posible.
- **Mesociclo.** En hipertrofia, progresar algo de peso, de repeticiones y de series durante 4–8 semanas y luego descargar está alineado con la práctica que revisa el Strength & Conditioning Journal ([Israetel et al., 2020](https://journals.lww.com/nsca-scj/fulltext/2020/10000/mesocycle_progression_in_hypertrophy__volume.2.aspx)). La spec fija arcos de 4 semanas con la cuarta de descarga.
- **Volumen semanal.** Schoenfeld y colaboradores describieron más hipertrofia a mayor volumen semanal, con un uso habitual del tramo de unas 10 series por grupo como referencia práctica, y rendimientos decrecientes cuando el volumen se dispara ([citado en la guía de porcentajes de 1RM](https://winsport.uk/articles/1rm-percentage-chart-training)). El generador apunta a ese orden de magnitud en hipertrofia y no persigue agotar al principiante.

## Evidencia que fija la racha

- Una racha intacta, cuando se muestra, aumenta la probabilidad de repetir la conducta. Una racha rota la reduce, aunque el historial real sea el mismo ([Silverman y Barasch, Journal of Consumer Research](https://www.jackiesilverman.com/_files/ugd/0399b5_58713e2052ca4148891dbb00b30a8597.pdf)).
- Perder la racha desmotiva, y un poco de margen (“streak freeze”) ayuda a seguir. Duolingo documenta que poder equipar dos congelaciones subió un 0,38 % los activos diarios, y cita trabajo de la Universidad de Pensilvania y UCLA sobre dar holgura en la meta ([blog de Duolingo](https://blog.duolingo.com/how-duolingo-streak-builds-habit/)).
- Formar un hábito lleva del orden de dos meses de media (66 días en el estudio de Lally y colaboradores, UCL) y saltarse una ocasión no lo deshace por sí solo ([European Journal of Social Psychology, 2010](https://onlinelibrary.wiley.com/doi/10.1002/ejsp.674)).
- En fitness, una racha diaria de gimnasio castiga el descanso, que es parte del plan. Encaja mejor una racha **semanal** (¿cumpliste los días que elegiste?) y, para el reto pequeño de cada día, una racha diaria con un escudo.

Poder Fitness no manda notificaciones para “salvar la racha”: el encargo lo prohíbe. El escudo y la racha semanal son la holgura, visibles dentro de la app cuando la persona vuelve.

## Restricciones técnicas que la investigación no puede aflojar

- Sin cuenta, la durabilidad es local. IndexedDB guarda datos estructurados; la caché del service worker guarda el cascarón y los archivos. [web.dev, datos offline](https://web.dev/learn/pwa/offline-data). Pedir almacenamiento persistente puede mostrar un permiso en Firefox. La spec prohíbe esa llamada. El seguro es el JSON de exportación.
- El audio del descanso puede ser un oscilador de Web Audio, sin archivo y sin permiso de micrófono. El contexto de audio arranca en un gesto (el botón de empezar), porque si no el navegador lo deja suspendido ([MDN, OscillatorNode](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode); [MDN, secuenciación y autoplay](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques)).
- La PWA se empaqueta con el plugin de Vite, manifiesto y service worker de Workbox ([guía de vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa/blob/main/docs/guide/index.md)).
- La base candidata, [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (Unlicense), trae 876 ejercicios en `dist/exercises.json` a fecha de este corte. El esquema público exige `id`, `name`, `level`, `mechanic`, `equipment`, `primaryMuscles`, `secondaryMuscles`, `instructions`, `category`, `images`. `force`, `mechanic` y `equipment` pueden ser `null` ([schema.json](https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/schema.json)). Las instrucciones están en inglés. La spec traduce los enums en la interfaz y exige ficha en español solo para el pool del plan.

## Prioridad de producto

La columna sale de cruzar el encargo con las quejas de arriba. **Must** entra en la primera versión. **Should** está especificado para no rediseñar el modelo, y se hace si el must ya pasa los tests. **Later** no se construye ahora.

### Must

| Feature | Por qué |
| --- | --- |
| Onboarding corto: nombre, nivel, objetivo, equipo, días y qué días de la semana | Fitbod demuestra que un generador sin esas restricciones produce sesiones inútiles. NTC demuestra que elegir el día concreto ayuda a cumplir. |
| Plan semanal determinista y arco de 4 semanas con descarga | Cubre el vacío inicial sin la opacidad de Fitbod. El arco da el “qué toca la semana que viene” de Zombies, Run! |
| Constructor de rutinas propias | Quien no se fía del generador se queda igual, que es como acaban usando Fitbod los usuarios largos. |
| Biblioteca con búsqueda, filtros y ficha (imagen, pasos, músculos, equipo) | JEFIT y NTC: sin vista previa, la sesión se elige a ciegas. |
| Reproductor de una pantalla: series, reps, peso, última vez, sustituir, saltar | Hevy y Strong. Es el uso con el antebrazo congestionado. |
| Descanso con reloj de pared y sonido Web Audio, volumen incluido el cero | Strong v6 rompió los descansos. Arise los pierde con la pantalla apagada. El sonido no puede pedir permiso. |
| Guardar cada serie antes de seguir | Hevy, Strong y Level UP pierden datos. Aquí no hay servidor que lo restaure. |
| Resumen con poder ganado, desglosado | Cierra el bucle de Habitica (recompensa al momento) sin tienda. |
| XP, nivel, rangos con desbloqueo, logros | Es el homenaje. LEVELING demuestra que el marco engancha y que los anuncios y los bloqueos lo rompen. |
| Racha semanal de entreno y racha diaria del reto con un escudo | La evidencia de rachas y de hábitos. El descanso planificado no es un fallo. |
| Reto del héroe con registro parcial, historial y cuota según nivel; el 100/100/100/10 km es un logro | Level UP encierra a la gente en el reto completo y detrás de una moneda. |
| Calendario, volumen, récords, 1RM, peso corporal | Strong, Hevy, FitHero. Habitica se queda corta sin calendario. |
| kg/lb con conversión real, intensidad visual, borrado, exportar e importar JSON | El bug de unidades de JEFIT y la pérdida de partidas en las RPG. |
| PWA instalable y offline, sin permisos | El gimnasio tiene mala cobertura. LEVELING ya recibe esa queja. |
| Vista previa de la sesión antes de empezar | La queja más clara de la era “clase” de NTC. |
| Estados vacíos, accesibilidad y rendimiento de la pantalla de entreno | Las quejas de lag de Hevy y de UI inconsistente de NTC. Una app de una persona se juzga por cómo se siente al tercer mes. |

### Should

| Feature | Por qué no es must |
| --- | --- |
| Superseries en el constructor, usando `groupId` | Strong las tiene y sus usuarios las defienden. El generador automático no las necesita para ser coherente. |
| Nota corta por ejercicio dentro de la sesión | Hevy demuestra que la nota importa y que perderla duele. Cabe en el mismo guardado. Si el tiempo aprieta, la nota es lo primero que se recorta de la UI, no el guardado del modelo. |
| Series de calentamiento sugeridas en el primer básico, borrables | Strong las separa de las métricas. Sugerirlas ahorra pensar; obligarlas estorba. |
| Duplicar una sesión pasada como entreno de hoy | FitHero y Strong lo usan cuando el plan no toca. |
| Overlay en español para ejercicios de la biblioteca fuera del pool | La base está en inglés. El pool del plan ya va en español. El resto puede esperar un archivo de traducción sin cambiar la UI. |

### Later

| Feature | Por qué espera |
| --- | --- |
| Calculadora de discos | Útil en Strong. No cambia la adherencia si el peso ya está anotado. |
| RPE o RIR | Añade un campo que el registro rápido no puede pagar todavía. |
| Gráfico de volumen por músculo más fino que el mapa de la spec | JEFIT lo pide. La base libre no trae esos 30 grupos con fiabilidad. |
| Compartir el JSON por un botón del sistema | Sigue siendo un archivo local. No hace falta en el primer corte. |
| Modo claro | La identidad pedida es oscura. Un segundo tema duplica el trabajo visual. |
| Wearables, salud del sistema, GPS, cámara, notificaciones | Chocan con el encargo o con las quejas de sync. |
| Cuenta, feed, ranking mundial, tienda, anuncios, suscripción | Son el motivo por el que la gente deja las RPG de fitness. |
| Generación por modelo de lenguaje | Fitbod ya enseñó el coste de una sugerencia que no se puede explicar. |

## Qué lleva la spec, en una frase

Poder Fitness se comporta como un cuaderno de gimnasio tan rápido como Strong, con la biblioteca y la vista previa que a Nike Training Club le quitaron, con un plan de cuatro semanas que se puede explicar, y con un rango que sube por entrenar. No hay nada que comprar, nadie a quien comparar, y ningún servidor que pueda perder la partida.
