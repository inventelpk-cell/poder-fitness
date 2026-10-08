import type { Exercise } from '../catalog/types';
import { localDateISO } from './dates';
import type { HistorySession, LoadProposal } from './loads';
import { proposeLoad, warmupWeights } from './loads';
import type { PlanDay, Profile, Routine, SessionExercise, SessionSet, WorkoutSession } from './model';
import { uid } from './model';
import type { PlanExerciseItem } from './plan';
import { isPersonalRecord, type RecordSet } from './records';
import { xpDeSesion } from './xp';

export interface PerformedSet {
  exerciseId: string;
  pesoKg: number | null;
  reps: number | null;
  segundos: number | null;
  completed: boolean;
  kind: 'calentamiento' | 'trabajo';
  finishedAt: string;
}

function workOf(exercise: SessionExercise): SessionSet[] {
  return exercise.series.filter((set) => set.kind === 'trabajo');
}

function toRecord(set: SessionSet): RecordSet {
  return {
    pesoKg: set.pesoKg,
    reps: set.reps,
    segundos: set.segundos,
    completed: set.completed,
    kind: set.kind,
  };
}

export function priorHistory(performed: PerformedSet[], exerciseId: string): HistorySession[] {
  const grouped = new Map<string, PerformedSet[]>();
  for (const set of performed) {
    if (set.exerciseId !== exerciseId || set.kind !== 'trabajo' || !set.completed) continue;
    const list = grouped.get(set.finishedAt) ?? [];
    list.push(set);
    grouped.set(set.finishedAt, list);
  }
  return [...grouped.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([, sets]) => ({
      sets: sets.map((set) => ({
        pesoKg: set.pesoKg ?? 0,
        reps: set.reps,
        segundos: set.segundos,
        completed: true,
        kind: 'trabajo' as const,
      })),
    }));
}

function blankSet(kind: SessionSet['kind'], pesoKg: number | null, reps: number | null): SessionSet {
  return { id: uid(), kind, pesoKg, reps, segundos: null, completed: false, completedAt: null };
}

function exerciseFromItem(
  exercise: Exercise,
  item: PlanExerciseItem | { series: number; repMin: number; repMax: number; descansoSegundos: number; nota: string; slot: PlanExerciseItem['slot'] | null },
  proposal: LoadProposal,
  profile: Profile,
  allowWarmup: boolean,
): { block: SessionExercise; usedWarmup: boolean } {
  const series: SessionSet[] = [];
  let usedWarmup = false;
  const weight = proposal.pesoKg;
  if (allowWarmup && exercise.compuesto && weight && weight > 0) {
    const warmups = warmupWeights(weight, profile.unit, profile.increment);
    for (const [index, kilo] of warmups.entries()) {
      series.push(blankSet('calentamiento', kilo, index === 0 ? 8 : 5));
    }
    usedWarmup = warmups.length > 0;
  }
  for (let i = 0; i < item.series; i += 1) series.push(blankSet('trabajo', weight, null));
  return {
    usedWarmup,
    block: {
      instanceId: uid(),
      exerciseId: exercise.id,
      nombre: exercise.nombre,
      patron: exercise.patron,
      musculo: exercise.musculo,
      compuesto: exercise.compuesto,
      medida: exercise.medida,
      cuentaEnVolumen: exercise.cuentaEnVolumen,
      descansoSegundos: item.descansoSegundos,
      repMin: item.repMin,
      repMax: item.repMax,
      nota: item.nota,
      estado: 'pendiente',
      series,
      slot: item.slot,
      propuesta: proposal.direction,
      anteriorKg: proposal.anteriorKg,
      imagenes: exercise.imagenes ? [...exercise.imagenes] : undefined,
    },
  };
}

function markCurrent(exercises: SessionExercise[]): SessionExercise[] {
  let found = false;
  return exercises.map((exercise) => {
    if (exercise.estado === 'saltado' || exercise.estado === 'sustituido' || exercise.estado === 'hecho') return exercise;
    if (!found) {
      found = true;
      return { ...exercise, estado: 'en-curso' };
    }
    return { ...exercise, estado: 'pendiente' };
  });
}

