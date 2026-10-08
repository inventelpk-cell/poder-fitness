export const LEVELS = ['principiante', 'intermedio', 'avanzado'] as const;
export type Level = (typeof LEVELS)[number];

export const GOALS = ['fuerza', 'hipertrofia', 'resistencia', 'grasa', 'salud'] as const;
export type Goal = (typeof GOALS)[number];

/** Objetivos que se eligen en el perfil. Resistencia se conserva para planes ya guardados. */
export const PROFILE_GOALS = ['hipertrofia', 'fuerza', 'grasa', 'salud'] as const;

export const SESSION_MINUTES = [20, 30, 45, 60] as const;
export type SessionMinutes = (typeof SESSION_MINUTES)[number];

export const EQUIPMENT = [
  'peso-corporal',
  'mancuernas',
  'barra',
  'banco',
  'polea',
  'maquina',
  'banda',
  'kettlebell',
  'barra-dominadas',
  'paralelas',
] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export const PATTERNS = [
  'rodilla',
  'rodilla-unilateral',
  'cadera',
  'empuje-horizontal',
  'empuje-vertical',
  'traccion-horizontal',
  'traccion-vertical',
  'core',
  'biceps',
  'triceps',
  'hombro-aislamiento',
  'femoral',
  'gemelo',
  'acondicionamiento',
  'movilidad',
] as const;
export type Pattern = (typeof PATTERNS)[number];

export const MUSCLES = [
  'cuadriceps',
  'gluteos',
  'isquiotibiales',
  'pecho',
  'hombros',
  'espalda',
  'abdomen',
  'biceps',
  'triceps',
  'gemelos',
  'cuerpo-completo',
] as const;
export type Muscle = (typeof MUSCLES)[number];

export const DAY_KINDS = ['cuerpo', 'torso', 'empuje', 'traccion', 'pierna', 'pulso'] as const;
export type DayKind = (typeof DAY_KINDS)[number];

export const RANK_IDS = [
  'chispa',
  'brasa',
  'llama',
  'incendio',
  'tormenta',
  'relampago',
  'nova',
  'eclipse',
  'mitico',
  'absoluto',
] as const;
export type RankId = (typeof RANK_IDS)[number];

export type Origin = 'semilla' | 'usuario' | 'everkinetic' | 'gym-visual';
export type Measure = 'reps' | 'segundos';
export type Mechanic = 'compuesto' | 'aislamiento' | 'isométrico' | 'mixto';

export interface Exercise {
  id: string;
  nombre: string;
  alias: string[];
  patron: Pattern | null;
  musculo: Muscle | null;
  equipo: Equipment[];
  nivel: Level | null;
  prioridad: number;
  compuesto: boolean;
  pasos: string[];
  origen: Origin;
  archivado: boolean;
  medida: Measure;
  cuentaEnVolumen: boolean;
  imagenes?: string[];
  gif?: string;
  mediaId?: string;
  atribucion?: string;
  mecanica?: Mechanic;
  resumen?: string;
  consejos?: string[];
  equipoTexto?: string[];
  musculosTexto?: string[];
  /** false cuando el equipo no cabe en el perfil (fitball, bosu, balón, tabla). */
  entraEnPlan?: boolean;
}

export const RESERVE_IDS = [
  'sentadilla-corporal',
  'zancada',
  'puente-gluteo',
  'flexion-pecho',
  'flexiones-pike',
  'remo-invertido',
  'dominadas-australianas',
  'plancha',
  'curl-toalla',
  'fondos-suelo',
  'elevaciones-toalla',
  'curl-femoral-deslizante',
  'gemelos-de-pie',
  'escaladores',
  'gato-camello',
] as const;

export type ReserveId = (typeof RESERVE_IDS)[number];

export function isReserveId(id: string): boolean {
  return (RESERVE_IDS as readonly string[]).includes(id);
}
