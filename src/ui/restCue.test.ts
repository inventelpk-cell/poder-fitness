import { describe, expect, it } from 'vitest'
import { cuesAcross } from './restCue'

describe('avisos del descanso', () => {
  it('anuncia inicio, 10 s, 5 s y cero en un descanso de 10 s', () => {
    const samples = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    expect(cuesAcross(samples)).toEqual([
      'Empieza el descanso',
      'Quedan 10 segundos',
      'Quedan 5 segundos',
      'Descanso terminado',
    ])
  })

  it('no repite el aviso de 10 s si el descanso ya empezó por debajo', () => {
    expect(cuesAcross([30, 20, 10, 5, 0])).toEqual([
      'Empieza el descanso',
      'Quedan 10 segundos',
      'Quedan 5 segundos',
      'Descanso terminado',
    ])
  })
})
