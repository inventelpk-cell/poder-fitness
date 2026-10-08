import type { DayKind, Equipment, Goal, Level, Muscle, Pattern, RankId } from '../catalog/types';
import { assertNever } from './assert';

export function labelLevel(level: Level): string {
  switch (level) {
    case 'principiante':
      return 'Principiante';
    case 'intermedio':
      return 'Intermedio';
    case 'avanzado':
      return 'Avanzado';
    default:
      return assertNever(level, 'nivel');
  }
}

export function labelGoal(goal: Goal): string {
  switch (goal) {
    case 'fuerza':
      return 'Fuerza';
    case 'hipertrofia':
      return 'Hipertrofia';
    case 'resistencia':
      return 'Resistencia';
    case 'grasa':
      return 'Pérdida de grasa';
    case 'salud':
      return 'Salud general';
    default:
      return assertNever(goal, 'objetivo');
  }
}

export function labelEquipment(equipment: Equipment): string {
  switch (equipment) {
    case 'peso-corporal':
      return 'Peso corporal';
    case 'mancuernas':
      return 'Mancuernas';
    case 'barra':
      return 'Barra';
    case 'banco':
      return 'Banco';
    case 'polea':
      return 'Polea';
    case 'maquina':
      return 'Máquina';
    case 'banda':
      return 'Bandas';
    case 'kettlebell':
      return 'Kettlebell';
    case 'barra-dominadas':
      return 'Barra de dominadas';
    case 'paralelas':
      return 'Paralelas';
    default:
      return assertNever(equipment, 'equipo');
  }
}

export function labelPattern(pattern: Pattern): string {
  switch (pattern) {
    case 'rodilla':
      return 'Rodilla';
    case 'rodilla-unilateral':
      return 'Rodilla unilateral';
    case 'cadera':
      return 'Cadera';
    case 'empuje-horizontal':
      return 'Empuje horizontal';
    case 'empuje-vertical':
      return 'Empuje vertical';
    case 'traccion-horizontal':
      return 'Tracción horizontal';
    case 'traccion-vertical':
      return 'Tracción vertical';
    case 'core':
      return 'Core';
    case 'biceps':
      return 'Bíceps';
    case 'triceps':
      return 'Tríceps';
    case 'hombro-aislamiento':
      return 'Hombro';
    case 'femoral':
      return 'Femoral';
    case 'gemelo':
      return 'Gemelo';
    case 'acondicionamiento':
      return 'Acondicionamiento';
    case 'movilidad':
      return 'Movilidad';
    default:
      return assertNever(pattern, 'patron');
  }
}

export function labelMuscle(muscle: Muscle): string {
  switch (muscle) {
    case 'cuadriceps':
      return 'Cuádriceps';
    case 'gluteos':
      return 'Glúteos';
    case 'isquiotibiales':
      return 'Isquiotibiales';
    case 'pecho':
      return 'Pecho';
    case 'hombros':
      return 'Hombros';
    case 'espalda':
      return 'Espalda';
    case 'abdomen':
      return 'Abdomen';
    case 'biceps':
      return 'Bíceps';
    case 'triceps':
      return 'Tríceps';
    case 'gemelos':
      return 'Gemelos';
    case 'cuerpo-completo':
      return 'Cuerpo completo';
    default:
      return assertNever(muscle, 'musculo');
  }
}

export function labelDayKind(kind: DayKind): string {
  switch (kind) {
    case 'cuerpo':
      return 'Cuerpo completo';
    case 'torso':
      return 'Torso';
    case 'empuje':
      return 'Empuje';
    case 'traccion':
      return 'Tracción';
    case 'pierna':
      return 'Pierna';
    case 'pulso':
      return 'Pulso';
    default:
      return assertNever(kind, 'dia');
  }
}

export function labelRank(id: RankId): string {
  switch (id) {
    case 'chispa':
      return 'Chispa';
    case 'brasa':
      return 'Brasa';
    case 'llama':
      return 'Llama';
    case 'incendio':
      return 'Incendio';
    case 'tormenta':
      return 'Tormenta';
    case 'relampago':
      return 'Relámpago';
    case 'nova':
      return 'Nova';
    case 'eclipse':
      return 'Eclipse';
    case 'mitico':
      return 'Mítico';
    case 'absoluto':
      return 'Absoluto';
    default:
      return assertNever(id, 'rango');
  }
}

export const WEEKDAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const;
export const WEEKDAY_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;

export function labelWeekday(day: number): string {
  return WEEKDAY_NAMES[day - 1] ?? 'Día';
}

export const LEVEL_HELP: Record<Level, string> = {
  principiante: 'Principiante: estás empezando o vuelves tras un parón.',
  intermedio: 'Intermedio: ya entrenas solo desde hace unos meses.',
  avanzado: 'Avanzado: llevas tiempo con cargas y técnica estable.',
};

export const HEALTH_LINE = 'Poder Fitness no sustituye el consejo de un profesional sanitario.';

export const WEEK_NAMES = ['Cimiento', 'Impulso', 'Cresta', 'Templo'] as const;

export function labelArcWeek(week: number): string {
  return WEEK_NAMES[week - 1] ?? 'Semana';
}
