import { normalizeSearch } from '../domain/library'
import { catalogEquipToProfile, equipmentCovered } from '../domain/labels'
import type { EquipId, LibraryExercise } from '../domain/types'

const GEAR_OUTSIDE_PROFILE = new Set(['otro', 'rodillo', 'balon-medicinal', 'pelota'])

export function isSquatOrLunge(nombre: string, roles: readonly string[]): boolean {
  const name = normalizeSearch(nombre)
  return name.includes('sentadilla') || name.includes('zancada') || roles.includes('sentadilla')
}

export function gearFitsProfile(exercise: Pick<LibraryExercise, 'equipo' | 'pool'>, owned: EquipId[]): boolean {
  if (exercise.pool) return equipmentCovered(exercise.pool.equipo, owned)
  if (GEAR_OUTSIDE_PROFILE.has(exercise.equipo)) return false
  return equipmentCovered(catalogEquipToProfile(exercise.equipo), owned)
}

export function substituteList(input: {
  exercises: LibraryExercise[]
  block: { exerciseId: string; nombre: string; musculosPrimarios: string[] }
  owned: EquipId[]
  query: string
}): LibraryExercise[] {
  const source = input.exercises.find((exercise) => exercise.id === input.block.exerciseId)
  const family = isSquatOrLunge(input.block.nombre, source?.pool?.roles ?? [])
  const primary = input.block.musculosPrimarios[0]
  const text = normalizeSearch(input.query.trim())
  return input.exercises.filter((exercise) => {
    if (exercise.id === input.block.exerciseId) return false
    if (!primary || exercise.musculosPrimarios[0] !== primary) return false
    if (!gearFitsProfile(exercise, input.owned)) return false
    if (family && !isSquatOrLunge(exercise.nombre, exercise.pool?.roles ?? [])) return false
    if (text.length > 0 && !normalizeSearch(exercise.nombre).includes(text)) return false
    return true
  })
}
