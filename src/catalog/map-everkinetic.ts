import type { Equipment, Level, Mechanic, Muscle, Pattern } from './types';

/**
 * Everkinetic no trae `level` ni patrón. Estas reglas los derivan del nombre,
 * del músculo principal y del equipo, sin tocar fotos ni instrucciones.
 * La prioridad menor se prefiere. La semilla solo cubre un patrón si aquí no hay candidato.
 */

export interface EverkineticSource {
  id: string;
  name: string;
  nameEn: string;
  primaryMuscles: readonly string[];
  equipment: readonly string[];
  mechanic: Mechanic;
}

export interface MappedExercise {
  patron: Pattern;
  musculo: Muscle;
  equipo: Equipment[];
  nivel: Level;
  prioridad: number;
  compuesto: boolean;
  entraEnPlan: boolean;
}

const BLOCKED_GEAR = new Set(['fitball', 'bosu', 'balón medicinal', 'tabla de equilibrio']);

const GEAR: Record<string, Equipment> = {
  'peso corporal': 'peso-corporal',
  mancuernas: 'mancuernas',
  barra: 'barra',
  disco: 'barra',
  'banco plano': 'banco',
  'banco inclinado': 'banco',
  'banco declinado': 'banco',
  'banco de hiperextensiones': 'banco',
  polea: 'polea',
  máquina: 'maquina',
  'máquina de pecho': 'maquina',
  'máquina de press': 'maquina',
  multipower: 'maquina',
  contractora: 'maquina',
  'remo en T': 'maquina',
  'banda elástica': 'banda',
  'barras paralelas': 'paralelas',
};

