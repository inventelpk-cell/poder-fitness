import { describe, expect, it } from 'vitest'
import exercisesJson from '../../data/exercises/exercises.json'
import poolJson from '../../data/exercises/plan-pool.es.json'
import { mergeLibrary } from '../domain/library'
import type { DbExercise, PoolExercise } from '../domain/types'
import { substituteList } from './substitutes'

const library = mergeLibrary(exercisesJson as DbExercise[], poolJson as PoolExercise[], [])

describe('sustitutos de la sentadilla', () => {
  it('con solo cuerpo la lista visible son sentadillas o zancadas', () => {
    const list = substituteList({
      exercises: library,
      block: { exerciseId: 'Bodyweight_Squat', nombre: 'Sentadilla', musculosPrimarios: ['cuadriceps'] },
      owned: ['cuerpo'],
      query: '',
    })
    const names = list.map((exercise) => exercise.nombre)
    expect(names.length).toBeGreaterThan(0)
    expect(names.some((name) => name.toLowerCase().includes('sentadilla'))).toBe(true)
    expect(names.some((name) => name.toLowerCase().includes('zancada'))).toBe(true)
    expect(names.every((name) => /sentadilla|zancada/i.test(name))).toBe(true)
    expect(names).not.toContain('Estiramiento de cuádriceps a cuatro patas')
    expect(names).not.toContain('Ciclismo')
    expect(names).not.toContain('Peso muerto de coche')
    expect(names).not.toContain('Rueda de Conan')
  })
})
