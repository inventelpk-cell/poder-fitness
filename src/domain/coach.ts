import { assertNever } from './assert';

export type CoachId = 'lino' | 'dario' | 'ciro' | 'elias' | 'teo';
export type DarioTone = 'suave' | 'brusco';
export type CoachEvent = 'empezar' | 'mitad' | 'serie' | 'salto' | 'descanso' | 'record' | 'rango' | 'racha';

export interface CoachCard {
  id: CoachId;
  name: string;
  blurb: string;
}

export const COACHES: readonly CoachCard[] = [
  { id: 'lino', name: 'Lino Vega', blurb: 'Alegre. Empuja con hambre de pelea y de comida.' },
  { id: 'dario', name: 'Darío Sanz', blurb: 'Rival borde. Quiere que ganes.' },
  { id: 'ciro', name: 'Ciro Vesper', blurb: 'Exigente. Habla poco y desde arriba.' },
  { id: 'elias', name: 'Elías Mora', blurb: 'Maestro calmado. Cada frase sirve para volver.' },
  { id: 'teo', name: 'Teo Rangel', blurb: 'Estoico. Una frase y el peso.' },
];

export const COACH_IDS: readonly CoachId[] = ['lino', 'dario', 'ciro', 'elias', 'teo'];

type Lines = Record<CoachEvent, readonly string[]>;

const LINO: Lines = {
  empezar: [
    'Hoy se come el entreno primero. El plato espera.',
    'Vamos. Cuatro ejercicios y luego hablamos de comida.',
    'Si entras, yo entro. Empieza por la primera serie.',
    'El día está bueno para levantar. No lo dejes en el banco.',
    'Una sesión corta también cuenta. Empieza.',
    'Hoy toca empuje. Yo llevo el ánimo, tú las mancuernas.',
  ],
  mitad: [
    'Mitad de serie. El ritmo es el bueno.',
    'Sigue. Esa repetición también entra en el plato.',
    'No aceleres. Baja y sube entero.',
    'Vas bien. Quedan pocas.',
    'Respira. La siguiente sale.',
    'Eso es hambre de verdad. Otra.',
  ],
  serie: [
    'Serie lista. Así se llena el día.',
    'Bien. Apunta y a la siguiente.',
    'Esa ha entrado limpia.',
    'Hecha. Descansa, que la comida no se va.',
    'Me gusta cómo ha cerrado. Otra cuando toque.',
    'Serie contada. El entreno sigue.',
  ],
  salto: [
    'Saltas este. El siguiente no se esconde.',
    'Vale, lo dejamos. No conviertas el día en un hueco.',
    'Una excusa y seguimos. El entreno no se ha acabado.',
    'Lo saltas, lo anoto, y vuelves al plan.',
    'Hoy no sale ese. Elige otro del mismo patrón.',
    'Está bien parar ese. No pares el día.',
  ],
  descanso: [
    'Descanso cerrado. A la serie.',
    'Ya está. De pie.',
    'El reloj ha llegado. Te toca.',
    'Recuperaste. Ahora empuja.',
    'Se acabó la pausa. Misma carga.',
    'Tiempo. La siguiente no se hace sola.',
  ],
  record: [
    'Récord. Hoy el plato sabe mejor.',
    'Has subido. Apúntalo, que es tuyo.',
    'Marca nueva. Yo sí me impresiono.',
    'Eso no lo habías hecho. Quédate con ello.',
    'Récord personal. El hambre tenía razón.',
    'Más peso o más reps. Cuenta igual. Bien.',
  ],
  rango: [
    'Rango nuevo. El aura ya no cabe callada.',
    'Has subido de rango. Mañana se nota en la barra.',
    'Esto es un salto de verdad. Mírate.',
    'Nuevo rango. El entreno te ha alcanzado.',
    'Ya no estás donde empezaste. Sigue.',
    'Rango arriba. Celebra y vuelve al plan.',
  ],
  racha: [
    'Ayer se quedó en blanco. Hoy se recupera con una serie.',
    'La racha paró. El entreno no.',
    'Un día perdido no borra los otros. Entra.',
    'Se rompió la cadena. La primera serie la vuelve a empezar.',
    'No te cuento el drama. Cuéntame las reps de hoy.',
    'Faltó un día. Estás a tiempo de no faltar este.',
  ],
};

