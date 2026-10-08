import { useEffect, useState, type ReactElement } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { getRoutine, listSessions, performedFrom, releasePlanDay, savePlanDay, saveRoutine, saveSession } from '../db/db';
import { labelPattern } from '../domain/labels';
import type { Routine, RoutineItem } from '../domain/model';
import { uid } from '../domain/model';
import { buildSession } from '../domain/session';
import { readDraft, writeDraft, type BuilderDraft } from '../state/draft';
import { useApp } from '../state/app-state';
import { useWorkoutLauncher } from '../state/launch';
import { ExerciseThumb } from '../ui/ExerciseThumb';

export function BuilderPage(): ReactElement {
  const { id = 'nueva' } = useParams();
  const navigate = useNavigate();
  const { exercises, plan, profile, arc, refresh } = useApp();
  const { launch, dialog } = useWorkoutLauncher();
  const mode: BuilderDraft['mode'] = id === 'nueva' ? 'new' : id.startsWith('dia_') ? 'day' : 'routine';
  const realId = mode === 'day' ? id.slice(4) : id;
  const [name, setName] = useState('');
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const draft = readDraft();
    if (draft && (draft.id === realId || (mode === 'new' && draft.mode === 'new'))) {
      setName(draft.name);
      setItems(draft.items);
      setReady(true);
      return;
    }
    if (mode === 'day') {
      const day = plan?.days.find((item) => item.id === realId);
      if (!day) return;
      setName(`${day.date}`);
      setItems(day.items.map((item) => ({ exerciseId: item.exerciseId, series: item.series, repMin: item.repMin, repMax: item.repMax, descansoSegundos: item.descansoSegundos, nota: item.nota })));
      setReady(true);
      return;
    }
    if (mode === 'routine') {
      void getRoutine(realId).then((routine) => {
        if (!routine) return;
        setName(routine.name);
        setItems(routine.items);
        setReady(true);
      });
      return;
    }
    setReady(true);
  }, [mode, realId, plan]);

  function persistDraft(nextName = name, nextItems = items): void {
    writeDraft({ mode, id: realId, name: nextName, items: nextItems });
  }

  function update(index: number, patch: Partial<RoutineItem>): void {
    const next = items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    setItems(next);
    persistDraft(name, next);
  }

  function move(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (!items[target]) return;
    const next = [...items];
    const current = next[index];
    const other = next[target];
    if (!current || !other) return;
    next[index] = other;
    next[target] = current;
    setItems(next);
    persistDraft(name, next);
  }

  function validate(): string {
    if (mode !== 'day' && name.trim().length === 0) return 'Ponle un nombre a la rutina.';
    if (items.length === 0) return 'Añade un ejercicio.';
    for (const item of items) {
      if (item.series < 1 || item.series > 6) return 'Las series van de 1 a 6.';
      if (item.repMin < 1 || item.repMax > 30 || item.repMin > item.repMax) return 'Las repeticiones van de 1 a 30 y el mínimo no pasa del máximo.';
      if (item.descansoSegundos < 15 || item.descansoSegundos > 300 || item.descansoSegundos % 15 !== 0) return 'El descanso va de 15 a 300 segundos, de 15 en 15.';
      if (item.nota.length > 80) return 'La nota cabe en 80 caracteres.';
    }
    return '';
  }

  async function save(): Promise<void> {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    if (mode === 'day') {
      const day = plan?.days.find((item) => item.id === realId);
      if (!day) return;
      await savePlanDay({
        ...day,
        pinned: true,
        items: items.map((item) => {
          const exercise = exercises.find((entry) => entry.id === item.exerciseId);
          const previous = day.items.find((entry) => entry.exerciseId === item.exerciseId);
          return {
            exerciseId: item.exerciseId,
            slot: previous?.slot ?? exercise?.patron ?? 'core',
            series: item.series,
            repMin: item.repMin,
            repMax: item.repMax,
            repObjetivo: item.repMin,
            descansoSegundos: item.descansoSegundos,
            nota: item.nota,
            medida: exercise?.medida ?? 'reps',
            compuesto: exercise?.compuesto ?? false,
            pinned: previous?.pinned ?? false,
          };
        }),
      });
    } else {
      const routine: Routine = { id: mode === 'new' ? uid() : realId, name: name.trim(), items, updatedAt: new Date().toISOString() };
      await saveRoutine(routine);
    }
    writeDraft(null);
    await refresh();
    navigate('/plan');
  }

  if (!ready) return <main className="screen"><p>Cargando la rutina…</p></main>;

  return (
    <main className="screen">
      {dialog}
      <h1>{mode === 'day' ? 'Editar día' : mode === 'new' ? 'Nueva rutina' : 'Editar rutina'}</h1>
      {mode === 'day' ? null : (
        <label className="field">
          <span>Nombre</span>
          <input value={name} onChange={(event) => { setName(event.target.value); persistDraft(event.target.value, items); }} />
        </label>
      )}
      <ol className="builder-list">
        {items.map((item, index) => {
          const exercise = exercises.find((entry) => entry.id === item.exerciseId);
          return (
            <li key={`${item.exerciseId}-${index}`} className="card">
              <div className="plan-exercise">
                {exercise ? <ExerciseThumb exercise={exercise} nombre={exercise.nombre} /> : null}
                <strong>{exercise?.nombre ?? item.exerciseId}</strong>
              </div>
              <label className="field"><span>Series</span><input inputMode="numeric" value={item.series} onChange={(event) => update(index, { series: Number(event.target.value) })} /></label>
              <label className="field"><span>Repeticiones mínimas</span><input inputMode="numeric" value={item.repMin} onChange={(event) => update(index, { repMin: Number(event.target.value) })} /></label>
              <label className="field"><span>Repeticiones máximas</span><input inputMode="numeric" value={item.repMax} onChange={(event) => update(index, { repMax: Number(event.target.value) })} /></label>
              <label className="field"><span>Descanso en segundos</span><input inputMode="numeric" value={item.descansoSegundos} onChange={(event) => update(index, { descansoSegundos: Number(event.target.value) })} /></label>
              <label className="field"><span>Nota</span><input value={item.nota} maxLength={80} onChange={(event) => update(index, { nota: event.target.value })} /></label>
              <div className="row">
                <button type="button" className="btn" onClick={() => move(index, -1)} aria-label={`Subir ${exercise?.nombre ?? 'ejercicio'}`}>Subir</button>
                <button type="button" className="btn" onClick={() => move(index, 1)} aria-label={`Bajar ${exercise?.nombre ?? 'ejercicio'}`}>Bajar</button>
                <button type="button" className="btn btn-danger" onClick={() => { const next = items.filter((_, itemIndex) => itemIndex !== index); setItems(next); persistDraft(name, next); }}>Quitar</button>
              </div>
              {exercise?.patron ? <p className="muted">{labelPattern(exercise.patron)}</p> : null}
            </li>
          );
        })}
      </ol>
      {error ? <strong className="error">{error}</strong> : null}
      <div className="row">
        <Link className="btn" to="/biblioteca" onClick={() => persistDraft()}>Añadir de la biblioteca</Link>
        <button type="button" className="btn btn-primary" onClick={() => void save()}>Guardar</button>
        {mode === 'day' ? (
          <button type="button" className="btn" onClick={() => void releasePlanDay(realId).then(() => refresh()).then(() => navigate('/plan'))}>Soltar este día</button>
        ) : null}
        {mode !== 'day' && profile && arc ? (
          <button
            type="button"
            className="btn"
            onClick={() =>
              void launch(async () => {
                const routine: Routine = { id: mode === 'new' ? uid() : realId, name: name.trim() || 'Rutina libre', items, updatedAt: new Date().toISOString() };
                if (mode !== 'new' || name.trim()) await saveRoutine(routine);
                const history = await listSessions();
                const session = buildSession({
                  profile,
                  exercises,
                  nombre: routine.name,
                  routine,
                  weekInArc: arc.weekInArc,
                  performed: performedFrom(history),
                });
                await saveSession(session);
                return session.id;
              })
            }
          >
            Empezar rutina libre
          </button>
        ) : null}
      </div>
    </main>
  );
}
