import type { Equipment, Exercise, Level, Muscle, Pattern } from './types';

function ex(
  id: string,
  nombre: string,
  patron: Pattern,
  musculo: Muscle,
  equipo: Equipment[],
  nivel: Level,
  prioridad: number,
  compuesto: boolean,
  pasos: [string, string, string],
  alias: string[] = [],
  medida: Exercise['medida'] = 'reps',
): Exercise {
  return {
    id,
    nombre,
    alias,
    patron,
    musculo,
    equipo,
    nivel,
    prioridad,
    compuesto,
    pasos,
    origen: 'semilla',
    archivado: false,
    medida,
    cuentaEnVolumen: patron !== 'movilidad',
  };
}

export const SEED_EXERCISES: Exercise[] = [
  ex('sentadilla-corporal', 'Sentadilla', 'rodilla', 'cuadriceps', ['peso-corporal'], 'principiante', 10, true, [
    'Pies a la anchura de la cadera.',
    'Baja hasta donde la espalda siga neutra y los talones no se levanten.',
    'Empuja el suelo y sube.',
  ], ['sentadilla']),
  ex('sentadilla-goblet', 'Sentadilla goblet', 'rodilla', 'cuadriceps', ['mancuernas'], 'principiante', 20, true, [
    'Sostén una mancuerna pegada al pecho.',
    'Siéntate entre las caderas y mantén el pecho abierto.',
    'Sube sin bloquear las rodillas de golpe.',
  ]),
  ex('sentadilla-trasera', 'Sentadilla trasera', 'rodilla', 'cuadriceps', ['barra'], 'intermedio', 30, true, [
    'Barra sobre los trapecios, pies firmes.',
    'Rompe la cadera y las rodillas a la vez.',
    'Sube en un solo movimiento, con la barra en equilibrio.',
  ]),
  ex('zancada', 'Zancada', 'rodilla-unilateral', 'cuadriceps', ['peso-corporal'], 'principiante', 10, true, [
    'Da un paso largo.',
    'La rodilla de atrás baja hacia el suelo sin golpearlo.',
    'Empuja con la pierna de delante para volver.',
  ]),
  ex('zancada-mancuernas', 'Zancada con mancuernas', 'rodilla-unilateral', 'cuadriceps', ['mancuernas'], 'principiante', 20, true, [
    'Igual que la zancada, con una mancuerna en cada mano y los brazos quietos.',
    'El torso no se inclina hacia el paso.',
    'Alterna las piernas.',
  ]),
  ex('sentadilla-bulgara', 'Sentadilla búlgara', 'rodilla-unilateral', 'cuadriceps', ['mancuernas', 'banco'], 'intermedio', 30, true, [
    'Empeine trasero apoyado en el banco.',
    'Baja en vertical con la pierna de delante.',
    'Sube sin que la rodilla se cierre hacia dentro.',
  ]),
  ex('puente-gluteo', 'Puente de glúteo', 'cadera', 'gluteos', ['peso-corporal'], 'principiante', 10, true, [
    'Tumbado, pies apoyados cerca de la cadera.',
    'Eleva la pelvis apretando glúteos, sin arquear la lumbar.',
    'Baja con control.',
  ]),
  ex('peso-muerto-rumano-mancuernas', 'Peso muerto rumano con mancuernas', 'cadera', 'isquiotibiales', ['mancuernas'], 'principiante', 20, true, [
    'Mancuernas delante de los muslos, rodillas ligeramente flexionadas.',
    'Lleva la cadera atrás hasta notar el femoral.',
    'Vuelve de pie cerrando glúteos.',
  ], ['peso muerto']),
  ex('peso-muerto-rumano-barra', 'Peso muerto rumano con barra', 'cadera', 'isquiotibiales', ['barra'], 'intermedio', 30, true, [
    'La barra roza los muslos en todo el recorrido.',
    'La espalda no se redondea.',
    'El movimiento sale de la cadera, no de tirar con los brazos.',
  ], ['peso muerto']),
  ex('peso-muerto', 'Peso muerto', 'cadera', 'isquiotibiales', ['barra'], 'avanzado', 40, true, [
    'Pies bajo la barra, agarre por fuera de las rodillas.',
    'Empuja el suelo y acerca la barra al cuerpo.',
    'Termina de pie, con la barra quieta, y bájala por el mismo camino.',
  ], ['peso muerto']),
  ex('flexion-pecho', 'Flexión de pecho', 'empuje-horizontal', 'pecho', ['peso-corporal'], 'principiante', 10, true, [
    'Manos un poco más abiertas que los hombros, cuerpo en bloque.',
    'Baja el pecho cerca del suelo.',
    'Empuja hasta estirar los codos sin perder el abdomen.',
  ], ['flexion']),
  ex('press-suelo-mancuernas', 'Press de suelo con mancuernas', 'empuje-horizontal', 'pecho', ['mancuernas'], 'principiante', 20, true, [
    'Tumbado en el suelo, mancuernas sobre el pecho.',
    'Baja los codos hasta que el brazo toque el suelo con suavidad.',
    'Empuja en vertical.',
  ]),
  ex('press-banca-mancuernas', 'Press banca con mancuernas', 'empuje-horizontal', 'pecho', ['mancuernas', 'banco'], 'principiante', 25, true, [
    'En el banco, pies apoyados.',
    'Baja las mancuernas a los lados del pecho.',
    'Empuja hasta dejar los brazos bajo las mancuernas, no hacia la cara.',
  ]),
  ex('press-banca-barra', 'Press banca con barra', 'empuje-horizontal', 'pecho', ['barra', 'banco'], 'intermedio', 30, true, [
    'Agarre un poco más ancho que los hombros.',
    'Baja la barra al pecho con los antebrazos verticales.',
    'Empuja hacia arriba y un poco atrás, hacia los soportes.',
  ]),
  ex('press-inclinado-mancuernas', 'Press inclinado con mancuernas', 'empuje-horizontal', 'pecho', ['mancuernas', 'banco'], 'intermedio', 40, true, [
    'Banco a unos 30 grados.',
    'Baja despacio hacia la parte alta del pecho.',
    'Empuja sin chocar las mancuernas arriba.',
  ]),
  ex('flexiones-pike', 'Flexión pike', 'empuje-vertical', 'hombros', ['peso-corporal'], 'principiante', 10, true, [
    'Caderas altas, el cuerpo en V invertida.',
    'Flexiona los codos y acerca la cabeza al suelo.',
    'Empuja para volver, mirando a los pies.',
  ]),
  ex('press-hombro-mancuernas', 'Press de hombro con mancuernas', 'empuje-vertical', 'hombros', ['mancuernas'], 'principiante', 20, true, [
    'De pie o sentado, mancuernas a la altura de la cara.',
    'Empuja hasta arriba sin arquear la lumbar.',
    'Baja hasta que los codos queden bajo las muñecas.',
  ]),
  ex('press-militar-barra', 'Press militar con barra', 'empuje-vertical', 'hombros', ['barra'], 'intermedio', 30, true, [
    'Barra en la parte delantera de los hombros.',
    'Aprieta glúteos y abdomen.',
    'Empuja en vertical y deja bajar la barra con control.',
  ]),
  ex('remo-invertido', 'Remo invertido', 'traccion-horizontal', 'espalda', ['peso-corporal'], 'principiante', 10, true, [
    'Cuerpo recto bajo una mesa firme o una barra baja.',
    'Tira del pecho hacia el apoyo.',
    'Baja sin dejar caer la cadera.',
  ]),
  ex('remo-mancuerna', 'Remo a una mano', 'traccion-horizontal', 'espalda', ['mancuernas'], 'principiante', 20, true, [
    'Una mano y una rodilla en el banco, espalda neutra.',
    'Lleva la mancuerna hacia la cadera, con el codo cerca del cuerpo.',
    'Baja hasta estirar el brazo.',
  ]),
  ex('remo-barra', 'Remo con barra', 'traccion-horizontal', 'espalda', ['barra'], 'intermedio', 30, true, [
    'Tronco inclinado, rodillas blandas, espalda neutra.',
    'Tira de la barra hacia el ombligo.',
    'Baja sin redondear.',
  ]),
  ex('dominadas-australianas', 'Dominadas australianas', 'traccion-vertical', 'espalda', ['peso-corporal'], 'principiante', 10, true, [
    'Agarre a la anchura de los hombros, cuerpo inclinado y talones en el suelo.',
    'Lleva el pecho a la barra.',
    'Baja hasta casi estirar los brazos.',
  ], ['dominada']),
  ex('jalon-pecho', 'Jalón al pecho', 'traccion-vertical', 'espalda', ['polea'], 'principiante', 20, true, [
    'Siéntate firme y agarra la barra ancha.',
    'Lleva la barra hacia la parte alta del pecho, codos hacia abajo.',
    'Deja subir sin perder la postura.',
  ]),
  ex('dominadas', 'Dominadas', 'traccion-vertical', 'espalda', ['barra-dominadas'], 'intermedio', 30, true, [
    'Cuelga con los hombros activos, no encogidos.',
    'Tira hasta que la barbilla pase la barra.',
    'Baja del todo, sin balanceo.',
  ], ['dominada']),
  ex('plancha', 'Plancha', 'core', 'abdomen', ['peso-corporal'], 'principiante', 10, false, [
    'Antebrazos bajo los hombros, cuerpo en línea.',
    'Empuja el suelo y no dejes caer la cadera.',
    'Respira sin romper la posición.',
  ], [], 'segundos'),
  ex('abdominales', 'Abdominales', 'core', 'abdomen', ['peso-corporal'], 'principiante', 20, false, [
    'Tumbado, rodillas flexionadas, lumbares pegadas al suelo.',
    'Eleva el tronco hasta que los omóplatos se separen.',
    'Baja sin soltar el abdomen de golpe.',
  ], ['abdominal']),
  ex('bicho-muerto', 'Bicho muerto', 'core', 'abdomen', ['peso-corporal'], 'principiante', 30, false, [
    'Espalda lumbar en el suelo, brazos hacia el techo.',
    'Estira una pierna y el brazo contrario sin que la lumbar se arquee.',
    'Vuelve y cambia de lado. Una repetición es un lado.',
  ]),
  ex('curl-toalla', 'Curl con toalla', 'biceps', 'biceps', ['peso-corporal'], 'principiante', 10, false, [
    'Pisa el centro de una toalla y agarra los extremos.',
    'Flexiona los codos contra la resistencia de la tela.',
    'Baja despacio.',
  ]),
  ex('curl-mancuernas', 'Curl con mancuernas', 'biceps', 'biceps', ['mancuernas'], 'principiante', 20, false, [
    'Codos quietos al lado del cuerpo.',
    'Sube las mancuernas sin balancear el tronco.',
    'Baja hasta estirar el codo con control.',
  ]),
  ex('curl-banda', 'Curl con banda', 'biceps', 'biceps', ['banda'], 'principiante', 30, false, [
    'Pisa la banda, agarra las asas.',
    'Igual que el curl con mancuernas: codo quieto.',
    'Sube y baja sin impulso.',
  ]),
  ex('fondos-suelo', 'Fondos en el suelo', 'triceps', 'triceps', ['peso-corporal'], 'principiante', 10, false, [
    'Sentado, manos detrás de la cadera, dedos hacia los pies.',
    'Flexiona los codos hacia atrás y baja un poco.',
    'Empuja hasta estirar, sin encoger los hombros.',
  ]),
  ex('extension-triceps-mancuernas', 'Extensión de tríceps', 'triceps', 'triceps', ['mancuernas'], 'principiante', 20, false, [
    'Una mancuerna con las dos manos, por detrás de la cabeza.',
    'Estira los codos sin abrirlos del todo hacia los lados.',
    'Baja detrás de la nuca.',
  ]),
  ex('fondos-banco', 'Fondos en banco', 'triceps', 'triceps', ['banco'], 'principiante', 30, false, [
    'Manos en el borde del banco, pies apoyados.',
    'Baja el cuerpo cerca del banco.',
    'Empuja hasta estirar los codos.',
  ]),
  ex('elevaciones-toalla', 'Elevaciones con toalla', 'hombro-aislamiento', 'hombros', ['peso-corporal'], 'principiante', 10, false, [
    'Pisa la toalla y sujeta los extremos con los brazos a los lados.',
    'Elévalos hasta la altura del hombro, contra la tela.',
    'Baja sin encoger el cuello.',
  ]),
  ex('elevaciones-laterales', 'Elevaciones laterales', 'hombro-aislamiento', 'hombros', ['mancuernas'], 'principiante', 20, false, [
    'Mancuernas a los lados, codos casi estirados.',
    'Sube hasta la línea del hombro, con el meñique ligeramente arriba.',
    'Baja despacio.',
  ]),
  ex('aperturas-invertidas', 'Aperturas invertidas', 'hombro-aislamiento', 'hombros', ['mancuernas'], 'principiante', 30, false, [
    'Tronco inclinado, mancuernas colgando.',
    'Abre los brazos hacia los lados, apretando la espalda alta.',
    'Vuelve sin impulso.',
  ]),
  ex('curl-femoral-deslizante', 'Curl femoral deslizante', 'femoral', 'isquiotibiales', ['peso-corporal'], 'principiante', 10, false, [
    'Tumbado, talones sobre una tela que deslice.',
    'Eleva la cadera y arrastra los talones hacia ti.',
    'Estira las piernas sin dejar caer la pelvis.',
  ]),
  ex('gemelos-de-pie', 'Gemelos de pie', 'gemelo', 'gemelos', ['peso-corporal'], 'principiante', 10, false, [
    'Punta de los pies en un pequeño escalón o en el suelo.',
    'Sube todo lo que puedas sobre los dedos.',
    'Baja hasta notar el estirón.',
  ]),
  ex('gemelos-mancuernas', 'Gemelos con mancuernas', 'gemelo', 'gemelos', ['mancuernas'], 'principiante', 20, false, [
    'Igual que los gemelos de pie, con una mancuerna en una mano y la otra en un apoyo.',
    'El movimiento es solo del tobillo.',
    'Haz las dos piernas.',
  ]),
  ex('escaladores', 'Escaladores', 'acondicionamiento', 'cuerpo-completo', ['peso-corporal'], 'principiante', 10, false, [
    'Posición de flexión.',
    'Lleva una rodilla hacia el pecho y cambia de pierna. La cadera no se eleva.',
    'Una repetición es un cambio.',
  ]),
  ex('saltos-tijera', 'Saltos de tijera', 'acondicionamiento', 'cuerpo-completo', ['peso-corporal'], 'principiante', 20, false, [
    'Salta y abre piernas y brazos a la vez.',
    'Vuelve a la posición de firmes al aterrizar.',
    'Apoya toda la planta, suave.',
  ]),
  ex('gato-camello', 'Gato-camello', 'movilidad', 'espalda', ['peso-corporal'], 'principiante', 10, false, [
    'A cuatro patas.',
    'Redondea la espalda al exhalar y ábrela al inhalar.',
    'El movimiento es lento. Una repetición es un ciclo.',
  ]),
];
