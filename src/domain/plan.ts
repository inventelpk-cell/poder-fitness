import { equipmentCovers, levelAllows, type Exercise } from '../catalog';
import type { DayKind, Equipment, Goal, Level, Muscle, Pattern } from '../catalog/types';
import { assertNever } from './assert';
import { dateForWeekday } from './dates';

export interface SlotPin {
  weekday: number;
  slot: Pattern;
  exerciseId: string;
}

export interface PlanExerciseItem {
  exerciseId: string;
  slot: Pattern;
  series: number;
  repMin: number;
  repMax: number;
  repObjetivo: number;
  descansoSegundos: number;
  nota: string;
  medida: 'reps' | 'segundos';
  compuesto: boolean;
  pinned: boolean;
}

export interface GeneratedDay {
  weekday: number;
  date: string;
  kind: DayKind;
  variant: number;
  pinned: boolean;
  items: PlanExerciseItem[];
}

export interface GenerateInput {
  level: Level;
  goal: Goal;
  equipment: Equipment[];
  weekdays: number[];
  weekInArc: 1 | 2 | 3 | 4;
  variantBase: number;
  weekStart: string;
  exercises: readonly Exercise[];
  pins?: SlotPin[];
}

const ROTATION: Pattern[] = ['hombro-aislamiento', 'biceps', 'triceps'];

export function daySequence(days: number, level: Level, goal: Goal): DayKind[] {
  if (days <= 1) return ['cuerpo'];
  if (days === 2) return ['cuerpo', 'cuerpo'];
  if (days === 3) {
    if (level === 'principiante' || goal === 'fuerza') return ['cuerpo', 'cuerpo', 'cuerpo'];
    if (goal === 'resistencia') return ['cuerpo', 'pulso', 'cuerpo'];
    if (goal === 'hipertrofia' || goal === 'grasa') return ['empuje', 'traccion', 'pierna'];
    return assertNever(goal, 'objetivo');
  }
  if (days === 4) return ['torso', 'pierna', 'torso', 'pierna'];
  if (days === 5) {
    switch (goal) {
      case 'fuerza':
      case 'hipertrofia':
        return ['empuje', 'traccion', 'pierna', 'torso', 'pierna'];
      case 'resistencia':
      case 'grasa':
        return ['empuje', 'traccion', 'pierna', 'cuerpo', 'pulso'];
      default:
        return assertNever(goal, 'objetivo');
    }
  }
  if (days === 6) return ['empuje', 'traccion', 'pierna', 'empuje', 'traccion', 'pierna'];
  return ['empuje', 'traccion', 'pierna', 'empuje', 'traccion', 'pierna', 'pulso'];
}

function slotsFor(kind: DayKind, level: Level, goal: Goal, dayIndex: number): Pattern[] {
  const rotate = ROTATION[dayIndex % ROTATION.length] ?? 'hombro-aislamiento';
  const max = kind === 'pulso' ? 5 : level === 'principiante' ? 5 : 6;
  let slots: Pattern[];
  switch (kind) {
    case 'cuerpo':
      slots = ['rodilla', 'empuje-horizontal', 'traccion-horizontal', 'cadera', 'core'];
      if (max >= 6) slots.push(goal === 'grasa' || goal === 'resistencia' ? 'acondicionamiento' : rotate);
      break;
    case 'torso':
      slots = ['empuje-horizontal', 'traccion-horizontal', 'empuje-vertical', 'traccion-vertical', rotate];
      if (max >= 6) slots.push('core');
      break;
    case 'empuje':
      slots = ['empuje-horizontal', 'empuje-vertical', 'hombro-aislamiento', 'triceps'];
      if (goal === 'hipertrofia' && level !== 'principiante') slots.push('empuje-horizontal');
      break;
    case 'traccion':
      slots = ['traccion-vertical', 'traccion-horizontal', 'hombro-aislamiento', 'biceps'];
      if (goal === 'hipertrofia' && level !== 'principiante') slots.push('traccion-horizontal');
      break;
    case 'pierna':
      slots = ['rodilla', 'cadera', 'rodilla-unilateral', 'femoral', 'gemelo'];
      if (max >= 6) slots.push(goal === 'grasa' || goal === 'resistencia' ? 'acondicionamiento' : 'core');
      break;
    case 'pulso':
      slots = ['movilidad', 'core', 'core', 'acondicionamiento', 'acondicionamiento'];
      break;
    default:
      return assertNever(kind, 'dia');
  }
  return slots.slice(0, max);
}