const DARIO_BRUSCO: Lines = {
  empezar: [
    'Empieza. Esa pausa ya ha sido el calentamiento.',
    '¿Hoy también vas a mirar la barra antes de tocarla?',
    'Entra. Yo no entreno por ti.',
    'Primera serie. A ver si esta vez es una serie.',
    'Deja el discurso. Carga y baja.',
    'El plan está ahí. Sorpréndeme y cúmplelo.',
  ],
  mitad: [
    'Mitad. No me vendas esa repetición a medias.',
    'Sigue. Parar ahora sería muy tuyo.',
    'El rango no sube con la pausa.',
    'Otra. Y que se vea.',
    'Vas justo. No lo conviertas en un casi.',
    'Mitad de serie. Ahora se decide si cuenta.',
  ],
  serie: [
    'Serie hecha. No pidas aplauso todavía.',
    'Ha entrado. La siguiente tiene que parecerse.',
    'Menos mal. Ya parecía un borrador.',
    'Hecha. Descansa y no te crezcas.',
    'Esa sí era una serie. Repite la idea.',
    'Apuntada. A ver la que viene.',
  ],
  salto: [
    'Lo saltas. Qué solución tan pequeña.',
    'Una excusa y un ejercicio menos. El día sigue abierto.',
    'Saltas este. No saltes el entreno entero.',
    'Anotado el salto. Ahora no me cuentes por qué.',
    'Ese no sale. Elige otro y muévelo.',
    'Lo dejas. La siguiente no se negocia.',
  ],
  descanso: [
    'Descanso acabado. No negocies.',
    'Se acabó. La barra no espera tu opinión.',
    'Tiempo. Levántate.',
    'Ya recuperaste. O eso dices. A la serie.',
    'El reloj cerró. Tú también.',
    'Pausa fuera. Misma carga.',
  ],
  record: [
    'Récord. No te emociones: repítelo.',
    'Marca nueva. Ya era hora de que pasaras de ahí.',
    'Has subido. Mañana quiero la misma cifra.',
    'Récord. Apúntalo antes de que se te olvide trabajar.',
    'Bien. Una vez no es una costumbre.',
    'Más peso. Ahora no lo celebres a medias.',
  ],
  rango: [
    'Rango nuevo. Ya era hora.',
    'Has subido. No lo gastes en un discurso.',
    'Nuevo rango. El aura no tapa una serie floja.',
    'Por fin. Creía que te habías instalado ahí.',
    'Rango arriba. Mañana se demuestra.',
    'Subiste. Yo sigo sin estar impresionado del todo.',
  ],
  racha: [
    'La racha se cayó. Típico. Levántala.',
    'Ayer en blanco. Hoy no me vengas con la misma idea.',
    'Se rompió. Una serie hoy y dejas de contarlo.',
    'Perdiste el día. El calendario no se va a disculpar.',
    'Racha a cero. Empieza, que quejarse no suma.',
    'Faltaste. Estás aquí. Muévete.',
  ],
};

