import { muscleGroupFromDb } from './labels'
import type { CustomExercise, DbExercise, LibraryExercise, Logging, PoolExercise } from './types'

export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

export function loggingFor(exercise: { id: string; categoria?: string; logging?: Logging }): Logging {
  if (exercise.logging) return exercise.logging
  if (exercise.id === 'Plank') return 'tiempo'
  if (exercise.categoria === 'cardio') return 'distancia'
  if (exercise.categoria === 'estiramiento' || exercise.categoria === 'stretching') return 'tiempo'
  return 'reps_peso'
}

export function mergeLibrary(base: DbExercise[], pool: PoolExercise[], custom: CustomExercise[]): LibraryExercise[] {
  const poolMap = new Map(pool.map((exercise) => [exercise.id, exercise]))
  const fromBase: LibraryExercise[] = base.map((exercise) => {
    const planned = poolMap.get(exercise.id) ?? null
    const pasos = planned ? planned.pasos : exercise.instrucciones
    const avisoIdioma = !planned && exercise.instrucciones.length === 0 && exercise.instruccionesOriginal.length > 0
    return {
      id: exercise.id,
      nombre: planned?.nombre ?? exercise.nombre,
      nombreOriginal: exercise.nombreOriginal,
      pasos: pasos.length > 0 ? pasos : exercise.instruccionesOriginal,
      pasosDePool: Boolean(planned),
      avisoIdioma,
      musculosPrimarios: exercise.musculosPrimarios,
      musculosSecundarios: exercise.musculosSecundarios,
      equipo: exercise.equipo,
      categoria: exercise.categoria,
      nivel: exercise.nivel,
      fuerza: exercise.fuerza,
      mecanica: exercise.mecanica,
      imagenes: exercise.imagenes,
      muscleGroup: planned?.muscleGroup ?? muscleGroupFromDb(exercise.musculosPrimarios[0]),
      compound: planned ? planned.compound : exercise.mecanica === 'compuesto',
      logging: planned?.logging ?? loggingFor(exercise),
      custom: false,
      pool: planned,
    }
  })
  const known = new Set(fromBase.map((exercise) => exercise.id))
  const fromPool = pool.filter((exercise) => !known.has(exercise.id)).map((exercise) => ({
    id: exercise.id,
    nombre: exercise.nombre,
    nombreOriginal: exercise.id,
    pasos: exercise.pasos,
    pasosDePool: true,
    avisoIdioma: false,
    musculosPrimarios: [],
    musculosSecundarios: [],
    equipo: exercise.equipo.includes('cuerpo') ? 'peso-corporal' : exercise.equipo[0] ?? 'sin-especificar',
    categoria: 'fuerza',
    nivel: 'principiante',
    fuerza: null,
    mecanica: exercise.compound ? 'compuesto' : 'aislamiento',
    imagenes: [`images/${exercise.id}/0.webp`, `images/${exercise.id}/1.webp`],
    muscleGroup: exercise.muscleGroup,
    compound: exercise.compound,
    logging: exercise.logging,
    custom: false,
    pool: exercise,
  }))
  const fromCustom: LibraryExercise[] = custom.map((exercise) => ({
    id: exercise.id,
    nombre: exercise.nombre,
    nombreOriginal: exercise.nombre,
    pasos: [],
    pasosDePool: false,
    avisoIdioma: false,
    musculosPrimarios: exercise.musculosPrimarios,
    musculosSecundarios: [],
    equipo: exercise.equipo,
    categoria: 'fuerza',
    nivel: 'principiante',
    fuerza: null,
    mecanica: exercise.mecanica,
    imagenes: [],
    muscleGroup: muscleGroupFromDb(exercise.musculosPrimarios[0]),
    compound: exercise.mecanica === 'compuesto',
    logging: exercise.logging,
    custom: true,
    pool: null,
  }))
  return [...fromBase, ...fromPool, ...fromCustom]
}

export function filterLibrary(
  exercises: LibraryExercise[],
  input: { query: string; muscles: string[]; equipment: string[]; categories: string[]; levels: string[] },
): LibraryExercise[] {
  const query = normalizeSearch(input.query.trim())
  return exercises.filter((exercise) => {
    if (query) {
      const haystack = normalizeSearch(`${exercise.nombre} ${exercise.nombreOriginal} ${exercise.id.replaceAll('_', ' ')}`)
      if (!haystack.includes(query)) return false
    }
    if (input.muscles.length > 0 && !exercise.musculosPrimarios.some((muscle) => input.muscles.includes(muscle))) return false
    if (input.equipment.length > 0) {
      const sinMaterial = input.equipment.includes('sin-material')
      const wanted = input.equipment.filter((item) => item !== 'sin-material')
      const isBody = exercise.equipo === 'peso-corporal' || exercise.equipo === 'sin-especificar' || exercise.equipo === 'cuerpo'
      const matchesNamed = wanted.includes(exercise.equipo)
      const matchesBody = sinMaterial && isBody
      if (!matchesNamed && !matchesBody) return false
    }
    if (input.categories.length > 0 && !input.categories.includes(exercise.categoria)) return false
    if (input.levels.length > 0 && !input.levels.includes(exercise.nivel)) return false
    return true
  })
}
