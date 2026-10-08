import { useEffect, useRef, useState, type ReactElement } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { playRestDone, playSetComplete, playTick } from '../audio/tones';
import {
  applySessionXp,
  getRoutine,
  getSession,
  listSessions,
  pinPlanSlot,
  savePlanDay,
  saveRoutine,
  saveSession,
  performedFrom,
} from '../db/db';
import { formatInt, formatWeightKg } from '../domain/format';
import { labelPattern } from '../domain/labels';
import type { SessionExercise, SessionSet, WorkoutSession } from '../domain/model';
import { nivelDePoder, rankForXp } from '../domain/ranks';
import {
  activeExercise,
  allowedSubstitutes,
  completeSet,
  currentSet,
  finishSession,
  keepPreviousWeight,
  moveExercise,
  patchSet,
  pendingExercise,
  priorHistory,
  setRestSeconds,
  shiftRest,
  skipExercise,
  substituteExercise,
  toggleCamera,
  type PerformedSet,
} from '../domain/session';
import { fromDisplay, toDisplay } from '../domain/units';
import { proposeLoad } from '../domain/loads';
import { useApp } from '../state/app-state';
import type { CoachEvent } from '../domain/coach';
import { Avatar } from '../ui/Avatar';
import { CoachBubble } from '../ui/CoachBubble';
import { Dialog } from '../ui/Dialog';
import { exerciseStageMedia } from '../catalog/media';
import { ExerciseThumb } from '../ui/ExerciseThumb';
import { HowTo } from '../ui/HowTo';
import { Switch } from '../ui/Switch';

function previousLine(exercise: SessionExercise, performed: PerformedSet[], unit: 'kg' | 'lb'): string {
  const latest = priorHistory(performed, exercise.exerciseId)[0]?.sets.at(-1);
  if (!latest) return 'Primera vez. Empieza ligero.';
  if (latest.pesoKg <= 0) {
    if (exercise.medida === 'segundos') return `Anterior: ${latest.segundos ?? 0} s`;
    return `Anterior: ${latest.reps ?? 0} reps`;
  }
  return `Anterior: ${formatWeightKg(latest.pesoKg, unit)} × ${latest.reps ?? 0}`;
}

