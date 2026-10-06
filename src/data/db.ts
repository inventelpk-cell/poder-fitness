import { deleteDB, openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type {
  AchievementUnlock,
  Arc,
  BodyWeightEntry,
  CustomExercise,
  DbExercise,
  HeroDay,
  HeroQuotaLog,
  Profile,
  Routine,
  Settings,
  StreakState,
  WorkoutSession,
  XpEvent,
  ExerciseMemory,
} from '../domain/types'

interface PoderSchema extends DBSchema {
  meta: { key: string; value: Profile | Settings | StreakState | string }
  exercises: { key: string; value: DbExercise }
  customs: { key: string; value: CustomExercise }
  routines: { key: string; value: Routine }
  arcs: { key: string; value: Arc }
  sessions: { key: string; value: WorkoutSession }
  memory: { key: string; value: ExerciseMemory }
  bodyWeight: { key: string; value: BodyWeightEntry }
  heroManual: { key: string; value: HeroQuotaLog }
  heroDays: { key: string; value: HeroDay }
  xpEvents: { key: string; value: XpEvent }
  achievements: { key: string; value: AchievementUnlock }
}

const NAME = 'poder-fitness'

let promise: Promise<IDBPDatabase<PoderSchema>> | null = null

export function getDb() {
  if (!promise) {
    promise = openDB<PoderSchema>(NAME, 1, {
      upgrade(db) {
        db.createObjectStore('meta')
        db.createObjectStore('exercises', { keyPath: 'id' })
        db.createObjectStore('customs', { keyPath: 'id' })
        db.createObjectStore('routines', { keyPath: 'id' })
        db.createObjectStore('arcs', { keyPath: 'id' })
        db.createObjectStore('sessions', { keyPath: 'id' })
        db.createObjectStore('memory', { keyPath: 'exerciseId' })
        db.createObjectStore('bodyWeight', { keyPath: 'id' })
        db.createObjectStore('heroManual', { keyPath: 'id' })
        db.createObjectStore('heroDays', { keyPath: 'date' })
        db.createObjectStore('xpEvents', { keyPath: 'id' })
        db.createObjectStore('achievements', { keyPath: 'id' })
      },
    })
  }
  return promise
}

export async function wipeDatabase() {
  const db = await getDb()
  db.close()
  promise = null
  await deleteDB(NAME)
}

export type PoderDB = IDBPDatabase<PoderSchema>
