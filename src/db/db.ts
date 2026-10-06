import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { bundledExercises, type Exercise } from '../catalog';
import { unlockedIds, type AchievementFacts } from '../domain/achievements';
import { mondayOf, localDateISO, addDays } from '../domain/dates';
import type { Arc, AvatarGender, BackupFile, BodyWeight, HeroLog, Plan, PlanDay, Profile, Routine, StoredAchievement, WorkoutSession } from '../domain/model';
import { uid } from '../domain/model';
import { generateWeek, type SlotPin } from '../domain/plan';
import { rankForXp } from '../domain/ranks';
import { RANK_IDS } from '../catalog/types';
import { volumeOf, type PerformedSet } from '../domain/session';
import { kgToLb } from '../domain/units';

interface PoderSchema extends DBSchema {
  profile: { key: string; value: Profile };
  exercises: { key: string; value: Exercise; indexes: { nombre: string; patron: string; nivel: string } };
  routines: { key: string; value: Routine };
  arcs: { key: string; value: Arc };
  plans: { key: string; value: Plan };
  sessions: { key: string; value: WorkoutSession; indexes: { byDate: string; byStatus: WorkoutSession['status'] } };
  heroLogs: { key: string; value: HeroLog };
  bodyWeights: { key: string; value: BodyWeight };
  achievements: { key: string; value: StoredAchievement };
}

const DB_NAME = 'poder-fitness';
const DB_VERSION = 1;

let database: Promise<IDBPDatabase<PoderSchema>> | null = null;

function createStore(db: IDBPDatabase<PoderSchema>): void {
  if (!db.objectStoreNames.contains('profile')) db.createObjectStore('profile');
  if (!db.objectStoreNames.contains('exercises')) {
    const exercises = db.createObjectStore('exercises', { keyPath: 'id' });
    exercises.createIndex('nombre', 'nombre');
    exercises.createIndex('patron', 'patron');
    exercises.createIndex('nivel', 'nivel');
  }
  if (!db.objectStoreNames.contains('routines')) db.createObjectStore('routines', { keyPath: 'id' });
  if (!db.objectStoreNames.contains('arcs')) db.createObjectStore('arcs', { keyPath: 'id' });
  if (!db.objectStoreNames.contains('plans')) db.createObjectStore('plans', { keyPath: 'id' });
  if (!db.objectStoreNames.contains('sessions')) {
    const sessions = db.createObjectStore('sessions', { keyPath: 'id' });
    sessions.createIndex('byDate', 'date');
    sessions.createIndex('byStatus', 'status');
  }
  if (!db.objectStoreNames.contains('heroLogs')) db.createObjectStore('heroLogs', { keyPath: 'date' });
  if (!db.objectStoreNames.contains('bodyWeights')) db.createObjectStore('bodyWeights', { keyPath: 'date' });
  if (!db.objectStoreNames.contains('achievements')) db.createObjectStore('achievements', { keyPath: 'id' });
}

export function db(): Promise<IDBPDatabase<PoderSchema>> {
  database ??= openDB<PoderSchema>(DB_NAME, DB_VERSION, { upgrade: createStore });
  return database;
}

export async function ensureSeed(): Promise<void> {
  const database = await db();
  const existing = await database.getAll('exercises');
  const byId = new Map(existing.map((exercise) => [exercise.id, exercise]));
  const tx = database.transaction('exercises', 'readwrite');
  for (const exercise of bundledExercises()) {
    const current = byId.get(exercise.id);
    if (current?.origen === 'usuario') continue;
    tx.store.put(current ? { ...exercise, archivado: current.archivado } : exercise);
  }
  await tx.done;
}

function avatarOf(value: unknown): AvatarGender {
  return value === 'mujer' ? 'mujer' : 'hombre';
}

export function normalizeProfile(profile: Profile): Profile {
  const avatar = avatarOf(profile.avatar);
  return profile.avatar === avatar ? profile : { ...profile, avatar };
}

export async function getProfile(): Promise<Profile | null> {
  const found = await (await db()).get('profile', 'singleton');
  if (!found) return null;
  return normalizeProfile(found);
}

export async function saveProfile(profile: Profile): Promise<void> {
  await (await db()).put('profile', profile, 'singleton');
}

