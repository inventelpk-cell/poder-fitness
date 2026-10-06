import type { BackupFile, XpEvent } from './types'

const ARRAY_KEYS = [
  'exercisesCustom',
  'routines',
  'arcs',
  'sessions',
  'memory',
  'bodyWeight',
  'heroManual',
  'heroDays',
  'xpEvents',
  'achievements',
] as const

export function xpTotalOf(events: XpEvent[]): number {
  return events.reduce((sum, event) => sum + event.amount, 0)
}

export function parseBackup(input: unknown): { ok: true; file: BackupFile } | { ok: false; error: string } {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'Este archivo no es una copia de Poder Fitness' }
  }
  const data = input as Record<string, unknown>
  if (data.schemaVersion !== 1 || data.app !== 'poder-fitness') {
    return { ok: false, error: 'Este archivo no es una copia de Poder Fitness' }
  }
  for (const key of ARRAY_KEYS) {
    if (!Array.isArray(data[key])) return { ok: false, error: 'Este archivo no es una copia de Poder Fitness' }
  }
  if (!data.streaks || typeof data.streaks !== 'object') {
    return { ok: false, error: 'Este archivo no es una copia de Poder Fitness' }
  }
  return { ok: true, file: data as unknown as BackupFile }
}
