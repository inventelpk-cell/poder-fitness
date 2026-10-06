import { describe, expect, it } from 'vitest'
import poolJson from '../../data/exercises/plan-pool.es.json'
import { parseBackup, xpTotalOf } from './backup'
import { e1rmRounded } from './e1rm'
import { addHeroManual, defaultQuota, emptyHeroStreak, ensureHeroShield, isCenit, registerHeroActivity } from './hero'
import { equipmentCovered } from './labels'
import { createArc, onboardingWeekGoal, selectSessionExercises, weekPatterns } from './plan'
import { applyWorkingSets } from './progression'
import { rankForLevel } from './ranks'
import { sessionXp, setXp, xpParaSubir } from './xp'
import { emptyGymStreak, evaluateGymStreak, freezeWeekGoal } from './streaks'
import { kgToDisplayLb } from './units'
import type { EquipId, Pattern, PoolExercise } from './types'

const pool = poolJson as PoolExercise[]

const BEGINNER: Pattern[][] = [
  ['cuerpo'],
  ['cuerpo', 'cuerpo'],
  ['cuerpo', 'cuerpo', 'cuerpo'],
  ['torso', 'pierna', 'torso', 'pierna'],
  ['torso', 'pierna', 'torso', 'pierna', 'cuerpo'],
  ['torso', 'pierna', 'torso', 'pierna', 'cuerpo', 'cuerpo'],
]
const LIFTED: Pattern[][] = [
  ['cuerpo'],
  ['cuerpo', 'cuerpo'],
  ['empuje', 'tiron', 'pierna'],
  ['torso', 'pierna', 'torso', 'pierna'],
  ['empuje', 'tiron', 'pierna', 'torso', 'pierna'],
  ['empuje', 'tiron', 'pierna', 'empuje', 'tiron', 'pierna'],
]

function idsFor(equipment: EquipId[], pattern: Pattern = 'cuerpo', appearance = 0) {
  return selectSessionExercises({
    pattern,
    appearance,
    level: 'intermedio',
    goal: 'hipertrofia',
    week: 1,
    equipment,
    pool,
  }).map((exercise) => exercise.id)
}

describe('patrones semanales', () => {
  it('cubre las 12 combinaciones y avanzado coincide con intermedio', () => {
    for (let days = 1; days <= 6; days += 1) {
      expect(weekPatterns('principiante', days)).toEqual(BEGINNER[days - 1])
      expect(weekPatterns('intermedio', days)).toEqual(LIFTED[days - 1])
      expect(weekPatterns('avanzado', days)).toEqual(weekPatterns('intermedio', days))
    }
  })
})

describe('selector', () => {
  it('respeta el equipo y rota la segunda aparición si hay alternativa', () => {
    const profiles: EquipId[][] = [
      ['cuerpo'],
      ['cuerpo', 'mancuernas'],
      ['cuerpo', 'barra', 'banco', 'dominadas'],
    ]
    for (const equipment of profiles) {
      for (const id of idsFor(equipment, 'empuje')) {
        const exercise = pool.find((item) => item.id === id)
        expect(exercise).toBeTruthy()
        expect(equipmentCovered(exercise!.equipo, equipment)).toBe(true)
      }
    }
    const first = idsFor(['cuerpo', 'mancuernas'], 'cuerpo', 0)
    const second = idsFor(['cuerpo', 'mancuernas'], 'cuerpo', 1)
    expect(first[0]).not.toBe(second[0])
    expect(first[0]).toBe('Goblet_Squat')
    expect(second[0]).toBe('Dumbbell_Squat')
  })

  it('con solo cuerpo no mete barra ni polea', () => {
    const arc = createArc({
      profile: { level: 'principiante', goal: 'fuerza', equipment: ['cuerpo'], daysPerWeek: 3, weekdays: [0, 2, 4] },
      pool,
      memory: [],
      arcIndex: 1,
      startsOn: '2026-10-05',
      today: '2026-10-05',
      barWeightKg: 20,
    })
    const ids = arc.sessions[0]?.exercises.map((exercise) => exercise.exerciseId) ?? []
    expect(ids).toEqual(['Bodyweight_Squat', 'Pushups', 'Inverted_Row', 'Single_Leg_Glute_Bridge', 'Plank'])
  })
})