async function putPlan(plan: Plan): Promise<void> {
  const database = await db();
  const tx = database.transaction('plans', 'readwrite');
  const all = await tx.store.getAll();
  for (const item of all) {
    if (item.active && item.id !== plan.id) tx.store.put({ ...item, active: false });
  }
  tx.store.put({ ...plan, active: true });
  await tx.done;
}

function withIds(days: ReturnType<typeof generateWeek>): PlanDay[] {
  return days.map((day) => ({ ...day, id: uid() }));
}

export async function createProfile(profile: Profile): Promise<void> {
  const database = await db();
  const weekStart = mondayOf(localDateISO());
  const arc: Arc = {
    id: uid(),
    number: 1,
    weekInArc: 1,
    variantBase: 0,
    startedOn: weekStart,
    repeatNotice: false,
    closed: false,
  };
  const exercises = await database.getAll('exercises');
  const plan: Plan = {
    id: uid(),
    arcId: arc.id,
    weekStart,
    active: true,
    days: withIds(
      generateWeek({
        level: profile.level,
        goal: profile.goal,
        equipment: profile.equipment,
        weekdays: profile.weekdays,
        weekInArc: 1,
        variantBase: 0,
        weekStart,
        exercises,
      }),
    ),
  };
  const tx = database.transaction(['profile', 'arcs', 'plans'], 'readwrite');
  tx.objectStore('profile').put(profile, 'singleton');
  tx.objectStore('arcs').put(arc);
  tx.objectStore('plans').put(plan);
  await tx.done;
}

export async function getActiveArc(): Promise<Arc | null> {
  const arcs = await (await db()).getAll('arcs');
  return arcs.find((arc) => !arc.closed) ?? arcs.sort((a, b) => b.number - a.number)[0] ?? null;
}

export async function listPlans(): Promise<Plan[]> {
  return (await db()).getAll('plans');
}

export async function getActivePlan(): Promise<Plan | null> {
  const plans = await (await db()).getAll('plans');
  return plans.find((plan) => plan.active) ?? null;
}

export async function listExercises(): Promise<Exercise[]> {
  return (await db()).getAll('exercises');
}

export async function saveExercise(exercise: Exercise): Promise<void> {
  await (await db()).put('exercises', exercise);
}

export async function listRoutines(): Promise<Routine[]> {
  const routines = await (await db()).getAll('routines');
  return routines.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function saveRoutine(routine: Routine): Promise<void> {
  await (await db()).put('routines', routine);
}

export async function getRoutine(id: string): Promise<Routine | undefined> {
  return (await db()).get('routines', id);
}

export async function listSessions(): Promise<WorkoutSession[]> {
  const sessions = await (await db()).getAll('sessions');
  return sessions.sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1));
}

export async function getSession(id: string): Promise<WorkoutSession | undefined> {
  return (await db()).get('sessions', id);
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  await (await db()).put('sessions', session);
}

export async function liveSession(): Promise<WorkoutSession | null> {
  const found = await (await db()).getAllFromIndex('sessions', 'byStatus', 'en-curso');
  return found[0] ?? null;
}

