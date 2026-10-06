import { writeFileSync } from 'node:fs'

const pasos = {
  Barbell_Full_Squat: [
    'Apoya la barra sobre la espalda alta y da un paso atrás.',
    'Baja hasta que el muslo pase la horizontal si tu movilidad lo permite.',
    'Sube empujando el suelo, con las rodillas siguiendo la punta de los pies.',
  ],
  Goblet_Squat: [
    'Sujeta una mancuerna contra el pecho.',
    'Siéntate entre las caderas, talones quietos.',
    'Ponte de pie sin echar el tronco hacia atrás.',
  ],
  Dumbbell_Squat: [
    'Mancuernas a los lados.',
    'Baja con el pecho abierto.',
    'Sube hasta extender caderas y rodillas.',
  ],
  Leg_Press: [
    'Pies a la anchura de la cadera en la plataforma.',
    'Baja sin despegar la zona lumbar del respaldo.',
    'Empuja sin bloquear las rodillas con un golpe.',
  ],
  Bodyweight_Squat: [
    'Pies firmes, brazos al frente si te ayudan a equilibrar.',
    'Baja y sube con el mismo ritmo.',
    'Las rodillas no se cierran hacia dentro.',
  ],
  Barbell_Deadlift: [
    'La barra sobre el medio del pie, cadera atrás, espalda neutra.',
    'Empuja el suelo y lleva la barra pegada a las piernas.',
    'Al bajar, la barra vuelve por el mismo camino.',
  ],
  Romanian_Deadlift: [
    'Rodillas casi quietas, cadera atrás, barra cerca del muslo.',
    'Baja hasta notar el isquio, sin redondear la espalda.',
    'Vuelve a extender la cadera.',
  ],
  'Stiff-Legged_Dumbbell_Deadlift': [
    'Igual que el rumano, mancuernas junto a las piernas.',
    'La espalda se mantiene neutra.',
    'Cierras de pie, glúteos activos.',
  ],
  'One-Arm_Kettlebell_Swings': [
    'El impulso sale de la cadera, no del hombro.',
    'El brazo acompaña hasta la altura del pecho.',
    'Dejas caer la kettlebell hacia atrás entre las piernas con la espalda neutra.',
  ],
  Single_Leg_Glute_Bridge: [
    'Tumbado, un pie apoyado, la otra pierna estirada.',
    'Sube la cadera hasta alinear hombro, cadera y rodilla.',
    'Baja sin perder el contacto del hombro con el suelo.',
  ],
  'Barbell_Bench_Press_-_Medium_Grip': [
    'Escápulas juntas, pies en el suelo.',
    'Baja la barra al pecho medio.',
    'Empuja hacia arriba con una leve diagonal hacia la cara.',
  ],
  Dumbbell_Bench_Press: [
    'Las mancuernas bajan a los lados del pecho.',
    'Empujas hasta dejar los brazos extendidos sobre los hombros.',
    'No chocas las mancuernas a propósito.',
  ],
  Pushups: [
    'Manos bajo los hombros, cuerpo en una línea.',
    'El pecho se acerca al suelo.',
    'Empujas hasta arriba sin perder la línea.',
  ],
  'Decline_Push-Up': [
    'Pies en un escalón, manos en el suelo.',
    'El mismo recorrido de la flexión.',
    'Cuanto más alto el pie, más peso recibe el torso.',
  ],
  'Incline_Push-Up': [
    'Manos en un banco o un escalón.',
    'Cuerpo en línea.',
    'Baja y sube el pecho hacia el apoyo.',
  ],
  Bent_Over_Barbell_Row: [
    'Tronco cerca de la horizontal, barra hacia el ombligo.',
    'Aprietas la espalda al llegar.',
    'Bajas la barra sin soltar la tensión.',
  ],
  'Bent_Over_Two-Dumbbell_Row': [
    'Una mano y una rodilla en el banco, o las dos mancuernas con el tronco inclinado.',
    'Llevas la mancuerna hacia la cadera.',
    'Bajas despacio.',
  ],
  Seated_Cable_Rows: [
    'Sentado, pecho abierto, tiras del agarre hacia el abdomen.',
    'Los hombros no suben a las orejas.',
    'Vuelves sin dejar caer la pila de pesos.',
  ],
  Inverted_Row: [
    'Cuerpo bajo una mesa firme o una barra baja, talones apoyados.',
    'Tiras del pecho hacia el apoyo.',
    'Bajas hasta estirar los brazos.',
  ],
  Standing_Military_Press: [
    'Barra desde la parte alta del pecho, abdominal firme.',
    'Empujas en vertical sin arquear de más la lumbar.',
    'Bajas a la clavícula con control.',
  ],
  Dumbbell_Shoulder_Press: [
    'De pie, mancuernas a la altura de las orejas.',
    'Empujas hasta arriba.',
    'Bajas hasta que el codo quede cerca de noventa grados.',
  ],
  Seated_Dumbbell_Press: [
    'Espalda contra el banco, pies en el suelo.',
    'El mismo recorrido.',
    'No separas la espalda del banco para ayudar.',
  ],
  Pullups: [
    'Agarre prono, cuerpo estable.',
    'Tiras hasta que la barbilla supere la barra.',
    'Bajas hasta casi estirar los brazos.',
  ],
  'Chin-Up': [
    'Agarre supino, a la anchura de los hombros.',
    'Tiras con los codos hacia el suelo.',
    'Bajas del todo, sin un tirón al final.',
  ],
  'Close-Grip_Front_Lat_Pulldown': [
    'Agarre a la anchura de los hombros, tiras hacia la parte alta del pecho.',
    'El tronco se echa atrás solo un poco.',
    'Subes sin encoger los hombros.',
  ],
  Barbell_Hip_Thrust: [
    'Espalda alta en el banco, barra sobre la cadera protegida.',
    'Empujas la cadera hasta extenderla.',
    'Bajas sin rebotar en el suelo.',
  ],
  Glute_Kickback: [
    'A cuatro patas, extiendes la cadera con la rodilla flexionada.',
    'El movimiento es corto y atrás, no hacia el techo con la lumbar.',
    'Vuelves sin perder el apoyo de las manos.',
  ],
  Dumbbell_Lunges: [
    'Das un paso largo, la rodilla de atrás se acerca al suelo.',
    'El tronco sigue erguido.',
    'Empujas para volver.',
  ],
  Bodyweight_Walking_Lunge: [
    'El mismo paso, manos en la cadera si quieres.',
    'Cada repetición es un paso.',
    'El pie de delante no se despega de talón.',
  ],
  Leg_Extensions: [
    'Ajustas el rodillo sobre los tobillos.',
    'Extiendes las rodillas sin levantar el muslo del asiento.',
    'Bajas sin soltar el peso.',
  ],
  Lying_Leg_Curls: [
    'Rodillo sobre los talones.',
    'Flexionas las rodillas llevando los talones hacia el glúteo.',
    'Bajas lento.',
  ],
  Dumbbell_Flyes: [
    'En el banco, ligera flexión de codos fija.',
    'Abres hasta notar el pecho.',
    'Cierras sin chocar las mancuernas.',
  ],
  Bench_Dips: [
    'Manos en el borde, pies delante.',
    'Bajas los codos hacia atrás.',
    'Subes sin encoger los hombros.',
  ],
  Triceps_Pushdown: [
    'Codos quietos al lado del tronco.',
    'Extiendes hacia abajo.',
    'Vuelves hasta unos noventa grados.',
  ],
  'Push-Ups_-_Close_Triceps_Position': [
    'Manos más juntas que en la flexión, codos cerca del cuerpo.',
    'Bajas el cuerpo en bloque.',
    'Empujas hasta arriba.',
  ],
  'Dumbbell_One-Arm_Triceps_Extension': [
    'Un brazo arriba, codo apuntando al techo.',
    'Bajas la mancuerna por detrás de la cabeza.',
    'Extiendes sin mover el codo de sitio.',
  ],
  Face_Pull: [
    'Polea alta, cuerda hacia la cara, codos altos.',
    'Separas las manos al llegar.',
    'Vuelves sin perder la postura del pecho.',
  ],
  Band_Pull_Apart: [
    'Banda al frente, brazos estirados.',
    'Abres hasta que las manos queden a los lados.',
    'Vuelves sin que la banda te arrastre.',
  ],
  Hammer_Curls: [
    'Mancuernas con el pulgar hacia arriba.',
    'Flexionas el codo.',
    'Bajas del todo.',
  ],
  Barbell_Curl: [
    'Codos quietos, barra hacia los hombros.',
    'No te echas atrás para pasar el punto difícil.',
    'Bajas controlando.',
  ],
  Side_Lateral_Raise: [
    'Mancuernas a los lados, un poco de flexión en el codo.',
    'Subes hasta la altura del hombro.',
    'Bajas sin balancear el tronco.',
  ],
  'Lateral_Raise_-_With_Bands': [
    'Un pie sobre la banda.',
    'El mismo recorrido lateral.',
    'La muñeca se queda neutra.',
  ],
  Rocking_Standing_Calf_Raise: [
    'Barra sobre la espalda, pies en un escalón si lo tienes.',
    'Subes a la punta.',
    'Bajas el talón por debajo del escalón si hay recorrido.',
  ],
  Calf_Raise_On_A_Dumbbell: [
    'Una mancuerna en una mano y la otra en un apoyo.',
    'Subes y bajas un pie cada vez.',
    'El movimiento es de tobillo, no de rodilla.',
  ],
  Seated_Calf_Raise: [
    'Rodillas bajo las almohadillas.',
    'Empujas con la punta del pie.',
    'Bajas hasta estirar el gemelo.',
  ],
  'Calf_Raises_-_With_Bands': [
    'La banda pisa bajo el antepié y la sujetas con las manos.',
    'Empujas la punta.',
    'Vuelves despacio.',
  ],
  Plank: [
    'Antebrazos bajo los hombros, cuerpo en línea desde la cabeza a los talones.',
    'Aprietas abdomen y glúteo.',
    'Respiras sin dejar caer la cadera. El tiempo manda, no las repeticiones.',
  ],
  Reverse_Crunch: [
    'Tumbado, rodillas flexionadas.',
    'Llevas las rodillas hacia el pecho despegando la cadera.',
    'Bajas sin arquear la lumbar de un golpe.',
  ],
  'Sit-Up': [
    'Tumbado, pies firmes.',
    'Subes la caja torácica hacia la pelvis.',
    'Bajas un vértebra a vértebra, sin tirar del cuello con las manos.',
  ],
  Cable_Crunch: [
    'De rodillas, la cuerda junto a la cara.',
    'Flexionas el tronco hacia abajo.',
    'Vuelves sin sentarte sobre los talones.',
  ],
  Air_Bike: [
    'Espalda en el suelo, un codo busca la rodilla contraria mientras la otra pierna se estira.',
    'Alternas sin tirar del cuello.',
    'Cada lado es una repetición.',
  ],
  Mountain_Climbers: [
    'En posición de flexión, llevas una rodilla hacia el pecho y cambias.',
    'La cadera no sube en balancín.',
    'El ritmo es el que puedas sostener con la espalda neutra.',
  ],
}

