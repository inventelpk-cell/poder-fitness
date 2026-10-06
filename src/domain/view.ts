import { addDays, mondayOf } from './dates'
import type { Arc, WorkoutSession } from './types'

export function activeArc(arcs: Arc[]): Arc | null {
  return arcs.find((arc) => arc.status === 'activo') ?? null
}

export function weekSessionCount(sessions: WorkoutSession[], today: string): number {
  const monday = mondayOf(today)
  const sunday = addDays(monday, 6)
  return sessions.filter((session) => session.status === 'completado' && session.date >= monday && session.date <= sunday).length
}
