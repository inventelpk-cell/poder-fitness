export interface Rank {
  min: number
  id: string
  name: string
  line: string
}

export const RANKS: Rank[] = [
  { min: 1, id: 'chispa', name: 'Chispa', line: 'El arco reconoce el primer entreno.' },
  { min: 4, id: 'brasa', name: 'Brasa', line: 'Ya hay constancia suficiente para notar el calor.' },
  { min: 8, id: 'llama', name: 'Llama', line: 'El trabajo de estas semanas ya se ve.' },
  { min: 12, id: 'hoguera', name: 'Hoguera', line: 'Cuatro bloques cortos caben en este fuego.' },
  { min: 18, id: 'nucleo', name: 'Núcleo', line: 'El centro del plan ya no depende del ánimo de un día.' },
  { min: 25, id: 'pulso', name: 'Pulso', line: 'La marca sube aunque el día sea normal.' },
  { min: 35, id: 'onda', name: 'Onda', line: 'El esfuerzo sale hacia la siguiente serie.' },
  { min: 45, id: 'cresta', name: 'Cresta', line: 'Los récords ya tienen sitio propio.' },
  { min: 60, id: 'vortice', name: 'Vórtice', line: 'El arco gira y tú sigues dentro.' },
  { min: 80, id: 'eclipse', name: 'Eclipse interior', line: 'Casi todo el camino está a tus espaldas.' },
  { min: 100, id: 'singularidad', name: 'Singularidad', line: 'Este nivel no se presta. Se entrena.' },
]

export function rankForLevel(level: number): Rank {
  let current = RANKS[0]
  for (const rank of RANKS) {
    if (level >= rank.min) current = rank
  }
  return current
}

export interface AchievementDef {
  id: string
  name: string
  xp: number
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'primera_chispa', name: 'Primera chispa', xp: 40 },
  { id: 'bitacora', name: 'Bitácora viva', xp: 40 },
  { id: 'diez', name: 'Diez sesiones', xp: 40 },
  { id: 'veinticinco', name: 'Veinticinco', xp: 40 },
  { id: 'cincuenta', name: 'Cincuenta', xp: 40 },
  { id: 'semana', name: 'Semana cerrada', xp: 40 },
  { id: 'cuatro_semanas', name: 'Mes de arco', xp: 80 },
  { id: 'record', name: 'Marca propia', xp: 40 },
  { id: 'cenit', name: 'Cénit', xp: 200 },
  { id: 'mitad', name: 'Mitad del camino', xp: 40 },
  { id: 'bascula', name: 'En la báscula', xp: 40 },
  { id: 'respaldo', name: 'Respaldo', xp: 40 },
  { id: 'forja', name: 'Forja propia', xp: 40 },
  { id: 'sustituto', name: 'Cambio en la sala', xp: 40 },
  { id: 'descarga', name: 'Descarga hecha', xp: 40 },
  { id: 'nivel_10', name: 'Nivel 10', xp: 40 },
  { id: 'nivel_25', name: 'Nivel 25', xp: 40 },
  { id: 'nivel_50', name: 'Nivel 50', xp: 80 },
]

export interface AchievementContext {
  owned: string[]
  completedSessions: number
  gymStreak: number
  hadRecord: boolean
  cenit: boolean
  mitad: boolean
  bodyWeights: number
  exported: boolean
  routines: number
  substitutedSession: boolean
  deloadWeekMet: boolean
  level: number
}

export function newAchievements(ctx: AchievementContext): AchievementDef[] {
  const owned = new Set(ctx.owned)
  const checks: [string, boolean][] = [
    ['primera_chispa', ctx.completedSessions >= 1],
    ['bitacora', ctx.completedSessions >= 4],
    ['diez', ctx.completedSessions >= 10],
    ['veinticinco', ctx.completedSessions >= 25],
    ['cincuenta', ctx.completedSessions >= 50],
    ['semana', ctx.gymStreak >= 1],
    ['cuatro_semanas', ctx.gymStreak >= 4],
    ['record', ctx.hadRecord],
    ['cenit', ctx.cenit],
    ['mitad', ctx.mitad],
    ['bascula', ctx.bodyWeights >= 1],
    ['respaldo', ctx.exported],
    ['forja', ctx.routines >= 1],
    ['sustituto', ctx.substitutedSession],
    ['descarga', ctx.deloadWeekMet],
    ['nivel_10', ctx.level >= 10],
    ['nivel_25', ctx.level >= 25],
    ['nivel_50', ctx.level >= 50],
  ]
  const fresh: AchievementDef[] = []
  for (const [id, ok] of checks) {
    if (!ok || owned.has(id)) continue
    const def = ACHIEVEMENTS.find((item) => item.id === id)
    if (def) fresh.push(def)
  }
  return fresh
}