export async function listHero(): Promise<HeroLog[]> {
  const logs = await (await db()).getAll('heroLogs');
  return logs.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getHero(date: string): Promise<HeroLog | undefined> {
  return (await db()).get('heroLogs', date);
}

export async function saveHero(log: HeroLog): Promise<Profile | null> {
  const database = await db();
  const profile = await database.get('profile', 'singleton');
  const previous = await database.get('heroLogs', log.date);
  const delta = log.xpAwarded - (previous?.xpAwarded ?? 0);
  const nextProfile = profile ? { ...profile, xpTotal: Math.max(0, profile.xpTotal + delta) } : null;
  const tx = database.transaction(['heroLogs', 'profile'], 'readwrite');
  tx.objectStore('heroLogs').put(log);
  if (nextProfile) tx.objectStore('profile').put(nextProfile, 'singleton');
  await tx.done;
  return nextProfile;
}

export async function listWeights(): Promise<BodyWeight[]> {
  const rows = await (await db()).getAll('bodyWeights');
  return rows.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function saveWeight(row: BodyWeight): Promise<void> {
  await (await db()).put('bodyWeights', row);
}

export async function listAchievements(): Promise<StoredAchievement[]> {
  return (await db()).getAll('achievements');
}

export function performedFrom(sessions: WorkoutSession[]): PerformedSet[] {
  const rows: PerformedSet[] = [];
  for (const session of sessions) {
    if (session.status !== 'completada' || !session.finishedAt) continue;
    for (const exercise of session.exercises) {
      for (const set of exercise.series) {
        if (!set.completed || set.kind !== 'trabajo') continue;
        rows.push({
          exerciseId: exercise.exerciseId,
          pesoKg: set.pesoKg,
          reps: set.reps,
          segundos: set.segundos,
          completed: true,
          kind: 'trabajo',
          finishedAt: session.finishedAt,
        });
      }
    }
  }
  return rows;
}

function pinsFrom(plan: Plan | null): SlotPin[] {
  if (!plan) return [];
  const pins: SlotPin[] = [];
  for (const day of plan.days) {
    if (day.pinned) continue;
    for (const item of day.items) {
      if (item.pinned) pins.push({ weekday: day.weekday, slot: item.slot, exerciseId: item.exerciseId });
    }
  }
  return pins;
}

export async function writeGeneratedPlan(arc: Arc, profile: Profile, carryPins: boolean, previous: Plan | null): Promise<Plan> {
  const exercises = await listExercises();
  const weekStart = mondayOf(localDateISO());
  const days = withIds(
    generateWeek({
      level: profile.level,
      goal: profile.goal,
      equipment: profile.equipment,
      weekdays: profile.weekdays,
      weekInArc: arc.weekInArc,
      variantBase: arc.variantBase,
      weekStart,
      exercises,
      pins: carryPins ? pinsFrom(previous) : [],
    }),
  );
  const merged = days.map((day) => {
    const old = previous?.days.find((item) => item.weekday === day.weekday && item.pinned);
    if (!old) return day;
    return { ...old, date: day.date };
  });
  const plan: Plan = { id: uid(), arcId: arc.id, weekStart, active: true, days: merged };
  await putPlan(plan);
  return plan;
}

export async function advanceArcIfNeeded(): Promise<void> {
  const profile = await getProfile();
  const arc = await getActiveArc();
  const plan = await getActivePlan();
  if (!profile || !arc || !plan || arc.closed) return;
  const today = localDateISO();
  const thisMonday = mondayOf(today);
  if (plan.weekStart >= thisMonday) return;
  const sessions = await listSessions();
  const end = addDays(plan.weekStart, 7);
  const done = sessions.filter(
    (session) => session.status === 'completada' && session.date >= plan.weekStart && session.date < end,
  ).length;
  const met = plan.days.length > 0 && done >= plan.days.length;
  const database = await db();
  if (met && arc.weekInArc === 4) {
    await database.put('arcs', { ...arc, closed: true });
    const next: Arc = {
      id: uid(),
      number: arc.number + 1,
      weekInArc: 1,
      variantBase: arc.variantBase + 1,
      startedOn: thisMonday,
      repeatNotice: false,
      closed: false,
    };
    await database.put('arcs', next);
    await writeGeneratedPlan(next, profile, false, null);
    return;
  }
  const next: Arc = {
    ...arc,
    weekInArc: met ? ((arc.weekInArc + 1) as Arc['weekInArc']) : arc.weekInArc,
    startedOn: thisMonday,
    repeatNotice: !met,
  };
  await database.put('arcs', next);
  await writeGeneratedPlan(next, profile, true, plan);
}

export async function regenerateActivePlan(options: { futureOnly: boolean }): Promise<void> {
  const profile = await getProfile();
  const arc = await getActiveArc();
  const plan = await getActivePlan();
  if (!profile || !arc || !plan) return;
  const exercises = await listExercises();
  const today = localDateISO();
  const live = await liveSession();
  const fresh = generateWeek({
    level: profile.level,
    goal: profile.goal,
    equipment: profile.equipment,
    weekdays: profile.weekdays,
    weekInArc: arc.weekInArc,
    variantBase: arc.variantBase,
    weekStart: plan.weekStart,
    exercises,
    pins: pinsFrom(plan),
  });
  const days: PlanDay[] = fresh.map((day) => {
    const old = plan.days.find((item) => item.date === day.date);
    if (old?.pinned) return { ...old };
    if (old && live?.planDayId === old.id) return { ...old };
    if (options.futureOnly && old && old.date < today) return { ...old };
    return { ...day, id: old?.id ?? uid() };
  });
  if (options.futureOnly) {
    for (const old of plan.days) {
      if (old.date < today && !days.some((day) => day.date === old.date)) days.push(old);
    }
  }
  days.sort((a, b) => (a.date < b.date ? -1 : 1));
  await putPlan({ ...plan, days });
}

export async function savePlanDay(day: PlanDay): Promise<void> {
  const plan = await getActivePlan();
  if (!plan) return;
  await putPlan({
    ...plan,
    days: plan.days.map((item) => (item.id === day.id ? { ...day, pinned: true } : item)),
  });
}

export async function releasePlanDay(dayId: string): Promise<void> {
  const plan = await getActivePlan();
  if (!plan) return;
  const cleared: Plan = {
    ...plan,
    days: plan.days.map((day) =>
      day.id === dayId ? { ...day, pinned: false, items: day.items.map((item) => ({ ...item, pinned: false })) } : day,
    ),
  };
  const database = await db();
  await database.put('plans', cleared);
  await regenerateActivePlan({ futureOnly: false });
}

export async function pinPlanSlot(dayId: string, slot: PlanDay['items'][number]['slot'], exerciseId: string): Promise<void> {
  const plan = await getActivePlan();
  if (!plan) return;
  await putPlan({
    ...plan,
    days: plan.days.map((day) =>
      day.id !== dayId
        ? day
        : {
            ...day,
            items: day.items.map((item) =>
              item.slot === slot ? { ...item, exerciseId, pinned: true } : item,
            ),
          },
    ),
  });
}

export async function syncAchievements(): Promise<void> {
  const [profile, sessions, heroes, weights, exercises, plans, arcs, existing] = await Promise.all([
    getProfile(),
    listSessions(),
    listHero(),
    listWeights(),
    listExercises(),
    (await db()).getAll('plans'),
    (await db()).getAll('arcs'),
    listAchievements(),
  ]);
  if (!profile) return;
  const today = localDateISO();
  const thisMonday = mondayOf(today);
  let closedWeeks = 0;
  for (const plan of plans) {
    if (plan.weekStart >= thisMonday) continue;
    const end = addDays(plan.weekStart, 7);
    const done = sessions.filter(
      (session) => session.status === 'completada' && session.date >= plan.weekStart && session.date < end,
    ).length;
    if (plan.days.length > 0 && done >= plan.days.length) closedWeeks += 1;
  }
  let volumeKg = 0;
  for (const session of sessions) {
    if (session.status !== 'completada') continue;
    volumeKg += volumeOf(session).kg;
  }
  const rank = rankForXp(profile.xpTotal);
  const rankIndex = RANK_IDS.indexOf(rank.id);
  const facts: AchievementFacts = {
    completedSessions: sessions.filter((session) => session.status === 'completada').length,
    closedWeeks,
    closedArcs: arcs.filter((arc) => arc.closed).length,
    heroLogged: heroes.some((log) => log.flexiones > 0 || log.abdominales > 0 || log.sentadillas > 0 || log.km > 0),
    heroComplete: heroes.some((log) => log.flexiones >= 100 && log.abdominales >= 100 && log.sentadillas >= 100 && log.km >= 10),
    heroStreak: maxHeroStreak(heroes),
    records: sessions.filter((session) => session.recordNames.length > 0).length,
    volumeKg,
    volumeLb: kgToLb(volumeKg),
    unit: profile.unit,
    cameraSessions: sessions.filter((session) => session.status === 'completada' && session.camaraGravedad).length,
    bodyWeights: weights.length,
    customExercises: exercises.filter((exercise) => exercise.origen === 'usuario').length,
    ranksReached: RANK_IDS.slice(1, rankIndex + 1),
  };
  const have = new Set(existing.map((item) => item.id));
  const tx = (await db()).transaction('achievements', 'readwrite');
  const now = new Date().toISOString();
  for (const id of unlockedIds(facts)) {
    if (!have.has(id)) tx.store.put({ id, unlockedAt: now });
  }
  await tx.done;
}

function maxHeroStreak(logs: HeroLog[]): number {
  const days = logs
    .filter((log) => log.flexiones >= 100 && log.abdominales >= 100 && log.sentadillas >= 100 && log.km >= 10)
    .map((log) => log.date)
    .sort();
  let best = 0;
  let run = 0;
  let prev = '';
  for (const day of days) {
    if (prev && addDays(prev, 1) === day) run += 1;
    else run = 1;
    prev = day;
    best = Math.max(best, run);
  }
  return best;
}

export async function exportBackup(): Promise<BackupFile> {
  const database = await db();
  return {
    schema: 1,
    app: 'poder-fitness',
    exportedAt: new Date().toISOString(),
    profile: (await database.get('profile', 'singleton')) ?? null,
    exercises: await database.getAll('exercises'),
    routines: await database.getAll('routines'),
    arcs: await database.getAll('arcs'),
    plans: await database.getAll('plans'),
    sessions: await database.getAll('sessions'),
    heroLogs: await database.getAll('heroLogs'),
    bodyWeights: await database.getAll('bodyWeights'),
    achievements: await database.getAll('achievements'),
  };
}

export function parseBackup(data: unknown): BackupFile | null {
  if (!data || typeof data !== 'object') return null;
  const record = data as Partial<BackupFile>;
  if (record.schema !== 1 || record.app !== 'poder-fitness') return null;
  if (!Array.isArray(record.sessions)) return null;
  const sessionsOk = record.sessions.every(
    (session) =>
      Boolean(session) &&
      typeof session === 'object' &&
      typeof (session as WorkoutSession).id === 'string' &&
      typeof (session as WorkoutSession).status === 'string' &&
      Array.isArray((session as WorkoutSession).exercises),
  );
  if (!sessionsOk) return null;
  return {
    schema: 1,
    app: 'poder-fitness',
    exportedAt: typeof record.exportedAt === 'string' ? record.exportedAt : new Date().toISOString(),
    profile: record.profile ?? null,
    exercises: Array.isArray(record.exercises) ? record.exercises : [],
    routines: Array.isArray(record.routines) ? record.routines : [],
    arcs: Array.isArray(record.arcs) ? record.arcs : [],
    plans: Array.isArray(record.plans) ? record.plans : [],
    sessions: record.sessions,
    heroLogs: Array.isArray(record.heroLogs) ? record.heroLogs : [],
    bodyWeights: Array.isArray(record.bodyWeights) ? record.bodyWeights : [],
    achievements: Array.isArray(record.achievements) ? record.achievements : [],
  };
}

export async function replaceWithBackup(file: BackupFile): Promise<void> {
  const database = await db();
  const names = ['profile', 'exercises', 'routines', 'arcs', 'plans', 'sessions', 'heroLogs', 'bodyWeights', 'achievements'] as const;
  const tx = database.transaction([...names], 'readwrite');
  for (const name of names) await tx.objectStore(name).clear();
  if (file.profile) tx.objectStore('profile').put(normalizeProfile(file.profile), 'singleton');
  for (const exercise of file.exercises) tx.objectStore('exercises').put(exercise);
  for (const routine of file.routines) tx.objectStore('routines').put(routine);
  for (const arc of file.arcs) tx.objectStore('arcs').put(arc);
  for (const plan of file.plans) tx.objectStore('plans').put(plan);
  for (const session of file.sessions) tx.objectStore('sessions').put(session);
  for (const log of file.heroLogs) tx.objectStore('heroLogs').put(log);
  for (const row of file.bodyWeights) tx.objectStore('bodyWeights').put(row);
  for (const achievement of file.achievements) tx.objectStore('achievements').put(achievement);
  await tx.done;
}

export async function resetDatabase(): Promise<void> {
  const database = await db();
  const names = ['profile', 'exercises', 'routines', 'arcs', 'plans', 'sessions', 'heroLogs', 'bodyWeights', 'achievements'] as const;
  const tx = database.transaction([...names], 'readwrite');
  for (const name of names) await tx.objectStore(name).clear();
  for (const exercise of bundledExercises()) tx.objectStore('exercises').put(exercise);
  await tx.done;
}

export async function applySessionXp(before: number, session: WorkoutSession): Promise<void> {
  const profile = await getProfile();
  if (!profile || session.status !== 'completada') return;
  await saveProfile({ ...profile, xpTotal: Math.max(0, profile.xpTotal - before + session.xpAwarded) });
}

export async function deleteSession(id: string): Promise<void> {
  const session = await getSession(id);
  if (!session) return;
  const profile = await getProfile();
  if (profile && session.status === 'completada') {
    await saveProfile({ ...profile, xpTotal: Math.max(0, profile.xpTotal - session.xpAwarded) });
  }
  await (await db()).delete('sessions', id);
}
