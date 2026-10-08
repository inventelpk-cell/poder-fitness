/**
 * Importa el dataset MIT de hasaneyldrm/exercises-dataset.
 * Los medios siguen siendo © Gym visual (NOTICE). No los reescala: se copian a 180×180.
 *
 * Uso: node scripts/import-gym-visual.mjs /tmp/exercises-dataset
 */
import { mkdir, copyFile, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { disambiguationHint, exerciseSpanishIssues, spanishName } from './gym-visual-names.mjs';

const root = path.resolve(process.argv[2] ?? '/tmp/exercises-dataset');
const outJson = path.resolve('data/exercises/gym-visual.es.json');
const imageOut = path.resolve('public/gym-visual/images');
const videoOut = path.resolve('public/gym-visual/videos');
const ATTRIBUTION = '© Gym visual — https://gymvisual.com/';

const GEAR = {
  'body weight': ['peso-corporal'],
  dumbbell: ['mancuernas'],
  barbell: ['barra'],
  'ez barbell': ['barra'],
  'olympic barbell': ['barra'],
  'trap bar': ['barra'],
  cable: ['polea'],
  rope: ['polea'],
  'leverage machine': ['maquina'],
  'smith machine': ['maquina'],
  'sled machine': ['maquina'],
  assisted: ['maquina'],
  band: ['banda'],
  'resistance band': ['banda'],
  kettlebell: ['kettlebell'],
};

const MUSCLE = {
  abs: 'abdomen',
  pectorals: 'pecho',
  biceps: 'biceps',
  glutes: 'gluteos',
  delts: 'hombros',
  triceps: 'triceps',
  'upper back': 'espalda',
  lats: 'espalda',
  calves: 'gemelos',
  quads: 'cuadriceps',
  forearms: 'biceps',
  'cardiovascular system': 'cuerpo-completo',
  hamstrings: 'isquiotibiales',
  spine: 'espalda',
  traps: 'hombros',
  adductors: 'gluteos',
  abductors: 'gluteos',
  'serratus anterior': 'pecho',
  'levator scapulae': 'hombros',
};

const MUSCLE_ES = {
  abs: 'abdomen',
  abdominals: 'abdomen',
  pectorals: 'pectorales',
  chest: 'pecho',
  'upper chest': 'pecho superior',
  biceps: 'bíceps',
  brachialis: 'braquial',
  glutes: 'glúteos',
  delts: 'deltoides',
  deltoids: 'deltoides',
  'rear deltoids': 'deltoides posteriores',
  triceps: 'tríceps',
  'upper back': 'espalda alta',
  back: 'espalda',
  lats: 'dorsales',
  'latissimus dorsi': 'dorsal ancho',
  calves: 'gemelos',
  soleus: 'sóleo',
  quads: 'cuádriceps',
  quadriceps: 'cuádriceps',
  forearms: 'antebrazos',
  'wrist flexors': 'flexores de muñeca',
  'wrist extensors': 'extensores de muñeca',
  wrists: 'muñecas',
  'cardiovascular system': 'sistema cardiovascular',
  hamstrings: 'isquiotibiales',
  spine: 'columna',
  traps: 'trapecio',
  trapezius: 'trapecio',
  rhomboids: 'romboides',
  adductors: 'aductores',
  abductors: 'abductores',
  'inner thighs': 'muslo interno',
  'serratus anterior': 'serrato',
  'levator scapulae': 'elevador de la escápula',
  'hip flexors': 'flexores de la cadera',
  'lower back': 'lumbar',
  'lower abs': 'abdomen inferior',
  shoulders: 'hombros',
  core: 'core',
  obliques: 'oblicuos',
  groin: 'ingle',
  shins: 'espinillas',
  ankles: 'tobillos',
  'ankle stabilizers': 'estabilizadores de tobillo',
  feet: 'pies',
  hands: 'manos',
  'grip muscles': 'músculos del agarre',
  'rotator cuff': 'manguito rotador',
  sternocleidomastoid: 'esternocleidomastoideo',
};

const EQUIPO_ES = {
  'body weight': 'Peso corporal',
  dumbbell: 'Mancuernas',
  barbell: 'Barra',
  'ez barbell': 'Barra Z',
  'olympic barbell': 'Barra olímpica',
  'trap bar': 'Barra hexagonal',
  cable: 'Polea',
  'leverage machine': 'Máquina',
  'smith machine': 'Multipower',
  'sled machine': 'Máquina de trineo',
  assisted: 'Asistido',
  band: 'Banda',
  'resistance band': 'Banda elástica',
  kettlebell: 'Kettlebell',
  rope: 'Cuerda',
  'stability ball': 'Fitball',
  'exercise ball': 'Fitball',
  'medicine ball': 'Balón medicinal',
};

function has(blob, ...needles) {
  return needles.some((needle) => blob.includes(needle));
}

function patternFor(name, target) {
  const blob = name.toLowerCase();
  if (has(blob, 'stretch', 'estiramiento') && !has(blob, 'squat', 'sentadilla', 'press', 'curl', 'row', 'remo')) return 'movilidad';
  if (target === 'cardiovascular system' || has(blob, 'burpee', 'jumping jack', 'saltos de tijera', 'mountain climber', 'escaladores')) {
    if (has(blob, 'air bike', 'bicicleta abdominal', 'crunch')) return 'core';
    return 'acondicionamiento';
  }
  if (target === 'calves' || has(blob, 'calf', 'gemelo')) return 'gemelo';
  if ((target === 'hamstrings' || has(blob, 'hamstring', 'isquiotibial')) && has(blob, 'curl', 'femoral')) return 'femoral';
  if (has(blob, 'lunge', 'zancada', 'split squat', 'búlgara', 'step-up', 'step up', 'subida al')) return 'rodilla-unilateral';
  if (has(blob, 'squat', 'sentadilla', 'leg press', 'prensa de piernas', 'hack squat', 'sissy')) return 'rodilla';
  if (has(blob, 'deadlift', 'peso muerto', 'good morning', 'buenos días', 'hip thrust', 'empuje de cadera', 'glute bridge', 'puente', 'back extension', 'pull-through', 'pull through')) return 'cadera';
  if (target === 'adductors' || target === 'abductors' || has(blob, 'abduction', 'adduction', 'abducción', 'aducción')) return 'cadera';
  if (has(blob, 'pull-up', 'pull up', 'pullup', 'chin-up', 'chin up', 'dominada', 'pulldown', 'pull-down', 'jalón')) return 'traccion-vertical';
  if (has(blob, 'upright row', 'remo al mentón', 'lateral raise', 'elevación lateral', 'front raise', 'elevación frontal', 'rear delt', 'reverse fly', 'shrug', 'encogimiento')) return 'hombro-aislamiento';
  if (has(blob, 'row', 'remo', 'face pull') && !has(blob, 'upright')) return 'traccion-horizontal';
  if (has(blob, 'pike-to-cobra', 'pike push', 'handstand push', 'shoulder press', 'military', 'press militar', 'overhead press', 'arnold') || (has(blob, 'pike') && has(blob, 'push'))) return 'empuje-vertical';
  if (has(blob, 'dip', 'fondos')) return target === 'pectorals' ? 'empuje-horizontal' : 'triceps';
  if (has(blob, 'bench', 'banca', 'push-up', 'push up', 'fly', 'apertura', 'chest press', 'press de pecho', 'pullover', 'crossover')) return 'empuje-horizontal';
  if (target === 'biceps' || (has(blob, 'curl') && !has(blob, 'leg curl', 'femoral', 'wrist'))) return 'biceps';
  if (target === 'triceps' || has(blob, 'pushdown', 'kickback', 'patada', 'skull')) return 'triceps';
  if (target === 'abs' || has(blob, 'crunch', 'sit-up', 'sit up', 'abdominal', 'plank', 'plancha', 'leg raise', 'russian twist', 'giro ruso')) return 'core';
  if (target === 'quads') return 'rodilla';
  if (target === 'glutes') return 'cadera';
  if (target === 'pectorals') return 'empuje-horizontal';
  if (target === 'delts') return blob.includes('press') ? 'empuje-vertical' : 'hombro-aislamiento';
  if (target === 'lats') return 'traccion-vertical';
  if (target === 'upper back' || target === 'traps') return 'traccion-horizontal';
  if (target === 'forearms') return 'biceps';
  if (target === 'spine') return 'movilidad';
  return 'movilidad';
}

function muscleFor(target, patron) {
  return MUSCLE[target] ?? (patron === 'core' ? 'abdomen' : patron === 'gemelo' ? 'gemelos' : 'cuerpo-completo');
}

function gearFor(row, patron) {
  const mapped = GEAR[row.equipment];
  if (!mapped) return { equipo: [], entraEnPlan: false };
  const equipo = [...mapped];
  const blob = row.name.toLowerCase();
  if (patron === 'traccion-vertical' && row.equipment === 'body weight' && has(blob, 'pull-up', 'pull up', 'chin-up', 'chin up', 'pullup')) {
    return { equipo: ['barra-dominadas'], entraEnPlan: true };
  }
  if ((row.equipment === 'dumbbell' || row.equipment === 'barbell' || row.equipment === 'ez barbell') && has(blob, 'bench')) {
    if (!equipo.includes('banco')) equipo.push('banco');
  }
  return { equipo, entraEnPlan: true };
}

function levelFor(blob, patron, equipo) {
  if (has(blob, 'pistol', 'muscle-up', 'muscle up', 'archer', 'planche', 'front lever', 'sissy', 'nordic', 'snatch', 'handstand', 'one arm', 'one-arm')) return 'avanzado';
  if (equipo.includes('barra') && has(blob, 'deadlift', 'squat', 'bench', 'overhead', 'military') && !has(blob, 'dumbbell')) return 'intermedio';
  if (patron === 'traccion-vertical' && equipo.includes('barra-dominadas')) return 'intermedio';
  return 'principiante';
}

function compoundFor(blob, patron) {
  const structural = ['rodilla', 'rodilla-unilateral', 'cadera', 'empuje-horizontal', 'empuje-vertical', 'traccion-horizontal', 'traccion-vertical'].includes(patron);
  if (!structural) return false;
  if (has(blob, 'fly', 'apertura', 'raise', 'elevación', 'shrug', 'curl', 'pullover', 'kickback', 'patada')) return false;
  return has(blob, 'press', 'push-up', 'push up', 'flexión', 'squat', 'sentadilla', 'deadlift', 'peso muerto', 'row', 'remo', 'chin', 'dominada', 'pulldown', 'jalón', 'lunge', 'zancada');
}

function muscleText(row) {
  const labels = [row.target, ...(row.secondary_muscles ?? [])]
    .map((item) => MUSCLE_ES[item] ?? item)
    .filter(Boolean);
  return [...new Set(labels)];
}

const rows = JSON.parse(await readFile(path.join(root, 'data/exercises.json'), 'utf8'));
const mapped = rows.map((row) => {
  const blob = row.name.toLowerCase();
  const patron = patternFor(row.name, row.target);
  const { equipo, entraEnPlan } = gearFor(row, patron);
  const nivel = levelFor(blob, patron, equipo);
  const compuesto = compoundFor(blob, patron);
  const pasos = (row.instruction_steps?.es ?? []).map((step) => step.trim()).filter(Boolean);
  const nombre = spanishName(row.name);
  const mediaId = row.media_id ?? path.basename(row.image).split('-').pop()?.replace(/\.\w+$/, '') ?? '';
  return {
    id: `gv-${row.id}`,
    nombre,
    alias: [row.name],
    patron,
    musculo: muscleFor(row.target, patron),
    equipo,
    nivel,
    prioridad: 46,
    compuesto,
    pasos,
    origen: 'gym-visual',
    archivado: false,
    medida: 'reps',
    cuentaEnVolumen: patron !== 'movilidad',
    imagenes: [`gym-visual/images/${path.basename(row.image)}`],
    gif: row.gif_url ? `gym-visual/videos/${path.basename(row.gif_url)}` : null,
    resumen: pasos[0] ?? '',
    equipoTexto: [EQUIPO_ES[row.equipment] ?? row.equipment],
    musculosTexto: muscleText(row),
    entraEnPlan,
    atribucion: row.attribution || ATTRIBUTION,
    mediaId,
    _image: row.image,
    _gif: row.gif_url,
    _english: row.name,
  };
});

const buckets = new Map();
for (const exercise of mapped) {
  if (!exercise.entraEnPlan) continue;
  const gear = exercise.equipo.find((item) => item !== 'peso-corporal' && item !== 'banco') ?? exercise.equipo[0] ?? 'peso-corporal';
  const key = `${exercise.patron}|${gear}`;
  const list = buckets.get(key) ?? [];
  list.push(exercise);
  buckets.set(key, list);
}

const levelRank = { principiante: 0, intermedio: 1, avanzado: 2 };
for (const list of buckets.values()) {
  list.sort((a, b) => {
    const level = levelRank[a.nivel] - levelRank[b.nivel];
    if (level !== 0) return level;
    if (a.compuesto !== b.compuesto) return a.compuesto ? -1 : 1;
    return a.nombre.length - b.nombre.length;
  });
  for (const [index, exercise] of list.entries()) {
    if (index < 2) {
      exercise.prioridad = exercise.nivel === 'principiante' ? 14 : exercise.nivel === 'intermedio' ? 18 : 24;
    }
  }
}

let copiedImages = 0;
let copiedGifs = 0;
let missingGif = 0;
await mkdir(imageOut, { recursive: true });
await mkdir(videoOut, { recursive: true });
for (const exercise of mapped) {
  const imageFrom = path.join(root, exercise._image);
  const imageTo = path.join('public', exercise.imagenes[0]);
  await mkdir(path.dirname(imageTo), { recursive: true });
  await copyFile(imageFrom, imageTo);
  copiedImages += 1;
  if (!exercise.gif || !exercise._gif) continue;
  const gifFrom = path.join(root, exercise._gif);
  try {
    await access(gifFrom);
  } catch {
    missingGif += 1;
    exercise.gif = null;
    continue;
  }
  const gifTo = path.join('public', exercise.gif);
  await mkdir(path.dirname(gifTo), { recursive: true });
  await copyFile(gifFrom, gifTo);
  copiedGifs += 1;
}

const byName = new Map();
for (const exercise of mapped) {
  const key = exercise.nombre.toLowerCase();
  const list = byName.get(key) ?? [];
  list.push(exercise);
  byName.set(key, list);
}
for (const group of byName.values()) {
  if (group.length <= 1) continue;
  for (const exercise of group) {
    const hint = disambiguationHint(exercise._english);
    if (hint) exercise.nombre = `${exercise.nombre} (${hint})`;
  }
  const seen = new Set();
  for (const exercise of group) {
    const key = exercise.nombre.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      continue;
    }
    const tail = exercise._english.replace(/.*\(([^)]+)\).*/, '$1').trim();
    exercise.nombre = `${exercise.nombre} — ${spanishName(tail) || tail}`;
    seen.add(exercise.nombre.toLowerCase());
  }
}

const qualityFailures = mapped.flatMap((exercise) =>
  exerciseSpanishIssues(exercise).map((issue) => `${exercise._english}: ${issue}`),
);
if (qualityFailures.length > 0) {
  console.error(qualityFailures.slice(0, 20).join('\n'));
  throw new Error(`Calidad española: ${qualityFailures.length} incidencias`);
}

const clean = mapped.map((exercise) => {
  const { _image, _gif, _english, ...rest } = exercise;
  if (!rest.gif) delete rest.gif;
  return rest;
});

await mkdir(path.dirname(outJson), { recursive: true });
await writeFile(outJson, `${JSON.stringify(clean)}\n`);

console.log(JSON.stringify({
  total: mapped.length,
  plan: mapped.filter((exercise) => exercise.entraEnPlan).length,
  gifs: mapped.filter((exercise) => exercise.gif).length,
  copiedImages,
  copiedGifs,
  missingGif,
  sample: mapped.slice(0, 8).map((exercise) => `${exercise._english} → ${exercise.nombre}`),
}, null, 2));