const DARIO_SUAVE: Lines = {
  empezar: [
    'Empieza cuando quieras. Yo estoy mirando.',
    'Hoy puedes hacerlo bien. Empieza y lo vemos.',
    'Primera serie. Sin teatro.',
    'El plan es claro. Tú pones las reps.',
    'Vamos a ello. Quiero ver la serie, no la excusa.',
    'Entra. Esta vez cuenta de verdad.',
  ],
  mitad: [
    'Mitad. No lo aflojes.',
    'Vas justo. Cierra la serie igual.',
    'Sigue con el mismo recorrido.',
    'Quedan pocas. Hazlas enteras.',
    'Bien de ritmo. No cambies ahora.',
    'Mitad limpia. La otra mitad, igual.',
  ],
  serie: [
    'Serie decente. Otra igual.',
    'Ha entrado bien. Descansa.',
    'Bien cerrada. Sin añadidos.',
    'Esa cuenta. La siguiente también.',
    'Limpia. Me vale.',
    'Hecha. Seguimos con el plan.',
  ],
  salto: [
    'Lo saltas. El plan sigue en pie.',
    'Hoy no es ese. Sustituye y sigue.',
    'Un salto no rompe la sesión. No añadas otro.',
    'Vale. El siguiente ejercicio te espera.',
    'Lo dejamos. Sin discurso.',
    'Saltado. Vuelve al patrón y elige.',
  ],
  descanso: [
    'Se acabó el descanso. Sin prisa y sin teatro.',
    'Tiempo. Vuelve a la serie.',
    'Descanso cumplido. Te toca.',
    'Ya está. Misma carga.',
    'El reloj llegó. Cuando quieras, en serio.',
    'Pausa cerrada. Siguiente serie.',
  ],
  record: [
    'Récord. Bien. Que no sea un accidente.',
    'Marca tuya. Guárdala.',
    'Has pasado tu tope. Se nota.',
    'Récord limpio. Otra día lo confirmas.',
    'Subiste. Eso sí lo respeto.',
    'Nueva marca. El trabajo se ve.',
  ],
  rango: [
    'Nuevo rango. Lo has ganado, no regalado.',
    'Has subido. Se ve en el entreno, no solo en el nombre.',
    'Rango nuevo. Sigue con la misma cabeza.',
    'Bien. Ese salto es tuyo.',
    'Has pasado de rango. Ahora no te relajes.',
    'Rango arriba. El plan de mañana sigue en pie.',
  ],
  racha: [
    'Se rompió la racha. Hoy la empiezas otra vez.',
    'Ayer no hubo sesión. Hoy puede haberla.',
    'Un día en blanco. No hace falta el discurso.',
    'La cadena paró. La primera serie la retoma.',
    'Faltó un día. Entra y ciérralo.',
    'Racha rota. El plan de hoy sigue escrito.',
  ],
};

const CIRO: Lines = {
  empezar: [
    'Empieza. A ver si esta vez mereces que mire.',
    'El plan está ahí. Yo no pienso levantarme a explicarlo.',
    'Una serie. Si es mediocre, volveré a dormirme.',
    'Entra. El día no va a volverse interesante solo.',
    'Empieza ya. Mi paciencia es corta y mi siesta, larga.',
    'Hoy puedes destacar. O puedes aburrirme, como casi siempre.',
  ],
  mitad: [
    'Sigo aburrido. Sorpréndeme en la siguiente.',
    'Mitad. Todavía no ha pasado nada.',
    'Sigue. Parar ahora sería olvidable.',
    'Esa repetición no me despierta. La próxima, quizá.',
    'Mitad de serie. El mínimo no impresiona.',
    'Sigo aquí. Es más de lo que merece esta serie, de momento.',
  ],
  serie: [
    'Serie cerrada. Apenas.',
    'Ha terminado. No es lo mismo que haber destacado.',
    'Hecha. Puedes descansar. Yo ya lo estaba.',
    'Una serie correcta. No es un elogio.',
    'Cerrada. La siguiente tiene que merecer más.',
    'Apuntada. Sigo sin moverme del sitio.',
  ],
  salto: [
    'Lo saltas. Predecible.',
    'Una excusa. Qué poco original.',
    'Saltas el ejercicio. No saltes mi atención: ya era poca.',
    'Lo dejas. El entreno se queda más pequeño.',
    'Anotado. No me lo expliques.',
    'Ese no sale. Elige otro antes de que deje de mirar.',
  ],
  descanso: [
    'El descanso terminó. No iba a recordártelo dos veces.',
    'Tiempo. Levántate, si vas a hacerlo.',
    'Se acabó la pausa. Yo no he notado la diferencia.',
    'El reloj cerró. Tu turno.',
    'Descanso fuera. A ver si la serie mejora.',
    'Ya está. No alargues lo único que te sale fácil.',
  ],
  record: [
    'Un récord. Interesante. No te acostumbres a mi atención.',
    'Has subido. Por una vez, miro.',
    'Marca nueva. Quédate ahí y repítela.',
    'Récord. Casi merece que deje la pereza.',
    'Has pasado tu tope. Bien. Ahora no vuelvas a lo de antes.',
    'Una cifra mejor. Anótala. Yo ya la he visto.',
  ],
  rango: [
    'Rango nuevo. Por fin algo que no es mediocre.',
    'Has subido. El aura, al menos, hace ruido.',
    'Nuevo rango. Sigue, antes de que vuelva a bostezar.',
    'Esto sí lo miro. No lo malgastes mañana.',
    'Rango arriba. Exigiré más. Es lo justo.',
    'Has destacado. Una vez. Quiero otra.',
  ],
  racha: [
    'Perdiste el día. El mundo no se detuvo. Tú sí.',
    'La racha cayó. Qué silencio tan poco interesante.',
    'Ayer no viniste. Hoy, si vienes, que sea para algo.',
    'Un día en blanco. Ni siquiera eso me sorprende.',
    'Se rompió. Empieza, o ni siquiera me enfado.',
    'Faltaste. Estás a tiempo de no ser olvidable.',
  ],
};

