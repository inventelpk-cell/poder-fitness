import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { Link } from 'react-router';
import { listHero, listSessions, listWeights, saveWeight } from '../db/db';
import { addDays, localDateISO, mondayOf } from '../domain/dates';
import { formatDecimal, formatInt, formatWeightKg } from '../domain/format';
import { oneRmEstimado, formatOneRm } from '../domain/one-rm';
import type { HeroLog, WorkoutSession } from '../domain/model';
import { volumeOf } from '../domain/session';
import { fromDisplay, toDisplay } from '../domain/units';
import { useApp } from '../state/app-state';

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function monthGrid(year: number, month: number): string[] {
  const first = `${year}-${String(month).padStart(2, '0')}-01`;
  const start = mondayOf(first);
  const cells: string[] = [];
  for (let i = 0; i < 42; i += 1) cells.push(addDays(start, i));
  return cells;
}

export function CalendarPage(): ReactElement {
  const today = localDateISO();
  const [cursor, setCursor] = useState(today.slice(0, 7));
  const [selected, setSelected] = useState(today);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [heroes, setHeroes] = useState<HeroLog[]>([]);
  const { profile } = useApp();

  useEffect(() => {
    void listSessions().then(setSessions);
    void listHero().then(setHeroes);
  }, []);

  const [year, month] = cursor.split('-').map(Number);
  const cells = monthGrid(year ?? 2026, month ?? 1);
  const train = new Set(sessions.filter((session) => session.status === 'completada').map((session) => session.date));
  const hero = new Set(heroes.map((log) => log.date));
  const daySessions = sessions.filter((session) => session.date === selected);
  const dayHero = heroes.find((log) => log.date === selected);

  return (
    <main className="screen">
      <HistoryNav />
      <h1>Historial</h1>
      <div className="row">
        <button type="button" className="btn" onClick={() => setCursor(shiftMonth(cursor, -1))}>Mes anterior</button>
        <p>{MONTHS[(month ?? 1) - 1]} {year}</p>
        <button type="button" className="btn" onClick={() => setCursor(shiftMonth(cursor, 1))}>Mes siguiente</button>
      </div>
      <div className="calendar" role="grid" aria-label="Calendario">
        {WEEKDAYS.map((label) => <div key={label}>{label}</div>)}
        {cells.map((iso) => {
          const inMonth = iso.slice(0, 7) === cursor;
          const hasTrain = train.has(iso);
          const hasHero = hero.has(iso);
          return (
            <button key={iso} type="button" aria-pressed={selected === iso} onClick={() => setSelected(iso)}>
              <span>{iso.slice(8)}</span>
              <span className="dots">
                {hasTrain ? <i className="dot dot-train" /> : null}
                {hasHero ? <i className="dot dot-hero" /> : null}
              </span>
              <span className="sr">{inMonth ? '' : 'Fuera de este mes. '}{hasTrain ? 'Entreno. ' : ''}{hasHero ? 'Reto.' : ''}</span>
            </button>
          );
        })}
      </div>
      <section className="card">
        <h2>{selected}</h2>
        {daySessions.length === 0 && !dayHero ? <p>Este día está en blanco.</p> : null}
        {daySessions.map((session) => (
          <p key={session.id}>
            {new Date(session.startedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} · {session.nombre} · {profile ? formatWeightKg(volumeOf(session).kg, profile.unit) : ''} · {formatInt(session.xpAwarded)} XP
          </p>
        ))}
        {dayHero ? <p>Reto: {dayHero.flexiones} flexiones, {dayHero.abdominales} abdominales, {dayHero.sentadillas} sentadillas, {formatDecimal(dayHero.km, 1)} km</p> : null}
      </section>
      {sessions.filter((session) => session.status === 'completada').length === 0 ? (
        <div className="empty-card">
          <img src="/design/illustrations/empty-historial.svg" alt="" width="180" height="140" />
          <p>Cuando cierres un entreno, aparecerá aquí.</p>
        </div>
      ) : null}
    </main>
  );
}

export function VolumePage(): ReactElement {
  const { profile } = useApp();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  useEffect(() => { void listSessions().then(setSessions); }, []);
  const weeks = useMemo(() => lastWeeks(sessions), [sessions]);
  const max = Math.max(1, ...weeks.map((week) => week.kg));
  if (!profile) return <main className="screen"><p>Cargando…</p></main>;
  return (
    <main className="screen">
      <HistoryNav />
      <h1>Volumen</h1>
      <svg className="chart" viewBox="0 0 640 220" aria-hidden="true">
        {weeks.map((week, index) => (
          <g key={week.start}>
            <rect x={24 + index * 50} y={180 - (week.kg / max) * 140} width="18" height={(week.kg / max) * 140} fill="#FF6A1A" />
            <rect x={44 + index * 50} y={180 - Math.min(140, week.reps / 4)} width="18" height={Math.min(140, week.reps / 4)} fill="#5CE1FF" />
            <text x={28 + index * 50} y="200">{week.start.slice(5)}</text>
          </g>
        ))}
      </svg>
      <p className="muted">Naranja: kilos. Cian: repeticiones con el cuerpo.</p>
      <table>
        <caption>Volumen de las últimas 12 semanas</caption>
        <thead><tr><th>Semana</th><th>Volumen</th><th>Repeticiones con el cuerpo</th></tr></thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week.start}>
              <td>{week.start}</td>
              <td>{formatWeightKg(week.kg, profile.unit)}</td>
              <td>{formatInt(week.reps)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

export function RecordsPage(): ReactElement {
  const { profile } = useApp();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  useEffect(() => { void listSessions().then(setSessions); }, []);
  const rows = useMemo(() => bestRecords(sessions), [sessions]);
  if (!profile) return <main className="screen"><p>Cargando…</p></main>;
  return (
    <main className="screen">
      <HistoryNav />
      <h1>Récords</h1>
      {rows.length === 0 ? <p>Cuando cierres un entreno, aparecerá aquí.</p> : null}
      <ul className="plain">
        {rows.map((row) => (
          <li key={row.exerciseId} className="card">
            <strong>{row.nombre}</strong>
            <p>{row.bestKg > 0 ? formatWeightKg(row.bestKg, profile.unit) : 'Peso corporal'} · {row.bestReps} reps{row.bestSeconds > 0 ? ` · ${row.bestSeconds} s` : ''}</p>
            {row.oneRm !== null ? <p>1RM estimado: {formatOneRm(toDisplay(row.oneRm, profile.unit))} {profile.unit}</p> : null}
            {row.needsTen ? <p>El 1RM estimado pide 10 repeticiones o menos.</p> : null}
          </li>
        ))}
      </ul>
    </main>
  );
}

export function WeightPage(): ReactElement {
  const { profile } = useApp();
  const [rows, setRows] = useState<{ date: string; kg: number; nota: string }[]>([]);
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { void listWeights().then(setRows); }, []);
  if (!profile) return <main className="screen"><p>Cargando…</p></main>;
  const min = profile.unit === 'lb' ? 44 : 20;
  const max = profile.unit === 'lb' ? 882 : 400;
  const recent = rows.filter((row) => row.date >= addDays(localDateISO(), -90)).slice().reverse();
  const peak = Math.max(1, ...recent.map((row) => toDisplay(row.kg, profile.unit)));

  async function save(): Promise<void> {
    const shown = Number(value.replace(',', '.'));
    if (Number.isNaN(shown) || shown < min || shown > max) {
      setError(`El peso va de ${min} a ${max} ${profile?.unit ?? 'kg'}.`);
      return;
    }
    const row = { date: localDateISO(), kg: fromDisplay(shown, profile?.unit ?? 'kg'), nota: note.slice(0, 80) };
    await saveWeight(row);
    setRows(await listWeights());
    setError('');
  }

  return (
    <main className="screen">
      <HistoryNav />
      <h1>Peso corporal</h1>
      <label className="field"><span>Peso ({profile.unit})</span><input inputMode="decimal" value={value} onChange={(event) => setValue(event.target.value)} /></label>
      <label className="field"><span>Nota</span><input maxLength={80} value={note} onChange={(event) => setNote(event.target.value)} /></label>
      {error ? <strong className="error">{error}</strong> : null}
      <button type="button" className="btn btn-primary" onClick={() => void save()}>Guardar pesada</button>
      <svg className="chart" viewBox="0 0 640 180" aria-hidden="true">
        {recent.map((row, index) => (
          <rect key={row.date} x={20 + index * 8} y={150 - (toDisplay(row.kg, profile.unit) / peak) * 120} width="6" height={(toDisplay(row.kg, profile.unit) / peak) * 120} fill="#FFC53D" />
        ))}
      </svg>
      <table>
        <caption>Peso corporal de los últimos 90 días</caption>
        <thead><tr><th>Día</th><th>Peso</th><th>Nota</th></tr></thead>
        <tbody>
          {recent.map((row) => (
            <tr key={row.date}><td>{row.date}</td><td>{formatWeightKg(row.kg, profile.unit)}</td><td>{row.nota}</td></tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

function HistoryNav(): ReactElement {
  return (
    <nav className="row" aria-label="Historial">
      <Link className="btn" to="/historial">Calendario</Link>
      <Link className="btn" to="/historial/volumen">Volumen</Link>
      <Link className="btn" to="/historial/records">Récords</Link>
      <Link className="btn" to="/historial/peso">Peso</Link>
    </nav>
  );
}

function shiftMonth(cursor: string, delta: number): string {
  const [year, month] = cursor.split('-').map(Number);
  const date = new Date(Date.UTC(year ?? 2026, (month ?? 1) - 1 + delta, 1));
  return date.toISOString().slice(0, 7);
}

function lastWeeks(sessions: WorkoutSession[]): { start: string; kg: number; reps: number }[] {
  const monday = mondayOf(localDateISO());
  const weeks = Array.from({ length: 12 }, (_, index) => ({ start: addDays(monday, -7 * (11 - index)), kg: 0, reps: 0 }));
  for (const session of sessions) {
    if (session.status !== 'completada') continue;
    const bucket = weeks.find((week) => session.date >= week.start && session.date < addDays(week.start, 7));
    if (!bucket) continue;
    const volume = volumeOf(session);
    bucket.kg += volume.kg;
    bucket.reps += volume.bodyReps;
  }
  return weeks;
}

function bestRecords(sessions: WorkoutSession[]): { exerciseId: string; nombre: string; bestKg: number; bestReps: number; bestSeconds: number; oneRm: number | null; needsTen: boolean; brokenAt: string }[] {
  const ordered = sessions.filter((session) => session.status === 'completada' && session.finishedAt).slice().sort((a, b) => (a.finishedAt! < b.finishedAt! ? -1 : 1));
  const map = new Map<string, { exerciseId: string; nombre: string; bestKg: number; bestReps: number; bestSeconds: number; oneRm: number | null; needsTen: boolean; brokenAt: string }>();
  for (const session of ordered) {
    for (const exercise of session.exercises) {
      let row = map.get(exercise.exerciseId);
      if (!row) {
        row = { exerciseId: exercise.exerciseId, nombre: exercise.nombre, bestKg: 0, bestReps: 0, bestSeconds: 0, oneRm: null, needsTen: false, brokenAt: session.finishedAt ?? session.date };
        map.set(exercise.exerciseId, row);
      }
      for (const set of exercise.series) {
        if (!set.completed || set.kind !== 'trabajo') continue;
        const weight = set.pesoKg ?? 0;
        const reps = set.reps ?? 0;
        let broke = false;
        if (weight > row.bestKg) {
          row.bestKg = weight;
          row.bestReps = reps;
          broke = true;
        } else if (weight === row.bestKg && reps > row.bestReps) {
          row.bestReps = reps;
          broke = true;
        }
        if ((set.segundos ?? 0) > row.bestSeconds) {
          row.bestSeconds = set.segundos ?? 0;
          broke = true;
        }
        if (weight > 0 && reps > 10) row.needsTen = row.oneRm === null;
        if (weight > 0 && reps >= 1 && reps <= 10) {
          const estimate = oneRmEstimado(weight, reps);
          if (estimate !== null && (row.oneRm === null || estimate > row.oneRm)) row.oneRm = estimate;
          row.needsTen = false;
        }
        if (broke && session.finishedAt) row.brokenAt = session.finishedAt;
      }
    }
  }
  return [...map.values()].sort((a, b) => (a.brokenAt < b.brokenAt ? 1 : -1));
}