describe('semana 4', () => {
  it('deja 2 series, sin finisher, y no baja la memoria', () => {
    const arc = createArc({
      profile: { level: 'principiante', goal: 'perdida_grasa', equipment: ['cuerpo'], daysPerWeek: 3, weekdays: [0, 2, 4] },
      pool,
      memory: [],
      arcIndex: 1,
      startsOn: '2026-10-05',
      today: '2026-10-05',
      barWeightKg: 20,
    })
    const deload = arc.sessions.filter((session) => session.weekIndex === 4)
    expect(deload.length).toBeGreaterThan(0)
    for (const session of deload) {
      expect(session.exercises.every((exercise) => exercise.sets === 2)).toBe(true)
      expect(session.exercises.some((exercise) => exercise.role === 'finisher')).toBe(false)
    }
    const prev = {
      exerciseId: 'Pushups',
      lastWorkingSets: [{ weightKg: 60, reps: 8 }, { weightKg: 60, reps: 8 }, { weightKg: 60, reps: 8 }],
      nextWeightKg: 60,
      nextReps: 8,
      bestE1rmKg: 80,
      bestReps: [{ weightKg: 60, reps: 8 }],
    }
    const kept = applyWorkingSets(prev, {
      exerciseId: 'Pushups',
      nombre: 'Flexión',
      working: [{ weightKg: 40, reps: 8 }, { weightKg: 40, reps: 8 }],
      minReps: 8,
      maxReps: 12,
      plannedSets: 2,
      incrementKg: 2.5,
      deload: true,
      plank: false,
      unit: 'kg',
    })
    expect(kept.memory.nextWeightKg).toBe(60)
    expect(kept.memory.nextReps).toBe(8)
  })
})

describe('epley', () => {
  it('redondea los ejemplos y rechaza repeticiones o peso fuera de rango', () => {
    expect(e1rmRounded(100, 5)).toBe(116.7)
    expect(e1rmRounded(80, 10)).toBe(106.7)
    expect(e1rmRounded(100, 0)).toBeNull()
    expect(e1rmRounded(100, 11)).toBeNull()
    expect(e1rmRounded(0, 5)).toBeNull()
  })
})

describe('doble progresión', () => {
  const base = {
    exerciseId: 'Barbell_Full_Squat',
    nombre: 'Sentadilla con barra',
    minReps: 8,
    maxReps: 12,
    plannedSets: 3,
    incrementKg: 2.5,
    plank: false,
    unit: 'kg' as const,
  }
  it('sube solo cuando todas las series coinciden en el tope', () => {
    const up = applyWorkingSets(undefined, {
      ...base,
      deload: false,
      working: [{ weightKg: 50, reps: 12 }, { weightKg: 50, reps: 12 }, { weightKg: 50, reps: 12 }],
    })
    expect(up.memory.nextWeightKg).toBe(52.5)
    expect(up.memory.nextReps).toBe(8)
    const short = applyWorkingSets(undefined, {
      ...base,
      deload: false,
      working: [{ weightKg: 50, reps: 12 }, { weightKg: 50, reps: 12 }],
    })
    expect(short.memory.nextWeightKg).toBe(50)
    expect(short.memory.nextReps).toBe(12)
    const mixed = applyWorkingSets(undefined, {
      ...base,
      deload: false,
      working: [{ weightKg: 50, reps: 12 }, { weightKg: 50, reps: 12 }, { weightKg: 55, reps: 12 }],
    })
    expect(mixed.memory.nextWeightKg).toBe(55)
    expect(mixed.progressed).toBe(false)
  })
})

describe('xp', () => {
  it('calcula el vector de 184, el tope de 600 y el calentamiento a cero', () => {
    const vector = sessionXp({
      goal: 'hipertrofia',
      recordXp: 0,
      exercises: [
        {
          skipped: false,
          setsPlanned: 3,
          compound: true,
          logging: 'reps_peso',
          sets: [0, 1, 2].map(() => ({ kind: 'trabajo' as const, done: true, weightKg: 100, reps: 8, seconds: 0, km: 0 })),
        },
        {
          skipped: false,
          setsPlanned: 3,
          compound: false,
          logging: 'reps_peso',
          sets: [0, 1, 2].map(() => ({ kind: 'trabajo' as const, done: true, weightKg: 20, reps: 12, seconds: 0, km: 0 })),
        },
      ],
    })
    expect(vector.total).toBe(184)
    const heavy = sessionXp({
      goal: 'fuerza',
      recordXp: 0,
      exercises: [{
        skipped: false,
        setsPlanned: 30,
        compound: true,
        logging: 'reps_peso',
        sets: Array.from({ length: 30 }, () => ({ kind: 'trabajo' as const, done: true, weightKg: 100, reps: 10, seconds: 0, km: 0 })),
      }],
    })
    expect(heavy.total).toBe(600)
    expect(setXp({
      goal: 'hipertrofia',
      compound: true,
      weightKg: 100,
      reps: 10,
      done: true,
      kind: 'calentamiento',
      logging: 'reps_peso',
      seconds: 0,
      km: 0,
    })).toEqual({ series: 0, volumen: 0 })
  })

  it('tabla de xpParaSubir del 1 al 10', () => {
    const table = [100, 238, 395, 566, 748, 939, 1139, 1345, 1559, 1778]
    table.forEach((value, index) => {
      expect(xpParaSubir(index + 1)).toBe(value)
    })
  })
})