interface Prescription {
  series: number;
  repMin: number;
  repMax: number;
  descanso: number;
}

function tablePrescription(goal: Goal, level: Level): Prescription {
  switch (goal) {
    case 'fuerza':
      switch (level) {
        case 'principiante':
          return { series: 3, repMin: 5, repMax: 8, descanso: 150 };
        case 'intermedio':
          return { series: 4, repMin: 3, repMax: 6, descanso: 180 };
        case 'avanzado':
          return { series: 5, repMin: 3, repMax: 5, descanso: 180 };
        default:
          return assertNever(level, 'nivel');
      }
    case 'hipertrofia':
      switch (level) {
        case 'principiante':
          return { series: 3, repMin: 8, repMax: 12, descanso: 90 };
        case 'intermedio':
          return { series: 3, repMin: 8, repMax: 12, descanso: 90 };
        case 'avanzado':
          return { series: 4, repMin: 6, repMax: 12, descanso: 90 };
        default:
          return assertNever(level, 'nivel');
      }
    case 'resistencia':
      return { series: 3, repMin: 12, repMax: 20, descanso: 45 };
    case 'grasa':
      if (level === 'principiante') return { series: 3, repMin: 10, repMax: 15, descanso: 60 };
      return { series: 3, repMin: 8, repMax: 15, descanso: 60 };
    default:
      return assertNever(goal, 'objetivo');
  }
}

function prescribe(exercise: Exercise, goal: Goal, level: Level, weekInArc: 1 | 2 | 3 | 4): Omit<PlanExerciseItem, 'exerciseId' | 'slot' | 'nota' | 'pinned'> {
  if (exercise.patron === 'movilidad') {
    return {
      series: 1,
      repMin: 8,
      repMax: 8,
      repObjetivo: 8,
      descansoSegundos: 30,
      medida: 'reps',
      compuesto: false,
    };
  }
  const base = tablePrescription(goal, level);
  let series = exercise.compuesto ? base.series : Math.max(2, base.series - 1);
  let repMin = base.repMin;
  let repMax = base.repMax;
  let descanso = base.descanso;
  let medida: 'reps' | 'segundos' = exercise.medida;

  if (exercise.id === 'plancha') {
    medida = 'segundos';
    if (level === 'principiante') {
      repMin = 20;
      repMax = 40;
    } else if (level === 'intermedio') {
      repMin = 30;
      repMax = 60;
    } else {
      repMin = 45;
      repMax = 90;
    }
  }

  if (exercise.id === 'escaladores' || exercise.id === 'saltos-tijera') {
    if (goal === 'fuerza' || goal === 'hipertrofia') {
      series = 3;
      repMin = 12;
      repMax = 20;
      descanso = 45;
    } else if (goal === 'resistencia') {
      series = 3;
      repMin = 12;
      repMax = 20;
      descanso = 45;
    } else {
      const grasa = tablePrescription('grasa', level);
      series = grasa.series;
      repMin = grasa.repMin;
      repMax = grasa.repMax;
      descanso = grasa.descanso;
    }
  }

  if (exercise.id !== 'gato-camello') {
    if (weekInArc === 4) series = Math.max(2, Math.floor(series * 0.6));
  }

  const repObjetivo =
    weekInArc === 2 ? Math.round((repMin + repMax) / 2) : weekInArc === 3 ? repMax : repMin;

  return {
    series,
    repMin,
    repMax,
    repObjetivo,
    descansoSegundos: descanso,
    medida,
    compuesto: exercise.compuesto,
  };
}

function candidatesFor(pattern: Pattern, input: GenerateInput): Exercise[] {
  return input.exercises
    .filter(
      (exercise) =>
        !exercise.archivado &&
        exercise.patron === pattern &&
        exercise.nivel !== null &&
        levelAllows(input.level, exercise.nivel) &&
        equipmentCovers(input.equipment, exercise.equipo),
    )
    .sort((a, b) => a.prioridad - b.prioridad || a.id.localeCompare(b.id));
}

function pickExercise(
  list: Exercise[],
  variant: number,
  prevMuscle: Muscle | null,
): Exercise | null {
  if (list.length === 0) return null;
  const index = variant % list.length;
  const winner = list[index];
  if (!winner) return null;
  if (prevMuscle && winner.musculo === prevMuscle) {
    const next = list[(index + 1) % list.length];
    if (next && next.id !== winner.id && next.musculo !== prevMuscle) return next;
  }
  return winner;
}