function fold(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function blobOf(row: EverkineticSource): string {
  return fold(`${row.id} ${row.name} ${row.nameEn}`);
}

function has(blob: string, ...needles: string[]): boolean {
  return needles.some((needle) => blob.includes(fold(needle)));
}

function patternFor(row: EverkineticSource, blob: string): Pattern {
  const primary = row.primaryMuscles[0] ?? '';

  if (has(blob, 'ankle-circle', 'circulos de tobillo', 'static-neck', 'isometrica de cuello', 'flexion y extension isometrica', 'flexion lateral isometrica')) {
    return 'movilidad';
  }
  if (has(blob, 'calf', 'gemelo')) return 'gemelo';
  if (has(blob, 'leg-curl', 'leg curl', 'curl femoral', 'femoral')) return 'femoral';
  if (has(blob, 'side-bend', 'inclinacion lateral', 'weighted-ball-side')) return 'core';

  if ((primary === 'bíceps' || primary === 'antebrazos') && has(blob, 'curl') && !has(blob, 'leg-curl', 'femoral')) return 'biceps';
  if (primary === 'tríceps' || (has(blob, 'tricep', 'triceps', 'pushdown', 'kickback', 'skull', 'rompecraneo', 'patada de triceps') && !has(blob, 'bench-press', 'press de banca'))) {
    if (!has(blob, 'close-grip-barbell-bench', 'press de banca')) return 'triceps';
  }

  if (has(blob, 'pull-down', 'pulldown', 'pull down', 'jalon', 'chin-up', 'chin up', 'pull-up', 'pull up', 'dominada', 'chins')) {
    return 'traccion-vertical';
  }
  if (has(blob, 'upright-row', 'upright row', 'remo al menton', 'al menton')) return 'hombro-aislamiento';
  if (has(blob, 'rear-deltoid', 'deltoides posterior', 'aperturas posteriores', 'face pull')) return 'hombro-aislamiento';
  if (has(blob, 'row', 'remo')) return 'traccion-horizontal';

  if (has(blob, 'shoulder-press', 'shoulder press', 'military', 'press militar', 'press de hombros', 'overhead-press', 'arnold', 'cuban', 'press cubano')) {
    return 'empuje-vertical';
  }
  if (has(blob, 'dip', 'fondos')) {
    if (primary === 'pecho' || has(blob, 'chest')) return 'empuje-horizontal';
    return 'triceps';
  }
  if (has(blob, 'bench', 'banca', 'push-up', 'push up', 'pushup', 'flexion', 'fly', 'apertura', 'pullover', 'crossover', 'cruces', 'chest-press', 'press de pecho')) {
    return 'empuje-horizontal';
  }

  if (has(blob, 'lunge', 'zancada', 'step-up', 'step up', 'subida al', 'split-squat', 'bulgar', 'single-leg-squat', 'one-leg-squat', 'a una pierna') && !has(blob, 'curl', 'calf', 'gemelo')) {
    return 'rodilla-unilateral';
  }
  if (has(blob, 'squat', 'sentadilla', 'leg-press', 'leg press', 'prensa de piernas', 'hack-squat', 'hack squat')) return 'rodilla';
  if (has(blob, 'dead-lift', 'deadlift', 'dead lift', 'peso muerto', 'good-morning', 'buenos dias', 'hip thrust', 'puente', 'bridging', 'back-extension', 'hiperext', 'superman', 'pull-through', 'body-leg')) {
    return 'cadera';
  }
  if (has(blob, 'abductor', 'adductor')) return 'cadera';
  if (has(blob, 'curl') && !has(blob, 'leg-curl')) return 'biceps';
  if (has(blob, 'raise', 'elevacion', 'shrug', 'encogimiento', 'deltoid', 'deltoides')) return 'hombro-aislamiento';
  if (has(blob, 'crunch', 'plank', 'plancha', 'abdominal', 'rollout', 'sit-up', 'leg-raise', 'leg raise', 'air-bike', 'bicicleta', 'flutter', 'aleteo', 'draw-in')) {
    return 'core';
  }

  switch (primary) {
    case 'cuádriceps':
      return 'rodilla';
    case 'glúteos':
    case 'lumbar':
      return 'cadera';
    case 'isquiotibiales':
      return row.mechanic === 'compuesto' ? 'cadera' : 'femoral';
    case 'pecho':
      return 'empuje-horizontal';
    case 'hombros':
    case 'deltoides lateral':
    case 'deltoides posterior':
    case 'trapecio':
      return 'hombro-aislamiento';
    case 'dorsales':
    case 'espalda':
    case 'espalda alta':
    case 'espalda media':
      return 'traccion-horizontal';
    case 'abdominales':
    case 'abdomen bajo':
    case 'core':
    case 'oblícuos':
      return 'core';
    case 'bíceps':
    case 'antebrazos':
      return 'biceps';
    case 'tríceps':
      return 'triceps';
    case 'gemelos':
      return 'gemelo';
    default:
      return 'movilidad';
  }
}

function muscleFor(primary: readonly string[], patron: Pattern): Muscle {
  switch (primary[0]) {
    case 'cuádriceps':
      return 'cuadriceps';
    case 'glúteos':
      return 'gluteos';
    case 'isquiotibiales':
      return 'isquiotibiales';
    case 'pecho':
      return 'pecho';
    case 'hombros':
    case 'deltoides lateral':
    case 'deltoides posterior':
    case 'trapecio':
      return 'hombros';
    case 'espalda':
    case 'espalda alta':
    case 'espalda media':
    case 'dorsales':
    case 'lumbar':
      return 'espalda';
    case 'abdominales':
    case 'abdomen bajo':
    case 'core':
    case 'oblícuos':
      return 'abdomen';
    case 'bíceps':
    case 'antebrazos':
      return 'biceps';
    case 'tríceps':
      return 'triceps';
    case 'gemelos':
      return 'gemelos';
    case 'brazos':
      if (patron === 'triceps') return 'triceps';
      if (patron === 'biceps') return 'biceps';
      return 'cuerpo-completo';
    default:
      if (patron === 'core') return 'abdomen';
      if (patron === 'cadera') return 'gluteos';
      if (patron === 'gemelo') return 'gemelos';
      return 'cuerpo-completo';
  }
}

function gearFor(row: EverkineticSource, patron: Pattern): { equipo: Equipment[]; entraEnPlan: boolean } {
  const blocked = row.equipment.some((item) => BLOCKED_GEAR.has(item));
  if (row.id === 'body-row') return { equipo: ['peso-corporal'], entraEnPlan: true };

  const found = new Set<Equipment>();
  for (const label of row.equipment) {
    if (BLOCKED_GEAR.has(label) || label === 'agarre en V') continue;
    const mapped = GEAR[label];
    if (mapped) found.add(mapped);
  }

  const verticalBody =
    patron === 'traccion-vertical' &&
    row.equipment.includes('peso corporal') &&
    !row.equipment.includes('polea');
  if (verticalBody) {
    found.delete('barra');
    found.add('barra-dominadas');
  }

  if (row.id === 'bench-dips') found.add('banco');

  const equipo = [...found];
  return { equipo, entraEnPlan: !blocked && equipo.length > 0 };
}

function levelFor(blob: string, patron: Pattern, equipo: readonly Equipment[]): Level {
  if (has(blob, 'sissy', 'pistol', 'muscle-up', 'zercher', 'overhead-squat', 'jefferson', 'snatch', 'arranque', 'cargada', 'nordic', 'one-arm', 'one-armed', 'a un brazo', 'gironda')) {
    return 'avanzado';
  }
  if (has(blob, 'dead-lift', 'deadlift', 'peso muerto') && !has(blob, 'romanian', 'rumano', 'dumbbell', 'mancuerna') && equipo.includes('barra')) {
    return 'avanzado';
  }
  if (patron === 'traccion-vertical' && equipo.includes('barra-dominadas')) return 'intermedio';
  if (has(blob, 'front-squat', 'sentadilla frontal', 'good-morning', 'buenos dias', 'romanian', 'rumano') && equipo.includes('barra')) {
    return 'intermedio';
  }
  const big =
    patron === 'rodilla' ||
    patron === 'rodilla-unilateral' ||
    patron === 'cadera' ||
    patron === 'empuje-horizontal' ||
    patron === 'empuje-vertical' ||
    patron === 'traccion-horizontal';
  if (equipo.includes('barra') && big && !has(blob, 'curl', 'raise', 'elevacion', 'shrug', 'encogimiento')) return 'intermedio';
  return 'principiante';
}

function compoundFor(row: EverkineticSource, blob: string, patron: Pattern): boolean {
  if (row.mechanic === 'compuesto' || row.mechanic === 'mixto') return true;
  const structural =
    patron === 'rodilla' ||
    patron === 'rodilla-unilateral' ||
    patron === 'cadera' ||
    patron === 'empuje-horizontal' ||
    patron === 'empuje-vertical' ||
    patron === 'traccion-horizontal' ||
    patron === 'traccion-vertical';
  if (!structural) return false;
  if (has(blob, 'fly', 'apertura', 'raise', 'elevacion', 'shrug', 'encogimiento', 'curl', 'pullover')) return false;
  return has(blob, 'press', 'push-up', 'pushup', 'flexion', 'squat', 'sentadilla', 'dead', 'peso muerto', 'row', 'remo', 'chin', 'dominada', 'pull-down', 'jalon', 'lunge', 'zancada');
}

export function mapEverkinetic(row: EverkineticSource): MappedExercise {
  const blob = blobOf(row);
  const patron = patternFor(row, blob);
  const { equipo, entraEnPlan } = gearFor(row, patron);
  const nivel = levelFor(blob, patron, equipo);
  const compuesto = compoundFor(row, blob, patron);
  const base = nivel === 'principiante' ? 20 : nivel === 'intermedio' ? 26 : 32;
  return {
    patron,
    musculo: muscleFor(row.primaryMuscles, patron),
    equipo,
    nivel,
    prioridad: compuesto ? base : base + 8,
    compuesto,
    entraEnPlan,
  };
}
