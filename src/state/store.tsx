import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getDb, wipeDatabase, type PoderDB } from '../data/db'
import { PLAN_POOL } from '../data/pool'
import { parseBackup, xpTotalOf } from '../domain/backup'
import { mondayOf, todayISO } from '../domain/dates'
import { addHeroManual, combinedTotals, defaultQuota, emptyHeroStreak, ensureHeroShield, isCenit, isMitad, quotaMet, registerHeroActivity } from '../domain/hero'
import { defaultSettings } from '../domain/labels'
import { mergeLibrary } from '../domain/library'
import { arcEnd, createArc, onboardingWeekGoal, regenerateFuture, swapPlannedDates } from '../domain/plan'
import { newAchievements, rankForLevel, type AchievementDef } from '../domain/ranks'
import { blankSession, closeSession, exerciseFromPlan, exerciseFromRoutine, heroRepsFromSession } from '../domain/session'
import { emptyGymStreak, evaluateGymStreak, freezeWeekGoal } from '../domain/streaks'
import { applyXpDelta, levelFromTotal } from '../domain/xp'
import { activeArc, weekSessionCount } from '../domain/view'
import type {
  AchievementUnlock,
  Arc,
  BackupFile,
  BodyWeightEntry,
  CustomExercise,
  DbExercise,
  ExerciseMemory,
  HeroDay,
  HeroQuota,
  HeroQuotaLog,
  LibraryExercise,
  Profile,
  Routine,
  Settings,
  StreakState,
  PlannedExercise,
  WorkoutSession,
  XpEvent,
} from '../domain/types'

interface RankReveal {
  from: string
  to: string
}

interface Snapshot {
  profile: Profile | null
  settings: Settings
  exercises: LibraryExercise[]
  libraryMissing: boolean
  routines: Routine[]
  arcs: Arc[]
  sessions: WorkoutSession[]
  memory: ExerciseMemory[]
  bodyWeight: BodyWeightEntry[]
  heroDays: HeroDay[]
  heroManual: HeroQuotaLog[]
  xpEvents: XpEvent[]
  achievements: AchievementUnlock[]
  streaks: StreakState
}

interface PoderValue extends Snapshot {
  ready: boolean
  error: string | null
  toast: string | null
  rankReveal: RankReveal | null
  achievementQueue: AchievementDef[]
  replay: RankReveal | null
  finishOnboarding: (profile: Profile) => Promise<void>
  updateProfile: (profile: Profile) => Promise<void>
  updateSettings: (settings: Settings) => Promise<void>
  startPlanned: (plannedId: string) => Promise<WorkoutSession | null>
  startRoutine: (routineId: string) => Promise<WorkoutSession | null>
  startLoose: () => Promise<WorkoutSession | null>
  discardOpen: () => Promise<void>
  openSession: () => WorkoutSession | null
  persistSession: (session: WorkoutSession) => Promise<boolean>
  closeWorkout: (session: WorkoutSession) => Promise<void>
  discardWorkout: (session: WorkoutSession) => Promise<void>
  swapDates: (dateA: string, dateB: string) => Promise<void>
  beginNewArc: () => Promise<void>
  saveRoutine: (routine: Routine) => Promise<void>
  deleteRoutine: (id: string) => Promise<void>
  saveCustom: (exercise: CustomExercise) => Promise<void>
  addHero: (delta: HeroQuota) => Promise<void>
  addWeight: (kg: number) => Promise<void>
  exportJson: () => Promise<void>
  importJson: (raw: unknown) => Promise<boolean>
  wipe: () => Promise<void>
  dismissRank: () => Promise<void>
  dismissReplay: () => void
  dismissAchievement: () => void
  replayRank: () => void
  clearToast: () => void
  refresh: () => Promise<void>
  ensureTodayHero: () => Promise<void>
  rewriteFutureExercise: (
    fromId: string,
    next: Pick<PlannedExercise, 'exerciseId' | 'nombre' | 'logging' | 'compound' | 'equipo' | 'muscleGroup'>,
  ) => Promise<void>
}

const PoderContext = createContext<PoderValue | null>(null)

function emptyStreaks(today: string): StreakState {
  return { gym: emptyGymStreak(), hero: emptyHeroStreak(today), xpTotal: 0, level: 1 }
}