const ELIAS: Lines = {
  empezar: [
    'Empieza despacio. La serie larga se gana al final.',
    'Hoy basta con entrar y hacer la primera bien.',
    'El plan ya está escrito. Tú solo tienes que empezarlo.',
    'Respira, carga, y baja con tiempo.',
    'Una sesión honesta vale más que una heroica.',
    'Empieza. Yo me quedo hasta que cierres.',
  ],
  mitad: [
    'Mitad. Mantén el mismo camino.',
    'No hace falta más fuerza. Hace falta el mismo cuidado.',
    'Sigue. La prisa estropea la repetición.',
    'Vas bien. No cambies el recorrido ahora.',
    'Mitad de serie. Respira y termina.',
    'El ritmo es el correcto. No lo abandones.',
  ],
  serie: [
    'Bien cerrada. Descansa entero.',
    'Esa serie sirve. Apúntala y olvida el ruido.',
    'Hecha. El descanso también es parte del trabajo.',
    'Limpia. Así se construye la semana.',
    'Puedes parar un momento. Te lo has ganado.',
    'Serie contada. La siguiente, cuando el reloj lo diga.',
  ],
  salto: [
    'Saltar también es una decisión. La siguiente, hazla.',
    'Hoy no sale ese. No conviertas el salto en abandono.',
    'Lo dejas. Elige un hermano del mismo patrón.',
    'Una excusa corta, y seguimos. Sin castigo.',
    'Está bien no forzar ese. No está bien irse.',
    'Saltado. El entreno sigue teniendo sitio para ti.',
  ],
  descanso: [
    'El descanso cumplió. Vuelve.',
    'Tiempo. Levántate con calma y con intención.',
    'Se acabó la pausa. La serie te espera igual que antes.',
    'Ya recuperaste. No alargues lo que ya cumplió.',
    'El reloj ha llegado. Confía en el mismo movimiento.',
    'Descanso cerrado. Volvemos al plan.',
  ],
  record: [
    'Récord. Guárdalo sin ruido.',
    'Has subido. El cuerpo se ha acordado del trabajo.',
    'Marca nueva. Mañana no hace falta cazar otra.',
    'Récord personal. Disfrútalo en silencio y anótalo.',
    'Más lejos que ayer. Con eso basta.',
    'Has pasado tu cifra. Quédate con la técnica, no con el grito.',
  ],
  rango: [
    'Nuevo rango. El cuerpo ha entendido el trabajo.',
    'Has subido. El aura es la consecuencia, no el objetivo.',
    'Rango nuevo. Mañana se entrena igual de serio.',
    'Este salto lleva semanas. Hoy solo se nombra.',
    'Has cambiado de rango. No cambies de carácter.',
    'Rango arriba. Respira, y sigue el plan.',
  ],
  racha: [
    'Faltó un día. Mañana sigue siendo un buen día para volver.',
    'La racha se detuvo. Tú no tienes que detenerte con ella.',
    'Un día en blanco no borra los demás.',
    'Se rompió la cadena. La primera serie de hoy es un nudo nuevo.',
    'No viniste. Estás a tiempo. Empieza corto si hace falta.',
    'Perdiste un día, no el camino. Entra.',
  ],
};