function muscleCap(level: Level): number {
  switch (level) {
    case 'principiante':
      return 12;
    case 'intermedio':
      return 16;
    case 'avanzado':
      return 20;
    default:
      return assertNever(level, 'nivel');
  }
}

function enforceCaps(days: GeneratedDay[], input: GenerateInput): void {
  const cap = muscleCap(input.level);
  const byId = new Map(input.exercises.map((exercise) => [exercise.id, exercise]));
  const unique = (item: PlanExerciseItem): boolean => {
    const pool = candidatesFor(item.slot, input);
    return pool.length <= 1;
  };
  for (let guard = 0; guard < 80; guard += 1) {
    const totals = new Map<Muscle, number>();
    for (const day of days) {
      for (const item of day.items) {
        const muscle = byId.get(item.exerciseId)?.musculo;
        if (!muscle) continue;
        totals.set(muscle, (totals.get(muscle) ?? 0) + item.series);
      }
    }
    const over = [...totals.entries()].filter(([, sets]) => sets > cap);
    if (over.length === 0) return;
    over.sort((a, b) => b[1] - a[1]);
    const muscle = over[0]?.[0];
    if (!muscle) return;
    let reduced = false;
    for (let d = days.length - 1; d >= 0 && !reduced; d -= 1) {
      const day = days[d];
      if (!day) continue;
      for (let i = day.items.length - 1; i >= 0; i -= 1) {
        const item = day.items[i];
        const owner = item ? byId.get(item.exerciseId) : undefined;
        if (!item || !owner || owner.musculo !== muscle || owner.compuesto || item.series <= 2) continue;
        item.series -= 1;
        reduced = true;
        break;
      }
    }
    if (reduced) continue;
    let removed = false;
    for (let d = days.length - 1; d >= 0 && !removed; d -= 1) {
      const day = days[d];
      if (!day || day.items.length <= 4) continue;
      for (let i = day.items.length - 1; i >= 0; i -= 1) {
        const item = day.items[i];
        const owner = item ? byId.get(item.exerciseId) : undefined;
        if (!item || !owner || owner.musculo !== muscle || unique(item)) continue;
        day.items.splice(i, 1);
        removed = true;
        break;
      }
    }
    if (!removed) return;
  }
}

export function generateWeek(input: GenerateInput): GeneratedDay[] {
  const weekdays = [...input.weekdays].sort((a, b) => a - b);
  const kinds = daySequence(weekdays.length, input.level, input.goal);
  const days: GeneratedDay[] = [];
  for (let index = 0; index < kinds.length; index += 1) {
    const kind = kinds[index] ?? 'cuerpo';
    const weekday = weekdays[index] ?? index + 1;
    const prior = kinds.slice(0, index).filter((item) => item === kind).length;
    const variant = input.variantBase + prior;
    const used = new Set<string>();
    let prevMuscle: Muscle | null = null;
    const firstKnee = new Set<string>();
    if (kind === 'pierna' && prior > 0) {
      const earlier = days.find((day) => day.kind === 'pierna');
      const knee = earlier?.items.find((item) => item.slot === 'rodilla');
      if (knee) firstKnee.add(knee.exerciseId);
    }
    const items: PlanExerciseItem[] = [];
    for (const slot of slotsFor(kind, input.level, input.goal, index)) {
      const pin = input.pins?.find((item) => item.weekday === weekday && item.slot === slot);
      const pool = candidatesFor(slot, input).filter((exercise) => !used.has(exercise.id));
      const pinned = pin ? input.exercises.find((exercise) => exercise.id === pin.exerciseId && !exercise.archivado) : undefined;
      let chosen: Exercise | null = null;
      if (pinned && !used.has(pinned.id)) chosen = pinned;
      else {
        const blocked = pool.filter((exercise) => !firstKnee.has(exercise.id));
        chosen = pickExercise(blocked.length > 0 ? blocked : pool, variant, prevMuscle);
      }
      if (!chosen) continue;
      used.add(chosen.id);
      prevMuscle = chosen.musculo;
      const dose = prescribe(chosen, input.goal, input.level, input.weekInArc);
      items.push({
        exerciseId: chosen.id,
        slot,
        nota: '',
        pinned: Boolean(pinned),
        ...dose,
      });
    }
    days.push({
      weekday,
      date: dateForWeekday(input.weekStart, weekday),
      kind,
      variant,
      pinned: false,
      items,
    });
  }
  enforceCaps(days, input);
  return days;
}
