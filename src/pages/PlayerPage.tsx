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
import { nivelDePoder } from '../domain/ranks';
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
import { Dialog } from '../ui/Dialog';

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
  const visible = session.exercises.filter((exercise) => exercise.estado !== 'sustituido');
  const position = Math.max(1, visible.findIndex((exercise) => exercise.instanceId === current?.instanceId) + 1);
  const locked = session.exercises.some((exercise) => exercise.series.some((item) => item.kind === 'trabajo' && item.completed));
  const cameraReady = nivelDePoder(profile.xpTotal) >= 13;
  const left = session.restEndsAt ? Math.max(0, Math.ceil((new Date(session.restEndsAt).getTime() - now) / 1000)) : 0;
  const catalogExercise = exercises.find((exercise) => exercise.id === detailId);
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
    const result = completeSet(live, exercise.instanceId, active.id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
    setImpact(true);
    window.setTimeout(() => setImpact(false), 220);
    playSetComplete(profile.sound);
    announced.current = null;
    const saved = await persist(result.session, live);
    if (!saved) setImpact(false);
  }

  function editSet(exercise: SessionExercise, item: SessionSet, field: 'pesoKg' | 'reps' | 'segundos', raw: string): void {
    const live = sessionRef.current;
    if (!live || !profile) return;
    const value = raw.trim() === '' ? null : Number(raw.replace(',', '.'));
    if (value !== null && Number.isNaN(value)) return;
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

  return (
    <main className={`player ${impact ? 'impact' : ''}`}>
      <p className="sr" aria-live="polite">{liveText}</p>
      <header className="player-head">
        <div>
          <p className="kicker">{session.nombre}</p>
          <h1>Ejercicio {position} de {visible.length}</h1>
        </div>
        <button type="button" className="btn" onClick={askFinish}>Terminar</button>
      </header>
      <label className="field">
        <span>Cámara de gravedad</span>
        {session.weekInArc === 4 ? <small>Esta semana es templo. La cámara espera.</small> : null}
        <input
          type="checkbox"
          checked={session.camaraGravedad}
          disabled={!cameraReady || locked}
          onChange={(event) => {
            const next = toggleCamera(session, event.target.checked);
            void persist(next, session);
          }}
        />
        {cameraReady ? null : <small>Se abre en el rango Llama.</small>}
      </label>
      {saveError ? <strong className="error">{saveError}</strong> : null}
      {session.restEndsAt ? (
        <section className="card player-rest">
          <p>Descanso</p>
          <p className="timer">{formatInt(left)}</p>
          <div className="row">
            <button type="button" className="btn" onClick={() => void changeRest(15)}>+15 s</button>
            <button type="button" className="btn" onClick={() => void changeRest(-15)}>−15 s</button>
          </div>
          <label className="field">
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
          <label className="field">
            <span>Guardar para este ejercicio</span>
            <input type="checkbox" checked={saveRest} onChange={(event) => setSaveRest(event.target.checked)} />
          </label>
        </section>
      ) : null}
      {current ? (
        <section>
          {profile.theme !== 'suave' ? <div className="speed-lines" aria-hidden="true" /> : null}
          <h2>
            <button type="button" className="btn" onClick={() => setDetailId(current.exerciseId)}>{current.nombre}</button>
          </h2>
          {current.nota ? <p>{current.nota}</p> : null}
          <p>{previousLine(current, performed, profile.unit)}</p>
          {current.propuesta === 'sube' ? <p>Sube</p> : null}
          {current.propuesta === 'baja' ? <p>Baja</p> : null}
          {current.propuesta === 'sube' || current.propuesta === 'baja' ? (
            <button type="button" className="btn" onClick={() => void persist(keepPreviousWeight(session, current.instanceId), session)}>
              Mantener
            </button>
          ) : null}
          <ol className="plain">
            {current.series.map((item, index) => (
              <li key={item.id} className={`set-row ${item.id === set?.id ? 'is-current' : ''} ${item.completed ? 'is-done' : ''}`}>
                <p>{item.kind === 'calentamiento' ? 'Calentamiento' : `Serie ${index + 1}`}{item.completed ? ' · Hecha' : ''}</p>
                <label className="field">
                  <span>Peso ({profile.unit})</span>
                  <input
                    inputMode="decimal"
                    value={item.pesoKg === null ? '' : String(Math.round(toDisplay(item.pesoKg, profile.unit) * 1000) / 1000)}
                    onChange={(event) => editSet(current, item, 'pesoKg', event.target.value)}
                  />
                </label>
                {current.medida === 'segundos' ? (
                  <label className="field">
                    <span>Segundos</span>
                    <input inputMode="numeric" value={item.segundos ?? ''} onChange={(event) => editSet(current, item, 'segundos', event.target.value)} />
                  </label>
                ) : (
                  <label className="field">
                    <span>Repeticiones</span>
                    <input inputMode="numeric" value={item.reps ?? ''} onChange={(event) => editSet(current, item, 'reps', event.target.value)} />
                  </label>
                )}
                {item.id === set?.id ? (
                  <button type="button" className="btn btn-primary btn-complete" onClick={() => void onComplete()}>
                    Completar serie
                  </button>
                ) : null}
              </li>
            ))}
          </ol>
          {error ? <strong className="error">{error}</strong> : null}
          <div className="row">
            <button type="button" className="btn" onClick={() => setSubstituteOpen(true)}>Sustituir ejercicio</button>
            <button type="button" className="btn btn-danger" onClick={() => void onSkip()}>Saltar ejercicio</button>
          </div>
        </section>
      ) : (
        <p>No queda ningún ejercicio pendiente.</p>
      )}
      <section>
        <h2>Cola</h2>
        <ul className="plain">
          {session.exercises.filter((exercise) => exercise.estado === 'pendiente').map((exercise) => (
            <li key={exercise.instanceId} className="card">
              <strong>{exercise.nombre}</strong>
              <div className="row">
                <button type="button" className="btn" aria-label={`Subir ${exercise.nombre}`} onClick={() => void persist(moveExercise(session, exercise.instanceId, -1), session)}>Subir</button>
                <button type="button" className="btn" aria-label={`Bajar ${exercise.nombre}`} onClick={() => void persist(moveExercise(session, exercise.instanceId, 1), session)}>Bajar</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
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
                <button type="button" className="btn" onClick={() => void onSubstitute(exercise.id)}>
                  {exercise.nombre}{exercise.patron ? ` · ${labelPattern(exercise.patron)}` : ''}
                </button>
              </li>
            ))}
          </ul>
        </Dialog>
      ) : null}
      {catalogExercise ? (
        <Dialog title={catalogExercise.nombre} onClose={() => setDetailId(null)}>
          <ol>
            {catalogExercise.pasos.map((step) => <li key={step}>{step}</li>)}
          </ol>
          <Link to={`/biblioteca/${catalogExercise.id}`}>Abrir la ficha</Link>
        </Dialog>
      ) : null}
    </main>
  );
}

