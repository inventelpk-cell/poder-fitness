import type { EquipId, Goal, Level, MuscleGroup, Pattern } from './types'

export const PATTERN_NAME: Record<Pattern, string> = {
  cuerpo: 'Cuerpo completo',
  empuje: 'Empuje',
  tiron: 'Tirón',
  pierna: 'Pierna',
  torso: 'Torso',
}

export const GOAL_COPY: { id: Goal; label: string; text: string }[] = [
  { id: 'fuerza', label: 'Fuerza', text: 'Menos repeticiones, más descanso, pesos que pesen.' },
  { id: 'hipertrofia', label: 'Hipertrofia', text: 'Series medias para ganar músculo.' },
  { id: 'resistencia', label: 'Resistencia', text: 'Más repeticiones y descansos cortos.' },
  { id: 'perdida_grasa', label: 'Pérdida de grasa', text: 'Sesiones densas y un cierre corto.' },
]

export const LEVEL_COPY: { id: Level; label: string; text: string }[] = [
  { id: 'principiante', label: 'Principiante', text: 'Llevas poco o vuelves después de un parón.' },
  { id: 'intermedio', label: 'Intermedio', text: 'Entrenas desde hace meses y conoces los básicos.' },
  { id: 'avanzado', label: 'Avanzado', text: 'Llevas años y quieres un bloque más lleno.' },
]

export const PROFILE_EQUIPMENT: { id: EquipId; label: string; locked?: boolean }[] = [
  { id: 'cuerpo', label: 'Cuerpo', locked: true },
  { id: 'mancuernas', label: 'Mancuernas' },
  { id: 'barra', label: 'Barra y discos' },
  { id: 'banco', label: 'Banco' },
  { id: 'poleas', label: 'Poleas' },
  { id: 'maquinas', label: 'Máquinas de gimnasio' },
  { id: 'kettlebell', label: 'Kettlebell' },
  { id: 'bandas', label: 'Bandas elásticas' },
  { id: 'dominadas', label: 'Barra de dominadas' },
]

export const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export const MUSCLE_GROUP_LABEL: Record<MuscleGroup, string> = {
  pecho: 'Pecho',
  espalda: 'Espalda',
  hombros: 'Hombros',
  brazos: 'Brazos',
  piernas: 'Piernas',
  gluteos: 'Glúteos',
  core: 'Abdominales',
  pantorrillas: 'Gemelos',
}

const DB_MUSCLE_GROUP: Record<string, MuscleGroup> = {
  pecho: 'pecho',
  dorsales: 'espalda',
  'espalda-media': 'espalda',
  lumbares: 'espalda',
  trapecios: 'espalda',
  cuello: 'espalda',
  hombros: 'hombros',
  biceps: 'brazos',
  triceps: 'brazos',
  antebrazos: 'brazos',
  cuadriceps: 'piernas',
  isquiotibiales: 'piernas',
  abductores: 'piernas',
  aductores: 'piernas',
  gluteos: 'gluteos',
  abdominales: 'core',
  gemelos: 'pantorrillas',
}

export function muscleGroupFromDb(primary: string | undefined): MuscleGroup {
  if (!primary) return 'core'
  return DB_MUSCLE_GROUP[primary] ?? 'core'
}

export function catalogEquipToProfile(equipo: string): EquipId[] {
  switch (equipo) {
    case 'mancuernas':
      return ['mancuernas']
    case 'barra':
    case 'barra-z':
      return ['barra']
    case 'polea':
      return ['poleas']
    case 'maquina':
      return ['maquinas']
    case 'pesas-rusas':
      return ['kettlebell']
    case 'bandas':
      return ['bandas']
    case 'peso-corporal':
    case 'sin-especificar':
      return ['cuerpo']
    default:
      return ['cuerpo']
  }
}

export function isLoadEquipment(equipo: EquipId[]): boolean {
  return equipo.some((item) => item === 'mancuernas' || item === 'barra' || item === 'poleas' || item === 'maquinas' || item === 'kettlebell')
}

export function equipmentCovered(needed: EquipId[], owned: EquipId[]): boolean {
  return needed.every((item) => item === 'cuerpo' || owned.includes(item))
}

export const ARC_BASES = [
  'Arco del Despertar',
  'Arco de la Forja',
  'Arco del Umbral',
  'Arco de la Cresta',
  'Arco del Núcleo',
]

const ROMAN = ['II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

export function arcName(index: number): string {
  const base = ARC_BASES[(index - 1) % ARC_BASES.length] ?? ARC_BASES[0]
  const cycle = Math.floor((index - 1) / ARC_BASES.length)
  if (cycle <= 0) return base
  return `${base} ${ROMAN[cycle - 1] ?? String(cycle + 1)}`
}

export function weekLine(week: number): string {
  if (week === 3) return 'Sube una serie en el primer ejercicio'
  if (week === 4) return 'Semana de descarga: menos series, misma técnica'
  if (week === 2) return 'Misma prescripción: consolidas lo de la primera semana'
  return 'Semana de base: dejas la primera marca del arco'
}

export function validateName(raw: string): string | null {
  const name = raw.trim()
  if (name.length < 1 || name.length > 24) return null
  if (!/^[\p{L} '\u2019-]+$/u.test(name)) return null
  return name
}

export const DEFAULT_WEEKDAYS: Record<number, number[]> = {
  1: [0],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 3, 4],
  6: [0, 1, 2, 3, 4, 5],
}

export function defaultSettings() {
  return {
    unit: 'kg' as const,
    themeIntensity: 'pulso' as const,
    restVolume: 70,
    barWeightKg: 20,
    heroQuotaOverride: null,
    lastRankSeen: 'chispa',
  }
}