export function buildSession(input: {
  profile: Profile;
  exercises: Exercise[];
  nombre: string;
  planDay?: PlanDay | null;
  routine?: Routine | null;
  weekInArc: 1 | 2 | 3 | 4;
  performed: PerformedSet[];
  now?: Date;
}): WorkoutSession {
  const now = input.now ?? new Date();
  const stamp = now.toISOString();
  const blocks: SessionExercise[] = [];
  let warmupUsed = false;
  const source = input.planDay
    ? input.planDay.items.map((item) => ({ item, exerciseId: item.exerciseId }))
    : (input.routine?.items ?? []).map((item) => ({
        item: { ...item, slot: null, repObjetivo: item.repMin, medida: 'reps' as const, compuesto: false, pinned: false },
        exerciseId: item.exerciseId,
      }));
  let compoundOrdinal = 0;
  for (const entry of source) {
    const exercise = input.exercises.find((item) => item.id === entry.exerciseId);
    if (!exercise) continue;
    if (exercise.compuesto) compoundOrdinal += 1;
    const allowUp = input.weekInArc !== 3 || compoundOrdinal <= 2;
    const proposal = proposeLoad({
      history: priorHistory(input.performed, exercise.id),
      repMin: entry.item.repMin,
      repMax: entry.item.repMax,
      compuesto: exercise.compuesto,
      unit: input.profile.unit,
      increment: input.profile.increment,
      medida: exercise.medida,
      weekInArc: input.weekInArc,
      allowUp: exercise.compuesto ? allowUp : input.weekInArc !== 3,
    });
    const built = exerciseFromItem(exercise, entry.item, proposal, input.profile, !warmupUsed);
    if (built.usedWarmup) warmupUsed = true;
    blocks.push(built.block);
  }
  return {
    id: uid(),
    status: 'en-curso',
    startedAt: stamp,
    finishedAt: null,
    date: localDateISO(now),
    planDayId: input.planDay?.id ?? null,
    routineId: input.routine?.id ?? null,
    nombre: input.nombre,
    weekInArc: input.weekInArc,
    camaraGravedad: false,
    xpAwarded: 0,
    xpParts: null,
    restEndsAt: null,
    restAnnounced: null,
    exercises: markCurrent(blocks),
    recordNames: [],
  };
}

export function patchSet(
  session: WorkoutSession,
  instanceId: string,
  setId: string,
  patch: Partial<Pick<SessionSet, 'pesoKg' | 'reps' | 'segundos'>>,
): WorkoutSession {
  return {
    ...session,
    exercises: session.exercises.map((exercise) =>
      exercise.instanceId !== instanceId
        ? exercise
        : {
            ...exercise,
            series: exercise.series.map((set) => (set.id === setId ? { ...set, ...patch } : set)),
          },
    ),
  };
}

export function completeSet(
  session: WorkoutSession,
  instanceId: string,
  setId: string,
  now = new Date(),
): { ok: true; session: WorkoutSession } | { ok: false; error: string } {
  const exercise = session.exercises.find((item) => item.instanceId === instanceId);
  const set = exercise?.series.find((item) => item.id === setId);
  if (!exercise || !set || set.completed) return { ok: false, error: 'Esa serie ya está hecha.' };
  if (exercise.medida === 'segundos') {
    if (set.segundos === null || set.segundos < 0) return { ok: false, error: 'Anota los segundos.' };
  } else if (set.reps === null || set.reps < 0) {
    return { ok: false, error: 'Anota las repeticiones.' };
  }
  const stamp = now.toISOString();
  const exercises = session.exercises.map((item) => {
    if (item.instanceId !== instanceId) return item;
    const series = item.series.map((entry) =>
      entry.id === setId ? { ...entry, completed: true, completedAt: stamp } : entry,
    );
    const pending = series.some((entry) => !entry.completed);
    return { ...item, series, estado: pending ? 'en-curso' : 'hecho' } satisfies SessionExercise;
  });
  const current = exercises.find((item) => item.instanceId === instanceId);
  const finishedExercise = current?.estado === 'hecho';
  const next = finishedExercise ? markCurrent(exercises) : exercises;
  return {
    ok: true,
    session: {
      ...session,
      exercises: next,
      restEndsAt: new Date(now.getTime() + exercise.descansoSegundos * 1000).toISOString(),
      restAnnounced: null,
    },
  };
}

export function skipExercise(session: WorkoutSession, instanceId: string): { session: WorkoutSession; needsFinish: boolean } {
  const exercises = markCurrent(
    session.exercises.map((exercise) =>
      exercise.instanceId === instanceId ? { ...exercise, estado: 'saltado' } : exercise,
    ),
  );
  const needsFinish = !exercises.some((exercise) => exercise.estado === 'pendiente' || exercise.estado === 'en-curso');
  return { session: { ...session, exercises, restEndsAt: null }, needsFinish };
}

