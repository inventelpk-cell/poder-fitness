import type { WorkoutSession } from '../domain/types'

export interface BadgeView {
  id: string
  name: string
  unlocked: boolean
}

export function badgeGallery(input: {
  owned: string[]
  sessions: WorkoutSession[]
}): BadgeView[] {
  const owned = new Set(input.owned)
  const completed = input.sessions.filter((session) => session.status === 'completado')
  const hours = completed.map((session) => (session.startedAt ? new Date(session.startedAt).getHours() : 12))
  const checks: Record<string, boolean> = {
    'primer-entreno': owned.has('primera_chispa') || completed.length >= 1,
    racha: owned.has('semana') || owned.has('cuatro_semanas'),
    'reto-heroe': owned.has('cenit') || owned.has('mitad'),
    record: owned.has('record'),
    constancia: owned.has('bitacora') || owned.has('semana'),
    volumen: owned.has('diez') || owned.has('veinticinco') || owned.has('cincuenta'),
    madrugada: hours.some((hour) => hour < 7),
    'noche-hierro': hours.some((hour) => hour >= 21),
    'semana-plena': owned.has('semana'),
    'cien-sesiones': completed.length >= 100,
    superacion: owned.has('record') || owned.has('nivel_10') || owned.has('nivel_25') || owned.has('nivel_50'),
    equilibrio: owned.has('mitad'),
    guardia: owned.has('descarga'),
    precision: owned.has('sustituto') || owned.has('forja'),
  }
  const names: Record<string, string> = {
    'primer-entreno': 'Primer entreno',
    racha: 'Racha',
    'reto-heroe': 'Reto del héroe',
    record: 'Récord',
    constancia: 'Constancia',
    volumen: 'Volumen',
    madrugada: 'Madrugador',
    'noche-hierro': 'Noche de hierro',
    'semana-plena': 'Semana plena',
    'cien-sesiones': 'Cien sesiones',
    superacion: 'Superación',
    equilibrio: 'Equilibrio',
    guardia: 'Guardia',
    precision: 'Precisión',
  }
  return Object.keys(names).map((id) => ({ id, name: names[id] ?? id, unlocked: checks[id] ?? false }))
}