const rows = [
  ['Barbell_Full_Squat', 'Sentadilla con barra', ['sentadilla'], true, 'reps_peso', ['barra'], 'piernas'],
  ['Goblet_Squat', 'Sentadilla en copa', ['sentadilla'], true, 'reps_peso', ['mancuernas'], 'piernas'],
  ['Dumbbell_Squat', 'Sentadilla con mancuernas', ['sentadilla'], true, 'reps_peso', ['mancuernas'], 'piernas'],
  ['Leg_Press', 'Prensa de piernas', ['sentadilla'], true, 'reps_peso', ['maquinas'], 'piernas'],
  ['Bodyweight_Squat', 'Sentadilla', ['sentadilla'], true, 'reps_peso', ['cuerpo'], 'piernas'],
  ['Barbell_Deadlift', 'Peso muerto', ['bisagra'], true, 'reps_peso', ['barra'], 'espalda'],
  ['Romanian_Deadlift', 'Peso muerto rumano', ['bisagra'], true, 'reps_peso', ['barra'], 'piernas'],
  ['Stiff-Legged_Dumbbell_Deadlift', 'Peso muerto con mancuernas', ['bisagra'], true, 'reps_peso', ['mancuernas'], 'piernas'],
  ['One-Arm_Kettlebell_Swings', 'Balanceo con kettlebell', ['bisagra'], true, 'reps_peso', ['kettlebell'], 'piernas'],
  ['Single_Leg_Glute_Bridge', 'Puente a una pierna', ['bisagra', 'gluteo'], true, 'reps_peso', ['cuerpo'], 'gluteos'],
  ['Barbell_Bench_Press_-_Medium_Grip', 'Press de banca', ['empuje_horizontal'], true, 'reps_peso', ['barra', 'banco'], 'pecho'],
  ['Dumbbell_Bench_Press', 'Press de banca con mancuernas', ['empuje_horizontal'], true, 'reps_peso', ['mancuernas', 'banco'], 'pecho'],
  ['Pushups', 'Flexión', ['empuje_horizontal'], true, 'reps_peso', ['cuerpo'], 'pecho'],
  ['Decline_Push-Up', 'Flexión con pies altos', ['empuje_horizontal'], true, 'reps_peso', ['cuerpo'], 'pecho'],
  ['Incline_Push-Up', 'Flexión con manos altas', ['empuje_horizontal'], true, 'reps_peso', ['cuerpo'], 'pecho'],
  ['Bent_Over_Barbell_Row', 'Remo con barra', ['tiron_horizontal'], true, 'reps_peso', ['barra'], 'espalda'],
  ['Bent_Over_Two-Dumbbell_Row', 'Remo con mancuernas', ['tiron_horizontal'], true, 'reps_peso', ['mancuernas'], 'espalda'],
  ['Seated_Cable_Rows', 'Remo en polea', ['tiron_horizontal'], true, 'reps_peso', ['poleas'], 'espalda'],
  ['Inverted_Row', 'Remo invertido', ['tiron_horizontal'], true, 'reps_peso', ['cuerpo'], 'espalda'],
  ['Standing_Military_Press', 'Press militar', ['empuje_vertical'], true, 'reps_peso', ['barra'], 'hombros'],
  ['Dumbbell_Shoulder_Press', 'Press de hombros con mancuernas', ['empuje_vertical'], true, 'reps_peso', ['mancuernas'], 'hombros'],
  ['Seated_Dumbbell_Press', 'Press de hombros sentado', ['empuje_vertical'], true, 'reps_peso', ['mancuernas', 'banco'], 'hombros'],
  ['Pullups', 'Dominada', ['tiron_vertical'], true, 'reps_peso', ['dominadas'], 'espalda'],
  ['Chin-Up', 'Dominada supina', ['tiron_vertical'], true, 'reps_peso', ['dominadas'], 'espalda'],
  ['Close-Grip_Front_Lat_Pulldown', 'Jalón al pecho', ['tiron_vertical'], true, 'reps_peso', ['poleas'], 'espalda'],
  ['Barbell_Hip_Thrust', 'Empuje de cadera', ['gluteo'], true, 'reps_peso', ['barra', 'banco'], 'gluteos'],
  ['Glute_Kickback', 'Patada de glúteo', ['gluteo'], false, 'reps_peso', ['cuerpo'], 'gluteos'],
  ['Dumbbell_Lunges', 'Zancada con mancuernas', ['unilateral'], true, 'reps_peso', ['mancuernas'], 'piernas'],
  ['Bodyweight_Walking_Lunge', 'Zancada', ['unilateral'], true, 'reps_peso', ['cuerpo'], 'piernas'],
  ['Leg_Extensions', 'Extensión de piernas', ['unilateral'], false, 'reps_peso', ['maquinas'], 'piernas'],
  ['Lying_Leg_Curls', 'Curl femoral tumbado', ['unilateral'], false, 'reps_peso', ['maquinas'], 'piernas'],
  ['Dumbbell_Flyes', 'Apertura con mancuernas', ['accesorio_empuje'], false, 'reps_peso', ['mancuernas', 'banco'], 'pecho'],
  ['Bench_Dips', 'Fondo en banco', ['accesorio_empuje'], true, 'reps_peso', ['cuerpo'], 'brazos'],
  ['Triceps_Pushdown', 'Extensión de tríceps en polea', ['accesorio_empuje'], false, 'reps_peso', ['poleas'], 'brazos'],
  ['Push-Ups_-_Close_Triceps_Position', 'Flexión cerrada', ['accesorio_empuje'], true, 'reps_peso', ['cuerpo'], 'brazos'],
  ['Dumbbell_One-Arm_Triceps_Extension', 'Extensión de tríceps con mancuerna', ['accesorio_empuje'], false, 'reps_peso', ['mancuernas'], 'brazos'],
  ['Face_Pull', 'Tirón a la cara', ['accesorio_tiron'], false, 'reps_peso', ['poleas'], 'hombros'],
  ['Band_Pull_Apart', 'Apertura con banda', ['accesorio_tiron'], false, 'reps_peso', ['bandas'], 'hombros'],
  ['Hammer_Curls', 'Curl martillo', ['accesorio_tiron'], false, 'reps_peso', ['mancuernas'], 'brazos'],
  ['Barbell_Curl', 'Curl con barra', ['accesorio_tiron'], false, 'reps_peso', ['barra'], 'brazos'],
  ['Side_Lateral_Raise', 'Elevación lateral', ['hombro'], false, 'reps_peso', ['mancuernas'], 'hombros'],
  ['Lateral_Raise_-_With_Bands', 'Elevación lateral con banda', ['hombro'], false, 'reps_peso', ['bandas'], 'hombros'],
  ['Rocking_Standing_Calf_Raise', 'Gemelo de pie con barra', ['pantorrilla'], false, 'reps_peso', ['barra'], 'pantorrillas'],
  ['Calf_Raise_On_A_Dumbbell', 'Gemelo con mancuerna', ['pantorrilla'], false, 'reps_peso', ['mancuernas'], 'pantorrillas'],
  ['Seated_Calf_Raise', 'Gemelo sentado', ['pantorrilla'], false, 'reps_peso', ['maquinas'], 'pantorrillas'],
  ['Calf_Raises_-_With_Bands', 'Gemelo con banda', ['pantorrilla'], false, 'reps_peso', ['bandas'], 'pantorrillas'],
  ['Plank', 'Plancha', ['core'], false, 'tiempo', ['cuerpo'], 'core'],
  ['Reverse_Crunch', 'Encogimiento inverso', ['core'], false, 'reps_peso', ['cuerpo'], 'core'],
  ['Sit-Up', 'Abdominal', ['core'], false, 'reps_peso', ['cuerpo'], 'core'],
  ['Cable_Crunch', 'Encogimiento en polea', ['core'], false, 'reps_peso', ['poleas'], 'core'],
  ['Air_Bike', 'Bicicleta en el suelo', ['core', 'finisher'], false, 'reps_peso', ['cuerpo'], 'core'],
  ['Mountain_Climbers', 'Escalador', ['finisher'], true, 'reps_peso', ['cuerpo'], 'core'],
]

const pool = rows.map(([id, nombre, roles, compound, logging, equipo, muscleGroup]) => {
  const steps = pasos[id]
  if (!steps || steps.length !== 3) throw new Error(`pasos ${id}`)
  return { id, nombre, pasos: steps, roles, compound, logging, equipo, muscleGroup }
})

writeFileSync('data/exercises/plan-pool.es.json', `${JSON.stringify(pool, null, 2)}\n`)
console.log('pool', pool.length)