async function sha(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function seedExercises(db: PoderDB): Promise<boolean> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}exercises/exercises.json`)
    if (!response.ok) return false
    const text = await response.text()
    const hash = await sha(text)
    const previous = await db.get('meta', 'exerciseHash')
    if (previous === hash) return true
    const list = JSON.parse(text) as DbExercise[]
    const tx = db.transaction(['exercises', 'meta'], 'readwrite')
    await tx.objectStore('exercises').clear()
    for (const exercise of list) await tx.objectStore('exercises').put(exercise)
    await tx.objectStore('meta').put(hash, 'exerciseHash')
    await tx.done
    return true
  } catch {
    return false
  }
}

async function readSnapshot(db: PoderDB): Promise<Snapshot> {
  const libraryReady = await seedExercises(db)
  const [profile, settings, streaks, base, customs, routines, arcs, sessions, memory, bodyWeight, heroManual, heroDays, xpEvents, achievements] = await Promise.all([
    db.get('meta', 'profile') as Promise<Profile | undefined>,
    db.get('meta', 'settings') as Promise<Settings | undefined>,
    db.get('meta', 'streaks') as Promise<StreakState | undefined>,
    db.getAll('exercises'),
    db.getAll('customs'),
    db.getAll('routines'),
    db.getAll('arcs'),
    db.getAll('sessions'),
    db.getAll('memory'),
    db.getAll('bodyWeight'),
    db.getAll('heroManual'),
    db.getAll('heroDays'),
    db.getAll('xpEvents'),
    db.getAll('achievements'),
  ])
  const today = todayISO()
  const next: Snapshot = {
    profile: profile ?? null,
    settings: settings ?? defaultSettings(),
    exercises: mergeLibrary(base, PLAN_POOL, customs),
    libraryMissing: !libraryReady && base.length === 0,
    routines,
    arcs,
    sessions,
    memory,
    bodyWeight,
    heroManual,
    heroDays,
    xpEvents,
    achievements,
    streaks: streaks ?? emptyStreaks(today),
  }
  return reconcile(next)
}

function reconcile(data: Snapshot): Snapshot {
  if (!data.profile) return data
  const today = todayISO()
  let arcs = data.arcs.map((arc) => ({ ...arc, sessions: arc.sessions.map((session) => ({ ...session })) }))
  let active = arcs.find((arc) => arc.status === 'activo')
  if (active && today > arcEnd(active.startsOn)) {
    active.status = 'cerrado'
    active.sessions = active.sessions.map((session) => session.status === 'planificado' ? { ...session, status: 'cancelado' as const } : session)
    const created = createArc({
      profile: data.profile,
      pool: PLAN_POOL,
      memory: data.memory,
      arcIndex: active.index + 1,
      startsOn: mondayOf(today),
      today,
      barWeightKg: data.settings.barWeightKg,
    })
    arcs = [...arcs.filter((arc) => arc.id !== active?.id), active, created]
  } else if (active) {
    active.sessions = active.sessions.map((session) => session.status === 'planificado' && session.date < today
      ? { ...session, status: 'omitido' as const }
      : session)
    arcs = arcs.map((arc) => arc.id === active?.id ? active! : arc)
  }
  let gym = freezeWeekGoal(data.streaks.gym, mondayOf(today), data.profile.daysPerWeek)
  gym = evaluateGymStreak(gym, today, data.sessions.filter((session) => session.status === 'completado').map((session) => session.date))
  const hero = ensureHeroShield(data.streaks.hero, today)
  return { ...data, arcs, streaks: { ...data.streaks, gym, hero } }
}

async function persistMeta(db: PoderDB, data: Pick<Snapshot, 'profile' | 'settings' | 'streaks' | 'arcs'>) {
  const tx = db.transaction(['meta', 'arcs'], 'readwrite')
  if (data.profile) await tx.objectStore('meta').put(data.profile, 'profile')
  await tx.objectStore('meta').put(data.settings, 'settings')
  await tx.objectStore('meta').put(data.streaks, 'streaks')
  for (const arc of data.arcs) await tx.objectStore('arcs').put(arc)
  await tx.done
}

function sessionTotals(sessions: WorkoutSession[], date: string): HeroQuota {
  return sessions.filter((session) => session.date === date).reduce<HeroQuota>((sum, session) => {
    const part = heroRepsFromSession(session)
    return {
      pushups: sum.pushups + part.pushups,
      abs: sum.abs + part.abs,
      squats: sum.squats + part.squats,
      km: 0,
    }
  }, { pushups: 0, abs: 0, squats: 0, km: 0 })
}

export function PoderProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [snap, setSnap] = useState<Snapshot | null>(null)
  const [rankReveal, setRankReveal] = useState<RankReveal | null>(null)
  const [replay, setReplay] = useState<RankReveal | null>(null)
  const [achievementQueue, setAchievementQueue] = useState<AchievementDef[]>([])

  async function reload() {
    const db = await getDb()
    const data = await readSnapshot(db)
    await persistMeta(db, data)
    setSnap(data)
  }

  useEffect(() => {
    reload().then(() => setReady(true)).catch(() => setError('No se pudo abrir la base local'))
  }, [])

  const api = useMemo<PoderValue | null>(() => {
    if (!snap) return null
    const patch = (partial: Partial<Snapshot>) => {
      setSnap((current) => (current ? { ...current, ...partial } : current))
    }

    return {
      ...snap,
      ready,
      error,
      toast,
      rankReveal,
      achievementQueue,
      replay,
      clearToast: () => setToast(null),
      openSession: () => snap.sessions.find((session) => session.status === 'en_curso') ?? null,
      finishOnboarding: async (profile) => {
        const today = todayISO()
        const settings = defaultSettings()
        const arc = createArc({
          profile,
          pool: PLAN_POOL,
          memory: [],
          arcIndex: 1,
          startsOn: mondayOf(today),
          today,
          barWeightKg: settings.barWeightKg,
        })
        const streaks = emptyStreaks(today)
        streaks.gym = freezeWeekGoal(streaks.gym, mondayOf(today), onboardingWeekGoal(today, profile.weekdays))
        const db = await getDb()
        const tx = db.transaction(['meta', 'arcs'], 'readwrite')
        await tx.objectStore('meta').put(profile, 'profile')
        await tx.objectStore('meta').put(settings, 'settings')
        await tx.objectStore('meta').put(streaks, 'streaks')
        await tx.objectStore('arcs').put(arc)
        await tx.done
        setSnap({ ...snap, profile, settings, streaks, arcs: [arc] })
      },
      updateProfile: async (profile) => {
        const today = todayISO()
        const arcs = snap.arcs.map((arc) => arc.status === 'activo'
          ? regenerateFuture(arc, { profile, pool: PLAN_POOL, memory: snap.memory, today, barWeightKg: snap.settings.barWeightKg })
          : arc)
        const db = await getDb()
        await persistMeta(db, { ...snap, profile, arcs })
        patch({ profile, arcs })
      },
      updateSettings: async (settings) => {
        const today = todayISO()
        let heroDays = snap.heroDays
        const overrideChanged = JSON.stringify(settings.heroQuotaOverride) !== JSON.stringify(snap.settings.heroQuotaOverride)
        if (overrideChanged && !heroDays.some((item) => item.date === today)) {
          const frozen: HeroDay = {
            date: today,
            quota: snap.settings.heroQuotaOverride ?? defaultQuota(snap.streaks.level),
            manual: { pushups: 0, abs: 0, squats: 0, km: 0 },
            manualXp: 0,
            bonusGranted: false,
            shield: false,
          }
          heroDays = [...heroDays, frozen]
          const database = await getDb()
          await database.put('heroDays', frozen)
        }
        const db = await getDb()
        await db.put('meta', settings, 'settings')
        patch({ settings, heroDays })
      },
      startPlanned: async (plannedId) => {
        if (snap.sessions.some((session) => session.status === 'en_curso') || !snap.profile) return null
        const arc = activeArc(snap.arcs)
        const planned = arc?.sessions.find((session) => session.id === plannedId)
        if (!arc || !planned) return null
        const memory = new Map(snap.memory.map((item) => [item.exerciseId, item]))
        const exercises = planned.exercises.map((exercise) => {
          const block = exerciseFromPlan(exercise, memory.get(exercise.exerciseId))
          const known = snap.exercises.find((item) => item.id === exercise.exerciseId)
          return { ...block, musculosPrimarios: known?.musculosPrimarios ?? [] }
        })
        const session = blankSession({
          id: crypto.randomUUID(),
          origin: 'arco',
          plannedSessionId: planned.id,
          routineId: null,
          goal: snap.profile.goal,
          level: snap.profile.level,
          deload: planned.weekIndex === 4,
          weekIndex: planned.weekIndex,
          pattern: planned.pattern,
          exercises,
          now: new Date(),
        })
        const arcs = snap.arcs.map((item) => item.id === arc.id
          ? { ...item, sessions: item.sessions.map((row) => row.id === planned.id ? { ...row, status: 'en_curso' as const } : row) }
          : item)
        const db = await getDb()
        const tx = db.transaction(['sessions', 'arcs'], 'readwrite')
        await tx.objectStore('sessions').put(session)
        for (const item of arcs) await tx.objectStore('arcs').put(item)
        await tx.done
        patch({ sessions: [...snap.sessions, session], arcs })
        return session
      },
      startRoutine: async (routineId) => {
        if (snap.sessions.some((session) => session.status === 'en_curso') || !snap.profile) return null
        const routine = snap.routines.find((item) => item.id === routineId)
        if (!routine) return null
        const memory = new Map(snap.memory.map((item) => [item.exerciseId, item]))
        const session = blankSession({
          id: crypto.randomUUID(),
          origin: 'rutina',
          plannedSessionId: null,
          routineId,
          goal: snap.profile.goal,
          level: snap.profile.level,
          deload: false,
          weekIndex: null,
          pattern: null,
          exercises: routine.exercises.map((exercise) => exerciseFromRoutine(exercise, memory.get(exercise.exerciseId))),
          now: new Date(),
        })
        const db = await getDb()
        await db.put('sessions', session)
        patch({ sessions: [...snap.sessions, session] })
        return session
      },
      startLoose: async () => {
        if (snap.sessions.some((session) => session.status === 'en_curso') || !snap.profile) return null
        const session = blankSession({
          id: crypto.randomUUID(),
          origin: 'suelta',
          plannedSessionId: null,
          routineId: null,
          goal: snap.profile.goal,
          level: snap.profile.level,
          deload: false,
          weekIndex: null,
          pattern: null,
          exercises: [],
          now: new Date(),
        })
        const db = await getDb()
        await db.put('sessions', session)
        patch({ sessions: [...snap.sessions, session] })
        return session
      },
      discardOpen: async () => {
        const open = snap.sessions.find((session) => session.status === 'en_curso')
        if (!open) return
        await apiDiscard(open)
      },
      persistSession: async (session) => {
        setSnap((current) => {
          if (!current) return current
          const exists = current.sessions.some((item) => item.id === session.id)
          const sessions = exists
            ? current.sessions.map((item) => (item.id === session.id ? session : item))
            : [...current.sessions, session]
          return { ...current, sessions }
        })
        try {
          const db = await getDb()
          await db.put('sessions', session)
          return true
        } catch {
          setToast('No se pudo guardar. Prueba otra vez')
          const db = await getDb()
          const fresh = await db.get('sessions', session.id)
          if (fresh) {
            setSnap((current) => {
              if (!current) return current
              const exists = current.sessions.some((item) => item.id === session.id)
              const sessions = exists
                ? current.sessions.map((item) => (item.id === session.id ? fresh : item))
                : [...current.sessions, fresh]
              return { ...current, sessions }
            })
          }
          return false
        }
      },
      closeWorkout: async (session) => {
        const now = new Date()
        const closed = closeSession(session, snap.memory, snap.settings.unit, now)
        let sessions = snap.sessions.map((item) => item.id === session.id ? closed.session : item)
        if (!sessions.some((item) => item.id === closed.session.id)) sessions = [...sessions, closed.session]
        let arcs = snap.arcs
        if (closed.session.plannedSessionId) {
          arcs = arcs.map((arc) => ({
            ...arc,
            sessions: arc.sessions.map((row) => row.id === closed.session.plannedSessionId ? { ...row, status: 'completado' as const } : row),
          }))
        }
        const today = closed.session.date
        let heroDays = [...snap.heroDays]
        let day = heroDays.find((item) => item.date === today) ?? {
          date: today,
          quota: snap.settings.heroQuotaOverride ?? defaultQuota(snap.streaks.level),
          manual: { pushups: 0, abs: 0, squats: 0, km: 0 },
          manualXp: 0,
          bonusGranted: false,
          shield: false,
        }
        day = { ...day, quota: day.quota }
        const totals = sessionTotals(sessions.filter((item) => item.status === 'completado' || item.id === closed.session.id), today)
        const bonus = addHeroManual(day, { pushups: 0, abs: 0, squats: 0, km: 0 }, totals)
        day = { ...bonus.day, date: today, shield: day.shield }
        heroDays = [...heroDays.filter((item) => item.date !== today), day]
        let streaks = { ...snap.streaks }
        const afterSession = applyXpDelta({ total: streaks.xpTotal, level: streaks.level }, closed.session.xp + bonus.xpDelta)
        streaks = { ...streaks, xpTotal: afterSession.total, level: afterSession.level }
        const completedDates = sessions.filter((item) => item.status === 'completado').map((item) => item.date)
        streaks = { ...streaks, gym: evaluateGymStreak(streaks.gym, todayISO(), completedDates) }
        const combined = combinedTotals(day.manual, totals)
        if (combined.pushups + combined.abs + combined.squats + combined.km > 0) {
          const hero = registerHeroActivity(streaks.hero, today)
          streaks = { ...streaks, hero: hero.state }
          if (hero.shieldedDate) {
            const covered = heroDays.find((item) => item.date === hero.shieldedDate) ?? {
              date: hero.shieldedDate,
              quota: day.quota,
              manual: { pushups: 0, abs: 0, squats: 0, km: 0 },
              manualXp: 0,
              bonusGranted: false,
              shield: true,
            }
            heroDays = [...heroDays.filter((item) => item.date !== hero.shieldedDate), { ...covered, shield: true }]
          }
        }
        const goal = streaks.gym.weekGoals[mondayOf(today)] ?? 0
        const fresh = newAchievements({
          owned: snap.achievements.map((item) => item.id),
          completedSessions: sessions.filter((item) => item.status === 'completado').length,
          gymStreak: streaks.gym.streak,
          hadRecord: closed.session.records.length > 0 || sessions.some((item) => item.records.length > 0),
          cenit: isCenit(combined) || heroDays.some((item) => isCenit(combinedTotals(item.manual, sessionTotals(sessions, item.date)))),
          mitad: isMitad(combined) || heroDays.some((item) => isMitad(combinedTotals(item.manual, sessionTotals(sessions, item.date)))),
          bodyWeights: snap.bodyWeight.length,
          exported: snap.achievements.some((item) => item.id === 'respaldo'),
          routines: snap.routines.length,
          substitutedSession: closed.session.exercises.some((exercise) => exercise.substituted),
          deloadWeekMet: Boolean(closed.session.deload && goal > 0 && weekSessionCount(sessions, today) >= goal),
          level: streaks.level,
        })
        if (fresh.length) {
          const after = applyXpDelta({ total: streaks.xpTotal, level: streaks.level }, fresh.reduce((sum, item) => sum + item.xp, 0))
          streaks = { ...streaks, xpTotal: after.total, level: after.level }
        }
        const seen = snap.settings.lastRankSeen
        const current = rankForLevel(streaks.level)
        const reveal = current.id !== seen ? { from: seen, to: current.id } : null
        const events: XpEvent[] = [
          { id: crypto.randomUUID(), at: now.toISOString(), amount: closed.session.xp, kind: 'session', breakdown: closed.session.xpBreakdown ?? undefined, ref: closed.session.id },
        ]
        if (bonus.xpDelta) events.push({ id: crypto.randomUUID(), at: now.toISOString(), amount: bonus.xpDelta, kind: 'hero', ref: today })
        const unlocked: AchievementUnlock[] = fresh.map((item) => ({ id: item.id, unlockedAt: now.toISOString(), xp: item.xp }))
        for (const item of unlocked) events.push({ id: crypto.randomUUID(), at: now.toISOString(), amount: item.xp, kind: 'achievement', ref: item.id })
        const db = await getDb()
        const tx = db.transaction(['sessions', 'arcs', 'memory', 'heroDays', 'xpEvents', 'achievements', 'meta'], 'readwrite')
        await tx.objectStore('sessions').put(closed.session)
        for (const arc of arcs) await tx.objectStore('arcs').put(arc)
        for (const item of closed.memory) await tx.objectStore('memory').put(item)
        for (const item of heroDays) await tx.objectStore('heroDays').put(item)
        for (const event of events) await tx.objectStore('xpEvents').put(event)
        for (const item of unlocked) await tx.objectStore('achievements').put(item)
        await tx.objectStore('meta').put(streaks, 'streaks')
        await tx.done
        setSnap({
          ...snap,
          sessions,
          arcs,
          memory: closed.memory,
          heroDays,
          xpEvents: [...snap.xpEvents, ...events],
          achievements: [...snap.achievements, ...unlocked],
          streaks,
        })
        if (reveal) setRankReveal(reveal)
        if (fresh.length) setAchievementQueue(fresh)
      },
      discardWorkout: async (session) => apiDiscard(session),
      swapDates: async (dateA, dateB) => {
        const arc = activeArc(snap.arcs)
        if (!arc) return
        const arcs = snap.arcs.map((item) => item.id === arc.id ? swapPlannedDates(item, dateA, dateB) : item)
        const db = await getDb()
        for (const item of arcs) await db.put('arcs', item)
        patch({ arcs })
      },
      beginNewArc: async () => {
        if (!snap.profile) return
        const today = todayISO()
        const current = activeArc(snap.arcs)
        const thisMonday = mondayOf(today)
        const completedThisWeek = snap.sessions.some((session) => session.status === 'completado' && session.date >= thisMonday && session.date <= today)
        const startsOn = completedThisWeek ? mondayOf(addDaysSafe(thisMonday, 7)) : thisMonday
        const arcs = snap.arcs.map((arc) => {
          if (arc.status !== 'activo') return arc
          return {
            ...arc,
            status: 'cerrado' as const,
            sessions: arc.sessions.map((session) => session.status === 'planificado' && session.date >= today ? { ...session, status: 'cancelado' as const } : session),
          }
        })
        const created = createArc({
          profile: snap.profile,
          pool: PLAN_POOL,
          memory: snap.memory,
          arcIndex: (current?.index ?? 0) + 1,
          startsOn,
          today,
          barWeightKg: snap.settings.barWeightKg,
        })
        const next = [...arcs, created]
        const db = await getDb()
        const tx = db.transaction('arcs', 'readwrite')
        for (const arc of next) await tx.store.put(arc)
        await tx.done
        patch({ arcs: next })
      },
      saveRoutine: async (routine) => {
        const db = await getDb()
        await db.put('routines', routine)
        const routines = [...snap.routines.filter((item) => item.id !== routine.id), routine]
        const fresh = grantStatic(snap, routines.length, snap.bodyWeight.length, true)
        patch({ routines, ...fresh.patch })
        if (fresh.queue.length) setAchievementQueue((queue) => [...queue, ...fresh.queue])
        if (fresh.streaks) {
          const database = await getDb()
          await database.put('meta', fresh.streaks, 'streaks')
        }
      },
      deleteRoutine: async (id) => {
        const db = await getDb()
        await db.delete('routines', id)
        patch({ routines: snap.routines.filter((item) => item.id !== id) })
      },
      saveCustom: async (exercise) => {
        const db = await getDb()
        await db.put('customs', exercise)
        const customs = [...(await db.getAll('customs'))]
        const base = await db.getAll('exercises')
        patch({ exercises: mergeLibrary(base, PLAN_POOL, customs) })
      },
      addHero: async (delta) => {
        const today = todayISO()
        const level = snap.streaks.level
        let day = snap.heroDays.find((item) => item.date === today) ?? {
          date: today,
          quota: snap.settings.heroQuotaOverride ?? defaultQuota(level),
          manual: { pushups: 0, abs: 0, squats: 0, km: 0 },
          manualXp: 0,
          bonusGranted: false,
          shield: false,
        }
        const totals = sessionTotals(snap.sessions, today)
        const result = addHeroManual(day, delta, totals)
        day = { ...result.day, date: today, shield: false }
        let streaks = snap.streaks
        if (result.xpDelta) {
          const xp = applyXpDelta({ total: streaks.xpTotal, level: streaks.level }, result.xpDelta)
          streaks = { ...streaks, xpTotal: xp.total, level: xp.level }
        }
        const combined = combinedTotals(day.manual, totals)
        let heroDays = snap.heroDays.filter((item) => item.date !== today)
        if (combined.pushups + combined.abs + combined.squats + combined.km > 0) {
          const hero = registerHeroActivity(streaks.hero, today)
          streaks = { ...streaks, hero: hero.state }
          if (hero.shieldedDate) {
            heroDays = heroDays.filter((item) => item.date !== hero.shieldedDate)
            heroDays.push({
              date: hero.shieldedDate,
              quota: day.quota,
              manual: { pushups: 0, abs: 0, squats: 0, km: 0 },
              manualXp: 0,
              bonusGranted: false,
              shield: true,
            })
          }
        }
        heroDays = [...heroDays, day]
        const log: HeroQuotaLog = { id: crypto.randomUUID(), date: today, ...delta, xp: result.xpDelta }
        const event: XpEvent | null = result.xpDelta
          ? { id: crypto.randomUUID(), at: new Date().toISOString(), amount: result.xpDelta, kind: 'hero', ref: today }
          : null
        const fresh = newAchievements({
          owned: snap.achievements.map((item) => item.id),
          completedSessions: snap.sessions.filter((item) => item.status === 'completado').length,
          gymStreak: streaks.gym.streak,
          hadRecord: snap.sessions.some((item) => item.records.length > 0),
          cenit: isCenit(combined),
          mitad: isMitad(combined),
          bodyWeights: snap.bodyWeight.length,
          exported: snap.achievements.some((item) => item.id === 'respaldo'),
          routines: snap.routines.length,
          substitutedSession: false,
          deloadWeekMet: false,
          level: streaks.level,
        })
        if (fresh.length) {
          const xp = applyXpDelta({ total: streaks.xpTotal, level: streaks.level }, fresh.reduce((sum, item) => sum + item.xp, 0))
          streaks = { ...streaks, xpTotal: xp.total, level: xp.level }
        }
        const unlocked = fresh.map((item) => ({ id: item.id, unlockedAt: new Date().toISOString(), xp: item.xp }))
        const db = await getDb()
        const tx = db.transaction(['heroDays', 'heroManual', 'xpEvents', 'achievements', 'meta'], 'readwrite')
        for (const item of heroDays) await tx.objectStore('heroDays').put(item)
        await tx.objectStore('heroManual').put(log)
        if (event) await tx.objectStore('xpEvents').put(event)
        for (const item of unlocked) {
          await tx.objectStore('achievements').put(item)
          await tx.objectStore('xpEvents').put({ id: crypto.randomUUID(), at: item.unlockedAt, amount: item.xp, kind: 'achievement', ref: item.id })
        }
        await tx.objectStore('meta').put(streaks, 'streaks')
        await tx.done
        const reveal = rankForLevel(streaks.level).id !== snap.settings.lastRankSeen
          ? { from: snap.settings.lastRankSeen, to: rankForLevel(streaks.level).id }
          : null
        setSnap({
          ...snap,
          heroDays,
          heroManual: [...snap.heroManual, log],
          streaks,
          achievements: [...snap.achievements, ...unlocked],
          xpEvents: [...snap.xpEvents, ...(event ? [event] : [])],
        })
        if (reveal) setRankReveal(reveal)
        if (fresh.length) setAchievementQueue(fresh)
      },
      addWeight: async (kg) => {
        const now = new Date()
        const entry: BodyWeightEntry = { id: crypto.randomUUID(), at: now.toISOString(), date: todayISO(), kg }
        const db = await getDb()
        await db.put('bodyWeight', entry)
        const fresh = grantStatic(snap, snap.routines.length, snap.bodyWeight.length + 1, false)
        setSnap({ ...snap, bodyWeight: [...snap.bodyWeight, entry], ...fresh.patch })
        if (fresh.queue.length) setAchievementQueue(fresh.queue)
      },
      exportJson: async () => {
        const file: BackupFile = {
          schemaVersion: 1,
          exportedAt: new Date().toISOString(),
          app: 'poder-fitness',
          profile: snap.profile,
          settings: snap.settings,
          exercisesCustom: snap.exercises.filter((exercise) => exercise.custom).map((exercise) => ({
            id: exercise.id,
            nombre: exercise.nombre,
            musculosPrimarios: exercise.musculosPrimarios,
            equipo: exercise.equipo,
            mecanica: exercise.mecanica === 'compuesto' || exercise.mecanica === 'aislamiento' ? exercise.mecanica : null,
            logging: exercise.logging,
            custom: true,
          })),
          routines: snap.routines,
          arcs: snap.arcs,
          sessions: snap.sessions,
          memory: snap.memory,
          bodyWeight: snap.bodyWeight,
          heroManual: snap.heroManual,
          heroDays: snap.heroDays,
          xpEvents: snap.xpEvents,
          achievements: snap.achievements,
          streaks: snap.streaks,
        }
        const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `poder-fitness-${todayISO()}.json`
        link.click()
        URL.revokeObjectURL(link.href)
        if (!snap.achievements.some((item) => item.id === 'respaldo')) {
          const unlock: AchievementUnlock = { id: 'respaldo', unlockedAt: new Date().toISOString(), xp: 40 }
          const xp = applyXpDelta({ total: snap.streaks.xpTotal, level: snap.streaks.level }, 40)
          const streaks = { ...snap.streaks, xpTotal: xp.total, level: xp.level }
          const db = await getDb()
          await db.put('achievements', unlock)
          await db.put('xpEvents', { id: crypto.randomUUID(), at: unlock.unlockedAt, amount: 40, kind: 'achievement', ref: 'respaldo' })
          await db.put('meta', streaks, 'streaks')
          setSnap({ ...snap, achievements: [...snap.achievements, unlock], streaks })
          setAchievementQueue([newAchievements({
            owned: [],
            completedSessions: 0,
            gymStreak: 0,
            hadRecord: false,
            cenit: false,
            mitad: false,
            bodyWeights: 0,
            exported: true,
            routines: 0,
            substitutedSession: false,
            deloadWeekMet: false,
            level: 1,
          }).find((item) => item.id === 'respaldo')!])
        }
      },
      importJson: async (raw) => {
        const parsed = parseBackup(raw)
        if (!parsed.ok) {
          setToast(parsed.error)
          return false
        }
        const file = parsed.file
        const db = await getDb()
        const tx = db.transaction(['meta', 'customs', 'routines', 'arcs', 'sessions', 'memory', 'bodyWeight', 'heroManual', 'heroDays', 'xpEvents', 'achievements'], 'readwrite')
        for (const name of ['customs', 'routines', 'arcs', 'sessions', 'memory', 'bodyWeight', 'heroManual', 'heroDays', 'xpEvents', 'achievements'] as const) {
          await tx.objectStore(name).clear()
        }
        if (file.profile) await tx.objectStore('meta').put(file.profile, 'profile')
        else await tx.objectStore('meta').delete('profile')
        await tx.objectStore('meta').put(file.settings, 'settings')
        const level = rankForLevelFromEvents(file)
        const streaks = { ...file.streaks, xpTotal: xpTotalOf(file.xpEvents), level }
        await tx.objectStore('meta').put(streaks, 'streaks')
        for (const item of file.exercisesCustom) await tx.objectStore('customs').put(item)
        for (const item of file.routines) await tx.objectStore('routines').put(item)
        for (const item of file.arcs) await tx.objectStore('arcs').put(item)
        for (const item of file.sessions) await tx.objectStore('sessions').put(item)
        for (const item of file.memory) await tx.objectStore('memory').put(item)
        for (const item of file.bodyWeight) await tx.objectStore('bodyWeight').put(item)
        for (const item of file.heroManual) await tx.objectStore('heroManual').put(item)
        for (const item of file.heroDays) await tx.objectStore('heroDays').put(item)
        for (const item of file.xpEvents) await tx.objectStore('xpEvents').put(item)
        for (const item of file.achievements) await tx.objectStore('achievements').put(item)
        await tx.done
        await reload()
        return true
      },
      wipe: async () => {
        await wipeDatabase()
        window.location.assign(import.meta.env.BASE_URL)
      },
      dismissRank: async () => {
        if (!rankReveal) return
        const settings = { ...snap.settings, lastRankSeen: rankReveal.to }
        const db = await getDb()
        await db.put('meta', settings, 'settings')
        patch({ settings })
        setRankReveal(null)
      },
      dismissReplay: () => setReplay(null),
      dismissAchievement: () => setAchievementQueue((queue) => queue.slice(1)),
      replayRank: () => {
        const current = rankForLevel(snap.streaks.level)
        const previous = rankForLevel(Math.max(1, current.min - 1))
        setReplay({ from: previous.id === current.id ? 'chispa' : previous.id, to: current.id })
      },
      refresh: () => reload(),
      ensureTodayHero: async () => {
        const today = todayISO()
        if (snap.heroDays.some((item) => item.date === today)) return
        const day: HeroDay = {
          date: today,
          quota: snap.settings.heroQuotaOverride ?? defaultQuota(snap.streaks.level),
          manual: { pushups: 0, abs: 0, squats: 0, km: 0 },
          manualXp: 0,
          bonusGranted: false,
          shield: false,
        }
        const db = await getDb()
        await db.put('heroDays', day)
        patch({ heroDays: [...snap.heroDays, day] })
      },
      rewriteFutureExercise: async (fromId, next) => {
        const today = todayISO()
        const arcs = snap.arcs.map((arc) => {
          if (arc.status !== 'activo') return arc
          return {
            ...arc,
            sessions: arc.sessions.map((session) => {
              if (session.status !== 'planificado' || session.date < today) return session
              return {
                ...session,
                exercises: session.exercises.map((exercise) => exercise.exerciseId === fromId
                  ? {
                    ...exercise,
                    exerciseId: next.exerciseId,
                    nombre: next.nombre,
                    logging: next.logging,
                    compound: next.compound,
                    equipo: next.equipo,
                    muscleGroup: next.muscleGroup,
                  }
                  : exercise),
              }
            }),
          }
        })
        const db = await getDb()
        const tx = db.transaction('arcs', 'readwrite')
        for (const arc of arcs) await tx.store.put(arc)
        await tx.done
        patch({ arcs })
      },
    }

    async function apiDiscard(session: WorkoutSession) {
      if (!snap) return
      const discarded: WorkoutSession = { ...session, status: 'descartado', endedAt: new Date().toISOString() }
      let arcs = snap.arcs
      if (session.plannedSessionId) {
        arcs = arcs.map((arc) => ({
          ...arc,
          sessions: arc.sessions.map((row) => row.id === session.plannedSessionId
            ? { ...row, status: row.date < todayISO() ? 'omitido' as const : 'planificado' as const }
            : row),
        }))
      }
      const db = await getDb()
      const tx = db.transaction(['sessions', 'arcs'], 'readwrite')
      await tx.objectStore('sessions').put(discarded)
      for (const arc of arcs) await tx.objectStore('arcs').put(arc)
      await tx.done
      patch({
        sessions: snap.sessions.map((item) => item.id === session.id ? discarded : item),
        arcs,
      })
    }
  }, [snap, ready, error, toast, rankReveal, achievementQueue, replay])

  if (!api) {
    return <div className="shell-main"><p>{error ?? 'Cargando tu cuaderno…'}</p></div>
  }
  return <PoderContext.Provider value={api}>{children}</PoderContext.Provider>
}

function addDaysSafe(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, (month ?? 1) - 1, day ?? 1)
  date.setDate(date.getDate() + days)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function rankForLevelFromEvents(file: BackupFile): number {
  return levelFromTotal(xpTotalOf(file.xpEvents)).level
}

function grantStatic(snap: Snapshot, routines: number, weights: number, routineJustSaved: boolean) {
  const fresh = newAchievements({
    owned: snap.achievements.map((item) => item.id),
    completedSessions: snap.sessions.filter((item) => item.status === 'completado').length,
    gymStreak: snap.streaks.gym.streak,
    hadRecord: snap.sessions.some((item) => item.records.length > 0),
    cenit: false,
    mitad: false,
    bodyWeights: weights,
    exported: snap.achievements.some((item) => item.id === 'respaldo'),
    routines,
    substitutedSession: false,
    deloadWeekMet: false,
    level: snap.streaks.level,
  }).filter((item) => (routineJustSaved ? item.id === 'forja' : item.id === 'bascula'))
  if (!fresh.length) return { patch: {}, queue: [] as AchievementDef[], streaks: null as StreakState | null }
  const xp = applyXpDelta({ total: snap.streaks.xpTotal, level: snap.streaks.level }, fresh.reduce((sum, item) => sum + item.xp, 0))
  const streaks = { ...snap.streaks, xpTotal: xp.total, level: xp.level }
  const unlocked = fresh.map((item) => ({ id: item.id, unlockedAt: new Date().toISOString(), xp: item.xp }))
  void getDb().then(async (db) => {
    for (const item of unlocked) {
      await db.put('achievements', item)
      await db.put('xpEvents', { id: crypto.randomUUID(), at: item.unlockedAt, amount: item.xp, kind: 'achievement', ref: item.id })
    }
  })
  return {
    patch: { achievements: [...snap.achievements, ...unlocked], streaks },
    queue: fresh,
    streaks,
  }
}

export function usePoder(): PoderValue {
  const value = useContext(PoderContext)
  if (!value) throw new Error('Poder sin proveedor')
  return value
}