export function PlayerPage(): ReactElement {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { profile, exercises, plan, refresh, setNotice } = useApp();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [performed, setPerformed] = useState<PerformedSet[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [impact, setImpact] = useState(false);
  const [coachEvent, setCoachEvent] = useState<CoachEvent>('empezar');
  const [coachTick, setCoachTick] = useState(0);
  const mitadSaid = useRef<string | null>(null);
  const [finishAsk, setFinishAsk] = useState(false);
  const [substituteOpen, setSubstituteOpen] = useState(false);
  const [pinChange, setPinChange] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [saveRest, setSaveRest] = useState(false);
  const [liveText, setLiveText] = useState('');
  const sessionRef = useRef<WorkoutSession | null>(null);
  const announced = useRef<number | null>(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    void getSession(id).then((found) => {
      if (!found || found.status !== 'en-curso') {
        navigate(found ? `/entreno/${found.id}/resumen` : '/', { replace: true });
        return;
      }
      setSession(found);
      announced.current = found.restAnnounced;
    });
    void listSessions().then((rows) => setPerformed(performedFrom(rows)));
  }, [id, navigate]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const current = sessionRef.current;
    if (!current?.restEndsAt || !profile) return;
    const left = Math.max(0, Math.ceil((new Date(current.restEndsAt).getTime() - now) / 1000));
    const marks = [30, 10, 3, 2, 1, 0];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (announced.current === null) {
      announced.current = left;
      setLiveText(`Descanso de ${left} segundos`);
    }
    for (const mark of marks) {
      if (left <= mark && (announced.current ?? 999) > mark) {
        announced.current = mark;
        if (mark === 0) {
          playRestDone(profile.sound);
          setLiveText('Descanso terminado');
          setCoachEvent('descanso');
          setCoachTick((value) => value + 1);
          const cleared = { ...current, restEndsAt: null, restAnnounced: 0 };
          setSession(cleared);
          void saveSession(cleared);
        } else {
          if (mark <= 3) playTick(profile.sound, profile.theme, reduced);
          if (mark === 30 || mark === 10 || mark === 3) setLiveText(String(mark));
        }
      }
    }
  }, [now, profile]);

  useEffect(() => {
    function onKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') return;
      if (!(event.ctrlKey || event.metaKey) || event.key !== 'Enter') return;
      event.preventDefault();
      void onComplete();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!profile || !session) return <main className="player"><p>Abriendo el entreno…</p></main>;

  const current = activeExercise(session);
  const set = current ? currentSet(current) : null;
  const locked = session.exercises.some((exercise) => exercise.series.some((item) => item.kind === 'trabajo' && item.completed));
  const cameraReady = nivelDePoder(profile.xpTotal) >= 13;
  const left = session.restEndsAt ? Math.max(0, Math.ceil((new Date(session.restEndsAt).getTime() - now) / 1000)) : 0;
  const restTotal = Math.max(left, current?.descansoSegundos ?? 0, 1);
  const restRatio = left / restTotal;
  const catalogExercise = exercises.find((exercise) => exercise.id === detailId);
  const currentCatalog = current ? exercises.find((exercise) => exercise.id === current.exerciseId) : null;
  const currentMedia = currentCatalog ? exerciseStageMedia(currentCatalog) : null;
  const substitutes = current ? allowedSubstitutes(exercises, session, current, profile) : [];

  async function persist(next: WorkoutSession, previous: WorkoutSession): Promise<boolean> {
    setSession(next);
    try {
      await saveSession(next);
      setSaveError('');
      return true;
    } catch {
      setSession(previous);
      setSaveError('No se pudo guardar. Reintenta.');
      return false;
    }
  }

  async function onComplete(): Promise<void> {
    const live = sessionRef.current;
    if (!live || !profile) return;
    const exercise = activeExercise(live);
    const active = exercise ? currentSet(exercise) : null;
    if (!exercise || !active) return;
    const seeded =
      exercise.medida === 'segundos' && active.segundos === null
        ? patchSet(live, exercise.instanceId, active.id, { segundos: exercise.repMin })
        : exercise.medida === 'reps' && active.reps === null
          ? patchSet(live, exercise.instanceId, active.id, { reps: exercise.repMin })
          : live;
    const result = completeSet(seeded, exercise.instanceId, active.id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) {
      setImpact(true);
      window.setTimeout(() => setImpact(false), 1200);
    }
    playSetComplete(profile.sound);
    setCoachEvent('serie');
    setCoachTick((value) => value + 1);
    announced.current = null;
    const saved = await persist(result.session, live);
    if (!saved) setImpact(false);
  }

  function editSet(exercise: SessionExercise, item: SessionSet, field: 'pesoKg' | 'reps' | 'segundos', raw: string): void {
    const live = sessionRef.current;
    if (!live || !profile) return;
    const value = raw.trim() === '' ? null : Number(raw.replace(',', '.'));
    if (value !== null && Number.isNaN(value)) return;
    if (mitadSaid.current !== item.id && raw.trim() !== '') {
      mitadSaid.current = item.id;
      setCoachEvent('mitad');
      setCoachTick((tick) => tick + 1);
    }
    const patch =
      field === 'pesoKg'
        ? { pesoKg: value === null ? null : fromDisplay(value, profile.unit) }
        : { [field]: value };
    const next = patchSet(live, exercise.instanceId, item.id, patch);
    setSession(next);
    void saveSession(next).catch(() => {
      setSession(live);
      setSaveError('No se pudo guardar. Reintenta.');
    });
  }

  async function changeRest(delta: number): Promise<void> {
    const live = sessionRef.current;
    if (!live) return;
    let next = shiftRest(live, delta);
    if (saveRest && current) {
      next = {
        ...next,
        exercises: next.exercises.map((exercise) =>
          exercise.instanceId === current.instanceId
            ? { ...exercise, descansoSegundos: Math.max(0, exercise.descansoSegundos + delta) }
            : exercise,
        ),
      };
      await rememberRest(next, current.exerciseId);
    }
    await persist(next, live);
  }

  async function rememberRest(next: WorkoutSession, exerciseId: string): Promise<void> {
    const block = next.exercises.find((exercise) => exercise.exerciseId === exerciseId && exercise.estado !== 'sustituido');
    if (!block) return;
    if (next.routineId) {
      const routine = await getRoutine(next.routineId);
      if (routine) {
        await saveRoutine({
          ...routine,
          items: routine.items.map((item) =>
            item.exerciseId === exerciseId ? { ...item, descansoSegundos: block.descansoSegundos } : item,
          ),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    if (next.planDayId && plan) {
      const day = plan.days.find((item) => item.id === next.planDayId);
      if (day) {
        await savePlanDay({
          ...day,
          items: day.items.map((item) =>
            item.exerciseId === exerciseId ? { ...item, descansoSegundos: block.descansoSegundos } : item,
          ),
        });
      }
    }
  }

  async function onSkip(): Promise<void> {
    const live = sessionRef.current;
    if (!live || !current) return;
    const result = skipExercise(live, current.instanceId);
    setCoachEvent('salto');
    setCoachTick((value) => value + 1);
    await persist(result.session, live);
    if (result.needsFinish) setFinishAsk(true);
  }

  async function onSubstitute(exerciseId: string): Promise<void> {
    const live = sessionRef.current;
    if (!live || !current || !profile) return;
    const replacement = exercises.find((exercise) => exercise.id === exerciseId);
    if (!replacement) return;
    const history = priorHistory(performed, replacement.id);
    const proposal = proposeLoad({
      history,
      repMin: current.repMin,
      repMax: current.repMax,
      compuesto: replacement.compuesto,
      unit: profile.unit,
      increment: profile.increment,
      medida: replacement.medida,
      weekInArc: live.weekInArc,
      allowUp: live.weekInArc !== 3,
    });
    const next = substituteExercise(live, current.instanceId, replacement, proposal, profile);
    await persist(next, live);
    if (pinChange && live.planDayId && current.slot) await pinPlanSlot(live.planDayId, current.slot, replacement.id);
    setSubstituteOpen(false);
  }

  async function endWorkout(): Promise<void> {
    const live = sessionRef.current;
    if (!live || !profile) return;
    const prior = new Map<string, PerformedSet[]>();
    for (const row of performed) {
      const list = prior.get(row.exerciseId) ?? [];
      list.push(row);
      prior.set(row.exerciseId, list);
    }
    const finished = finishSession(live, prior);
    await saveSession(finished);
    if (finished.status === 'abandonada') {
      setNotice('Sin series de trabajo no hay poder nuevo. El entreno queda en el historial.');
      await refresh();
      navigate('/');
      return;
    }
    const xpBefore = profile.xpTotal;
    await applySessionXp(0, finished);
    await refresh();
    navigate(`/entreno/${finished.id}/resumen`, { state: { xpBefore } });
  }

  function askFinish(): void {
    const live = sessionRef.current;
    if (!live) return;
    if (pendingExercise(live)) setFinishAsk(true);
    else void endWorkout();
  }

  const workSets = current?.series.filter((item) => item.kind === 'trabajo') ?? [];
  const serieTotal = Math.max(1, workSets.length);
  const serieIndex = workSets.findIndex((item) => item.id === set?.id);
  const serieNumero = serieIndex >= 0 ? serieIndex + 1 : 1;
  const rankId = rankForXp(profile.xpTotal).id;
  const repsShown = !set || !current ? 0 : current.medida === 'segundos' ? (set.segundos ?? current.repMin) : (set.reps ?? current.repMin);
  const kgShown = set?.pesoKg === null || set?.pesoKg === undefined ? 0 : Math.round(toDisplay(set.pesoKg, profile.unit) * 1000) / 1000;

  function bump(field: 'reps' | 'pesoKg' | 'segundos', delta: number): void {
    if (!current || !set || !profile) return;
    if (field === 'pesoKg') {
      const shown = set.pesoKg === null ? 0 : toDisplay(set.pesoKg, profile.unit);
      const next = Math.max(0, Math.round((shown + delta) * 10) / 10);
      editSet(current, set, 'pesoKg', String(next));
      return;
    }
    const base = field === 'reps' ? (set.reps ?? current.repMin) : (set.segundos ?? current.repMin);
    editSet(current, set, field, String(Math.max(0, base + delta)));
  }

  return (
    <main className={`player player-fit ${impact ? 'impact pf-impact is-hit' : ''}`}>
      <p className="sr" aria-live="polite">{liveText}</p>
      <CoachBubble event={coachEvent} tick={coachTick} />
      <header className="player-title">
        <div>
          <h1>{current?.nombre ?? session.nombre}</h1>
          {current && set ? <p className="kicker">Serie {serieNumero} de {serieTotal}</p> : null}
        </div>
        <div className="player-title-actions">
          {current ? (
            <details className="player-more">
              <summary className="more-icon"><span className="sr">Más opciones</span><span aria-hidden="true">⋯</span></summary>
              <div className="more-panel">
              <div className="camera-row">
                <Switch
                  checked={session.camaraGravedad}
                  disabled={!cameraReady || locked}
                  label="Cámara de gravedad"
                  onChange={(checked) => {
                    const next = toggleCamera(session, checked);
                    void persist(next, session);
                  }}
                />
                {session.weekInArc === 4 ? <small>Esta semana es templo. La cámara espera.</small> : null}
                {cameraReady ? null : <small>Se abre en el rango Llama.</small>}
              </div>
              <button type="button" className="btn" onClick={() => setDetailId(current.exerciseId)}>Ver ficha</button>
              <button type="button" className="btn" onClick={() => setSubstituteOpen(true)}>Sustituir ejercicio</button>
              <ul className="plain">
                {session.exercises.filter((exercise) => exercise.estado === 'pendiente').map((exercise) => (
                  <li key={exercise.instanceId} className="queue-row queue-row--reorder">
                    <strong title={exercise.nombre}>{exercise.nombre}</strong>
                    <button type="button" className="icon-btn" aria-label={`Subir ${exercise.nombre}`} onClick={() => void persist(moveExercise(session, exercise.instanceId, -1), session)}>
                      <span aria-hidden="true">↑</span>
                    </button>
                    <button type="button" className="icon-btn" aria-label={`Bajar ${exercise.nombre}`} onClick={() => void persist(moveExercise(session, exercise.instanceId, 1), session)}>
                      <span aria-hidden="true">↓</span>
                    </button>
                </li>
              ))}
            </ul>
              </div>
            </details>
          ) : null}
          <button type="button" className="text-link" onClick={askFinish}>Terminar</button>
        </div>
      </header>
      {saveError ? <strong className="error">{saveError}</strong> : null}
      {current ? (
        <section className="player-now">
          <div className="player-hero">
            {currentMedia ? (
              <div className="player-exercise-media gv-media is-player" aria-hidden="true">
                <img src={currentMedia} alt="" loading="eager" />
              </div>
            ) : null}
            <Avatar gender={profile.avatar} rank={rankId} pose="entrenando" />
            {impact ? <p className="zas" aria-hidden="true">¡ZAS!</p> : null}
          </div>
          {impact ? <p className="narracion">¡Tu poder aumenta!</p> : null}
          {session.restEndsAt ? (
            <div className="rest-inline" role="region" aria-label="Descanso">
              <div className="rest-ring" style={{ ['--rest' as string]: String(restRatio) }} aria-hidden="true">
                <span className="timer">{formatInt(left)}</span>
              </div>
              <div className="rest-copy">
                <p className="kicker">Descanso</p>
                <div className="rest-track" aria-hidden="true">
                  <span style={{ width: `${Math.round(restRatio * 100)}%` }} />
                </div>
                <div className="row">
                  <button type="button" className="btn" onClick={() => void changeRest(15)}>+15 s</button>
                  <button type="button" className="btn" onClick={() => void changeRest(-15)}>−15 s</button>
                </div>
              </div>
            </div>
          ) : null}
          <div className="set-segments" aria-label="Series">
            {workSets.map((item, index) => {
              const done = item.completed;
              const nowSet = item.id === set?.id;
              const tone = done ? 'is-done' : nowSet ? 'is-now' : '';
              const label = done ? 'Hecha' : nowSet ? 'Ahora' : String(index + 1);
              return (
                <span key={item.id} className={`set-seg ${tone}`}>
                  {label}
                </span>
              );
            })}
          </div>
          {set ? (
            <ol className="set-list">
              <li className="set-line is-current big-set">
                <div className="stepper-block kg">
                  <span>{profile.unit}</span>
                  <div className="stepper">
                    <button type="button" onClick={() => bump('pesoKg', -profile.increment)} aria-label="Menos peso">
                      −
                    </button>
                    <input
                      inputMode="decimal"
                      aria-label={`Peso (${profile.unit})`}
                      value={String(kgShown)}
                      onChange={(event) => editSet(current, set, 'pesoKg', event.target.value)}
                    />
                    <button type="button" onClick={() => bump('pesoKg', profile.increment)} aria-label="Más peso">
                      +
                    </button>
                  </div>
                </div>
                <div className="stepper-block reps">
                  <span>{current.medida === 'segundos' ? 'Segundos' : 'Reps'}</span>
                  <div className="stepper">
                    <button type="button" onClick={() => bump(current.medida === 'segundos' ? 'segundos' : 'reps', -1)} aria-label={current.medida === 'segundos' ? 'Bajar segundos' : 'Bajar'}>
                      −
                    </button>
                    {current.medida === 'segundos' ? (
                      <input aria-label="Segundos" inputMode="numeric" value={String(repsShown)} onChange={(event) => editSet(current, set, 'segundos', event.target.value)} />
                    ) : (
                      <input aria-label="Repeticiones" inputMode="numeric" value={String(repsShown)} onChange={(event) => editSet(current, set, 'reps', event.target.value)} />
                    )}
                    <button type="button" onClick={() => bump(current.medida === 'segundos' ? 'segundos' : 'reps', 1)} aria-label={current.medida === 'segundos' ? 'Subir segundos' : 'Subir'}>
                      +
                    </button>
                  </div>
                </div>
              </li>
            </ol>
          ) : null}
          <p className="muted">{previousLine(current, performed, profile.unit)}</p>
          {current.propuesta === 'sube' ? <p>Sube</p> : null}
          {current.propuesta === 'baja' ? <p>Baja</p> : null}
          {current.propuesta === 'sube' || current.propuesta === 'baja' ? (
            <button type="button" className="btn" onClick={() => void persist(keepPreviousWeight(session, current.instanceId), session)}>
              Mantener
            </button>
          ) : null}
          {session.restEndsAt ? (
            <div className="rest-tools">
              <label className="rest-edit">
                <span>Tiempo restante</span>
                <input
                  inputMode="numeric"
                  value={left}
                  onChange={(event) => {
                    const seconds = Number(event.target.value);
                    if (Number.isNaN(seconds)) return;
                    void persist(setRestSeconds(session, seconds), session);
                  }}
                />
              </label>
              <Switch checked={saveRest} label="Guardar para este ejercicio" onChange={setSaveRest} />
            </div>
          ) : null}
          {error ? <strong className="error">{error}</strong> : null}
          <button type="button" className="btn btn-primary" onClick={() => void onComplete()}>Completar serie</button>
          <button type="button" className="btn btn-danger" onClick={() => void onSkip()}>Saltar</button>
        </section>
      ) : (
        <p>No queda ningún ejercicio pendiente.</p>
      )}
      <p className="muted shortcuts">Atajos: Ctrl o Cmd + Enter completa la serie. Escape no termina el entreno.</p>
      {finishAsk ? (
        <Dialog title="Terminar entreno" onClose={() => setFinishAsk(false)}>
          <p>Terminar con lo que ya hiciste</p>
          <div className="row">
            <button type="button" className="btn btn-primary" onClick={() => void endWorkout()}>Terminar con lo que ya hiciste</button>
            <button type="button" className="btn" onClick={() => setFinishAsk(false)}>Volver</button>
          </div>
        </Dialog>
      ) : null}
      {substituteOpen && current ? (
        <Dialog title="Sustituir ejercicio" onClose={() => setSubstituteOpen(false)}>
          {current.slot ? (
            <label className="field">
              <span>Usar este cambio en el plan</span>
              <input type="checkbox" checked={pinChange} onChange={(event) => setPinChange(event.target.checked)} />
            </label>
          ) : null}
          {substitutes.length === 0 ? <p>No hay otro ejercicio de este patrón con tu equipo.</p> : null}
          <ul className="plain">
            {substitutes.map((exercise) => (
              <li key={exercise.id}>
                <button type="button" className="btn substitute-btn" onClick={() => void onSubstitute(exercise.id)}>
                  <ExerciseThumb exercise={exercise} nombre={exercise.nombre} />
                  <span>{exercise.nombre}{exercise.patron ? ` · ${labelPattern(exercise.patron)}` : ''}</span>
                </button>
              </li>
            ))}
          </ul>
        </Dialog>
      ) : null}
      {catalogExercise ? (
        <Dialog title={catalogExercise.nombre} onClose={() => setDetailId(null)}>
          <HowTo exercise={catalogExercise} />
          <Link to={`/biblioteca/${catalogExercise.id}`}>Abrir la ficha</Link>
        </Dialog>
      ) : null}
    </main>
  );
}