export function substituteExercise(
  session: WorkoutSession,
  instanceId: string,
  replacement: Exercise,
  proposal: LoadProposal,
  profile: Profile,
): WorkoutSession {
  const index = session.exercises.findIndex((exercise) => exercise.instanceId === instanceId);
  const current = session.exercises[index];
  if (!current || index < 0) return session;
  const workCount = workOf(current).length;
  const inherited = {
    series: workCount,
    repMin: current.repMin,
    repMax: current.repMax,
    descansoSegundos: current.descansoSegundos,
    nota: current.nota,
    slot: current.slot,
  };
  const alreadyWarm = session.exercises.some((exercise) => exercise.series.some((set) => set.kind === 'calentamiento'));
  const built = exerciseFromItem(replacement, inherited, proposal, profile, !alreadyWarm);
  built.block.estado = 'en-curso';
  built.block.medida = replacement.medida;
  const next = session.exercises.map((exercise) =>
    exercise.instanceId === instanceId ? { ...exercise, estado: 'sustituido' as const } : exercise,
  );
  next.splice(index + 1, 0, built.block);
  return { ...session, exercises: markCurrent(next), restEndsAt: null };
}

export function moveExercise(session: WorkoutSession, instanceId: string, direction: -1 | 1): WorkoutSession {
  const index = session.exercises.findIndex((exercise) => exercise.instanceId === instanceId);
  const exercise = session.exercises[index];
  if (!exercise || exercise.estado !== 'pendiente') return session;
  const target = index + direction;
  const neighbor = session.exercises[target];
  if (!neighbor || neighbor.estado !== 'pendiente') return session;
  const next = [...session.exercises];
  next[index] = neighbor;
  next[target] = exercise;
  return { ...session, exercises: next };
}

export function toggleCamera(session: WorkoutSession, enabled: boolean): WorkoutSession {
  if (session.exercises.some((exercise) => workOf(exercise).some((set) => set.completed))) return session;
  if (enabled === session.camaraGravedad) return session;
  if (!enabled) {
    return {
      ...session,
      camaraGravedad: false,
      exercises: session.exercises.map((exercise) => {
        const hadWork = exercise.series.some((set) => set.kind === 'trabajo' && !set.camara);
        return {
          ...exercise,
          series: exercise.series.filter((set) => !set.camara),
          descansoSegundos: hadWork ? Math.max(15, exercise.descansoSegundos - 30) : exercise.descansoSegundos,
        };
      }),
    };
  }
  return {
    ...session,
    camaraGravedad: true,
    exercises: session.exercises.map((exercise) => {
      if (exercise.estado === 'saltado' || exercise.estado === 'sustituido') return exercise;
      const work = workOf(exercise);
      if (work.length === 0) return exercise;
      const series = [...exercise.series];
      if (work.length < 6) {
        const last = work[work.length - 1];
        series.push({ ...blankSet('trabajo', last?.pesoKg ?? null, null), camara: true });
      }
      return { ...exercise, series, descansoSegundos: exercise.descansoSegundos + 30 };
    }),
  };
}

export function keepPreviousWeight(session: WorkoutSession, instanceId: string): WorkoutSession {
  return {
    ...session,
    exercises: session.exercises.map((exercise) => {
      if (exercise.instanceId !== instanceId) return exercise;
      return {
        ...exercise,
        propuesta: 'igual',
        series: exercise.series.map((set) =>
          set.kind === 'trabajo' && !set.completed ? { ...set, pesoKg: exercise.anteriorKg } : set,
        ),
      };
    }),
  };
}

export function shiftRest(session: WorkoutSession, deltaSeconds: number, now = new Date()): WorkoutSession {
  const base = session.restEndsAt ? new Date(session.restEndsAt).getTime() : now.getTime();
  const next = Math.max(now.getTime(), base + deltaSeconds * 1000);
  return { ...session, restEndsAt: new Date(next).toISOString(), restAnnounced: null };
}

export function setRestSeconds(session: WorkoutSession, seconds: number, now = new Date()): WorkoutSession {
  const safe = Math.max(0, Math.round(seconds));
  return {
    ...session,
    restEndsAt: new Date(now.getTime() + safe * 1000).toISOString(),
    restAnnounced: null,
  };
}

export function activeExercise(session: WorkoutSession): SessionExercise | null {
  return session.exercises.find((exercise) => exercise.estado === 'en-curso') ?? null;
}

export function currentSet(exercise: SessionExercise): SessionSet | null {
  return exercise.series.find((set) => !set.completed) ?? null;
}

