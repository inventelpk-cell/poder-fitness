import type { DayKind, Equipment, Exercise, Goal, Level, Muscle, Pattern, RankId } from '../catalog/types';
import type { PlanExerciseItem } from './plan';
import type { Unit } from './units';
import type { SessionXpParts } from './xp';

import type { CoachId, DarioTone } from './coach';

export type ThemeIntensity = 'suave' | 'media' | 'plena';
export type AvatarGender = 'hombre' | 'mujer';
export type { CoachId, DarioTone };

export interface Profile {
  name: string;
  level: Level;
  goal: Goal;
  equipment: Equipment[];
  daysPerWeek: number;
  weekdays: number[];
  unit: Unit;
  increment: number;
  theme: ThemeIntensity;
  sound: boolean;
  avatar: AvatarGender;
  coach: CoachId;
  darioTone: DarioTone;
  xpTotal: number;
  ranksSeen: RankId[];
  createdAt: string;
}

export interface Arc {
  id: string;
  number: number;
  weekInArc: 1 | 2 | 3 | 4;
  variantBase: number;
  startedOn: string;
  repeatNotice: boolean;
  closed: boolean;
}

export interface PlanDay {
  id: string;
  date: string;
  weekday: number;
  kind: DayKind;
  variant: number;
  pinned: boolean;
  items: PlanExerciseItem[];
}

export interface Plan {
  id: string;
  arcId: string;
  weekStart: string;
  active: boolean;
  days: PlanDay[];
}

export interface RoutineItem {
  exerciseId: string;
  series: number;
  repMin: number;
  repMax: number;
  descansoSegundos: number;
  nota: string;
}

export interface Routine {
  id: string;
  name: string;
  items: RoutineItem[];
  updatedAt: string;
}

export type SessionStatus = 'en-curso' | 'completada' | 'abandonada';
export type ExerciseState = 'pendiente' | 'en-curso' | 'hecho' | 'saltado' | 'sustituido';
export type SetKind = 'calentamiento' | 'trabajo';
export type LoadDirection = 'sube' | 'baja' | 'igual' | 'vacio';

export interface SessionSet {
  id: string;
  kind: SetKind;
  pesoKg: number | null;
  reps: number | null;
  segundos: number | null;
  completed: boolean;
  completedAt: string | null;
  camara?: boolean;
}

export interface SessionExercise {
  instanceId: string;
  exerciseId: string;
  nombre: string;
  patron: Pattern | null;
  musculo: Muscle | null;
  compuesto: boolean;
  medida: 'reps' | 'segundos';
  cuentaEnVolumen: boolean;
  descansoSegundos: number;
  repMin: number;
  repMax: number;
  nota: string;
  estado: ExerciseState;
  series: SessionSet[];
  slot: Pattern | null;
  propuesta: LoadDirection;
  anteriorKg: number | null;
  imagenes?: string[];
}

export interface WorkoutSession {
  id: string;
  status: SessionStatus;
  startedAt: string;
  finishedAt: string | null;
  date: string;
  planDayId: string | null;
  routineId: string | null;
  nombre: string;
  weekInArc: 1 | 2 | 3 | 4;
  camaraGravedad: boolean;
  xpAwarded: number;
  xpParts: SessionXpParts | null;
  restEndsAt: string | null;
  restAnnounced: number | null;
  exercises: SessionExercise[];
  recordNames: string[];
}

export interface HeroLog {
  date: string;
  flexiones: number;
  abdominales: number;
  sentadillas: number;
  km: number;
  xpAwarded: number;
}

export interface BodyWeight {
  date: string;
  kg: number;
  nota: string;
}

export interface StoredAchievement {
  id: string;
  unlockedAt: string;
}

export interface BackupFile {
  schema: 1;
  app: 'poder-fitness';
  exportedAt: string;
  profile: Profile | null;
  exercises: Exercise[];
  routines: Routine[];
  arcs: Arc[];
  plans: Plan[];
  sessions: WorkoutSession[];
  heroLogs: HeroLog[];
  bodyWeights: BodyWeight[];
  achievements: StoredAchievement[];
}

export function uid(): string {
  return crypto.randomUUID();
}