const TEO: Lines = {
  empezar: [
    'Empieza. El peso no se mueve solo.',
    'Hoy toca entreno. Nada más.',
    'Primera serie. Cuando quieras.',
    'El plan es este. Hazlo.',
    'Entra, carga, baja. En ese orden.',
    'Empieza. Yo miro.',
  ],
  mitad: [
    'Sigue.',
    'Mitad. No cambia nada.',
    'Otra repetición. Igual que la anterior.',
    'Vas bien. Sigue igual.',
    'No pares en la mitad. No tiene sentido.',
    'Mitad de serie. Termínala.',
  ],
  serie: [
    'Hecha.',
    'Serie cerrada. La próxima es igual de simple.',
    'Bien. Descansa.',
    'Apuntada. Siguiente cuando toque.',
    'Ha salido. Sin más.',
    'Hecha. El descanso empieza ahora.',
  ],
  salto: [
    'Saltado. El siguiente.',
    'Lo dejas. No es un problema. El que queda, sí.',
    'Una excusa. Vale. Sigue con otro.',
    'Ese no. Elige uno y muévelo.',
    'Saltas este. El entreno no se ha ido.',
    'Anotado. Siguiente ejercicio.',
  ],
  descanso: [
    'Descanso fuera.',
    'Tiempo. Levántate.',
    'Se acabó. A la serie.',
    'El reloj llegó. Yo también.',
    'Pausa cerrada. Misma carga.',
    'Ya está. Empieza la siguiente.',
  ],
  record: [
    'Récord. Otra vez, cuando puedas.',
    'Has subido. Anótalo.',
    'Marca nueva. Bien.',
    'Un golpe limpio. Récord.',
    'Más que antes. Suficiente.',
    'Récord personal. Seguimos.',
  ],
  rango: [
    'Has subido de rango. No hace falta un discurso.',
    'Rango nuevo. Siguiente entreno.',
    'El aura cambió. El plan, no.',
    'Subiste. Bien.',
    'Nuevo rango. Mañana se trabaja igual.',
    'Rango arriba. Ya está.',
  ],
  racha: [
    'Ayer no viniste. Hoy sí estás. Empieza.',
    'Racha rota. Hoy entrenas.',
    'Se perdió un día. Este no tiene por qué.',
    'La cadena se cortó. Una serie la empieza.',
    'Faltaste. Da igual. Carga.',
    'En blanco ayer. Hoy hay plan. Hazlo.',
  ],
};

export interface CoachLine {
  id: string;
  text: string;
}

export function coachPortrait(id: CoachId): string {
  return `/design/premium/coaches/${id}.png`;
}

export function coachById(id: CoachId): CoachCard {
  const found = COACHES.find((coach) => coach.id === id);
  return found ?? COACHES[0]!;
}

function linesFor(coach: CoachId, event: CoachEvent, tone: DarioTone): readonly string[] {
  switch (coach) {
    case 'lino':
      return LINO[event];
    case 'dario':
      return darioLines(event, tone);
    case 'ciro':
      return CIRO[event];
    case 'elias':
      return ELIAS[event];
    case 'teo':
      return TEO[event];
    default:
      return assertNever(coach, 'entrenador');
  }
}

function darioLines(event: CoachEvent, tone: DarioTone): readonly string[] {
  switch (tone) {
    case 'suave':
      return DARIO_SUAVE[event];
    case 'brusco':
      return DARIO_BRUSCO[event];
    default:
      return assertNever(tone, 'tono de Darío');
  }
}

function lineId(coach: CoachId, event: CoachEvent, tone: DarioTone, index: number): string {
  return coach === 'dario' ? `${coach}:${tone}:${event}:${index}` : `${coach}:${event}:${index}`;
}

export function pickCoachLine(input: {
  coach: CoachId;
  event: CoachEvent;
  tone: DarioTone;
  lastId: string | null;
  random?: () => number;
}): CoachLine {
  const texts = linesFor(input.coach, input.event, input.tone);
  const options = texts.map((text, index) => ({ id: lineId(input.coach, input.event, input.tone, index), text }));
  const pool = options.filter((option) => option.id !== input.lastId);
  const usable = pool.length > 0 ? pool : options;
  const random = input.random ?? Math.random;
  const index = Math.min(usable.length - 1, Math.floor(random() * usable.length));
  return usable[index] ?? options[0]!;
}