describe('rangos', () => {
  it('asigna el rango de los niveles de control', () => {
    expect(rankForLevel(1).id).toBe('chispa')
    expect(rankForLevel(3).id).toBe('chispa')
    expect(rankForLevel(4).id).toBe('brasa')
    expect(rankForLevel(8).id).toBe('pulso')
    expect(rankForLevel(99).id).toBe('corona')
    expect(rankForLevel(100).id).toBe('mito')
  })
})

describe('reto y constancia', () => {
  it('banda, suma parcial, cénit y escudo', () => {
    expect(defaultQuota(2)).toEqual({ pushups: 20, abs: 20, squats: 20, km: 1 })
    expect(defaultQuota(6)).toEqual({ pushups: 40, abs: 40, squats: 40, km: 2 })
    expect(defaultQuota(10)).toEqual({ pushups: 60, abs: 60, squats: 60, km: 4 })
    expect(defaultQuota(20)).toEqual({ pushups: 80, abs: 80, squats: 80, km: 6 })
    expect(defaultQuota(30)).toEqual({ pushups: 100, abs: 100, squats: 100, km: 10 })
    const start = { quota: defaultQuota(1), manual: { pushups: 0, abs: 0, squats: 0, km: 0 }, manualXp: 0, bonusGranted: false }
    const first = addHeroManual(start, { pushups: 10, abs: 0, squats: 0, km: 0 }, { pushups: 0, abs: 0, squats: 0, km: 0 })
    const second = addHeroManual(first.day, { pushups: 10, abs: 0, squats: 0, km: 0 }, { pushups: 0, abs: 0, squats: 0, km: 0 })
    expect(second.day.manual.pushups).toBe(20)
    expect(isCenit({ pushups: 100, abs: 100, squats: 100, km: 10 })).toBe(true)
    let streak = emptyHeroStreak('2026-10-05')
    streak = registerHeroActivity(streak, '2026-10-05').state
    const covered = registerHeroActivity(streak, '2026-10-07')
    expect(covered.shieldedDate).toBe('2026-10-06')
    expect(covered.state.shield).toBe(0)
    expect(covered.state.streak).toBe(3)
    const tooWide = registerHeroActivity(streak, '2026-10-08')
    expect(tooWide.shieldedDate).toBeNull()
    expect(tooWide.state.streak).toBe(1)
    expect(tooWide.state.shield).toBe(1)
    expect(ensureHeroShield(covered.state, '2026-10-12').shield).toBe(1)
  })

  it('recorta la primera semana, cumple a mitad, falla al cerrar y no toca la meta congelada', () => {
    expect(onboardingWeekGoal('2026-10-09', [0, 2, 4])).toBe(1)
    expect(onboardingWeekGoal('2026-10-11', [0, 2, 4])).toBe(0)
    let gym = freezeWeekGoal(emptyGymStreak(), '2026-10-05', 1)
    gym = evaluateGymStreak(gym, '2026-10-09', ['2026-10-09'])
    expect(gym.streak).toBe(1)
    gym = freezeWeekGoal(gym, '2026-10-12', 3)
    gym = freezeWeekGoal(gym, '2026-10-12', 6)
    expect(gym.weekGoals['2026-10-12']).toBe(3)
    gym = evaluateGymStreak(gym, '2026-10-19', ['2026-10-09', '2026-10-13', '2026-10-15'])
    expect(gym.streak).toBe(0)
    let quiet = emptyGymStreak()
    quiet.streak = 2
    quiet = freezeWeekGoal(quiet, '2026-10-05', 0)
    quiet = evaluateGymStreak(quiet, '2026-10-12', ['2026-10-11'])
    expect(quiet.streak).toBe(2)
  })
})

describe('unidades e importación', () => {
  it('muestra 60 kg como 132,3 lb sin tocar el valor guardado', () => {
    const stored = 60
    expect(kgToDisplayLb(stored)).toBe(132.3)
    expect(stored).toBe(60)
  })

  it('rechaza la versión 2 y conserva el XP de la versión 1', () => {
    const rejected = parseBackup({
      schemaVersion: 2,
      app: 'poder-fitness',
      exercisesCustom: [],
      routines: [],
      arcs: [],
      sessions: [],
      memory: [],
      bodyWeight: [],
      heroManual: [],
      heroDays: [],
      xpEvents: [],
      achievements: [],
      streaks: {},
    })
    expect(rejected.ok).toBe(false)
    const accepted = parseBackup({
      schemaVersion: 1,
      app: 'poder-fitness',
      profile: null,
      settings: {},
      exercisesCustom: [],
      routines: [],
      arcs: [],
      sessions: [],
      memory: [],
      bodyWeight: [],
      heroManual: [],
      heroDays: [],
      xpEvents: [{ id: 'e1', at: '2026-10-06T00:00:00.000Z', amount: 184, kind: 'session' }],
      achievements: [],
      streaks: { xpTotal: 184, level: 2 },
    })
    expect(accepted.ok).toBe(true)
    if (accepted.ok) expect(xpTotalOf(accepted.file.xpEvents)).toBe(184)
  })
})