export function pendingExercise(session: WorkoutSession): boolean {
  return session.exercises.some((exercise) => exercise.estado === 'pendiente' || exercise.estado === 'en-curso');
}

export function completedWorkCount(session: WorkoutSession): number {
  return session.exercises.reduce((sum, exercise) => sum + workOf(exercise).filter((set) => set.completed).length, 0);
}

export function sessionHasRecord(session: WorkoutSession, prior: Map<string, RecordSet[]>): string[] {
  const names: string[] = [];
  for (const exercise of session.exercises) {
    const history = prior.get(exercise.exerciseId) ?? [];
    const hit = workOf(exercise).some((set) => set.completed && isPersonalRecord(toRecord(set), history, exercise.medida));
    if (hit) names.push(exercise.nombre);
  }
  return names;
}

export function finishSession(
  session: WorkoutSession,
  prior: Map<string, RecordSet[]>,
  now = new Date(),
): WorkoutSession {
  const done = completedWorkCount(session);
  const stamp = now.toISOString();
  if (done === 0) {
    return {
      ...session,
      status: 'abandonada',
      finishedAt: stamp,
      date: localDateISO(now),
      xpAwarded: 0,
      xpParts: null,
      restEndsAt: null,
      recordNames: [],
    };
  }
  const recordNames = sessionHasRecord(session, prior);
  const parts = xpDeSesion({
    seriesDeTrabajoCompletadas: done,
    hayRecordEnLaSesion: recordNames.length > 0,
    planDayId: session.planDayId,
    camaraGravedad: session.camaraGravedad,
  });
  return {
    ...session,
    status: 'completada',
    finishedAt: stamp,
    date: localDateISO(now),
    xpAwarded: parts.total,
    xpParts: parts,
    restEndsAt: null,
    recordNames,
    exercises: session.exercises.map((exercise) =>
      exercise.estado === 'en-curso' || exercise.estado === 'pendiente' ? { ...exercise, estado: 'saltado' } : exercise,
    ),
  };
}

export function recomputeCompleted(session: WorkoutSession, prior: Map<string, RecordSet[]>): WorkoutSession {
  const recordNames = sessionHasRecord(session, prior);
  const parts = xpDeSesion({
    seriesDeTrabajoCompletadas: completedWorkCount(session),
    hayRecordEnLaSesion: recordNames.length > 0,
    planDayId: session.planDayId,
    camaraGravedad: session.camaraGravedad,
  });
  return { ...session, xpAwarded: parts.total, xpParts: parts, recordNames };
}

export function setsAsRecords(session: WorkoutSession): Map<string, RecordSet[]> {
  const map = new Map<string, RecordSet[]>();
  for (const exercise of session.exercises) {
    const list = map.get(exercise.exerciseId) ?? [];
    for (const set of workOf(exercise)) {
      if (set.completed) list.push(toRecord(set));
    }
    map.set(exercise.exerciseId, list);
  }
  return map;
}

export function volumeOf(session: WorkoutSession): { kg: number; bodyReps: number } {
  let kg = 0;
  let bodyReps = 0;
  for (const exercise of session.exercises) {
    for (const set of workOf(exercise)) {
      if (!set.completed) continue;
      const weight = set.pesoKg ?? 0;
      if (exercise.cuentaEnVolumen && weight > 0 && (set.reps ?? 0) > 0) kg += weight * (set.reps ?? 0);
      if ((weight <= 0) && exercise.medida === 'reps' && (set.reps ?? 0) > 0) bodyReps += set.reps ?? 0;
    }
  }
  return { kg, bodyReps };
}

export function allowedSubstitutes(
  exercises: readonly Exercise[],
  session: WorkoutSession,
  current: SessionExercise,
  profile: Profile,
): Exercise[] {
  const used = new Set(
    session.exercises.filter((item) => item.estado !== 'sustituido').map((item) => item.exerciseId),
  );
  return exercises
    .filter(
      (exercise) =>
        !exercise.archivado &&
        exercise.patron !== null &&
        exercise.nivel !== null &&
        exercise.patron === current.patron &&
        !used.has(exercise.id) &&
        (profile.level === 'avanzado' ||
          (profile.level === 'intermedio' && exercise.nivel !== 'avanzado') ||
          (profile.level === 'principiante' && exercise.nivel === 'principiante')),
    )
    .filter((exercise) => {
      const owned = new Set(profile.equipment);
      owned.add('peso-corporal');
      return exercise.equipo.every((item) => item === 'peso-corporal' || owned.has(item));
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
}
