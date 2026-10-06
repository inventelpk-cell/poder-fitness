import { useEffect, useState, type ReactElement } from 'react';
import { Link } from 'react-router';
import { listHero, listSessions, saveHero } from '../db/db';
import { localDateISO } from '../domain/dates';
import { formatDecimal, formatInt } from '../domain/format';
import { HERO_GOALS, clampHero, heroQuota, xpDelReto } from '../domain/hero';
import type { HeroLog } from '../domain/model';
import { useApp } from '../state/app-state';

export function HeroPage(): ReactElement {
  const { profile, heroToday, refresh } = useApp();
  const quota = heroQuota(profile?.level ?? 'principiante');
  const [flexiones, setFlexiones] = useState(heroToday?.flexiones ?? 0);
  const [abdominales, setAbdominales] = useState(heroToday?.abdominales ?? 0);
  const [sentadillas, setSentadillas] = useState(heroToday?.sentadillas ?? 0);
  const [km, setKm] = useState(heroToday?.km ?? 0);
  const [fromTraining, setFromTraining] = useState({ flexiones: 0, abdominales: 0, sentadillas: 0 });

  useEffect(() => {
    if (!heroToday) return;
    setFlexiones(heroToday.flexiones);
    setAbdominales(heroToday.abdominales);
    setSentadillas(heroToday.sentadillas);
    setKm(heroToday.km);
  }, [heroToday]);

  useEffect(() => {
    void listSessions().then((sessions) => {
      const today = localDateISO();
      let flex = 0;
      let abd = 0;
      let sen = 0;
      for (const session of sessions) {
        if (session.status !== 'completada' || session.date !== today) continue;
        for (const exercise of session.exercises) {
          const reps = exercise.series.filter((set) => set.completed && set.kind === 'trabajo').reduce((sum, set) => sum + (set.reps ?? 0), 0);
          if (exercise.exerciseId === 'flexion-pecho') flex += reps;
          if (exercise.exerciseId === 'abdominales') abd += reps;
          if (exercise.exerciseId === 'sentadilla-corporal') sen += reps;
        }
      }
      setFromTraining({ flexiones: flex, abdominales: abd, sentadillas: sen });
    });
  }, []);

  if (!profile) return <main className="screen"><p>Cargando el reto…</p></main>;

  async function save(): Promise<void> {
    const log = clampHero({ flexiones, abdominales, sentadillas, km });
    const entry: HeroLog = { date: localDateISO(), ...log, xpAwarded: xpDelReto(log) };
    await saveHero(entry);
    await refresh();
  }

  return (
    <main className="screen">
      <div className="split">
        <h1>Reto del héroe</h1>
        <Link className="btn" to="/reto/historial">Historial</Link>
      </div>
      <HeroField label="Flexiones" value={flexiones} max={999} goal={HERO_GOALS.flexiones} quota={quota.flexiones} onChange={setFlexiones} />
      <HeroField label="Abdominales" value={abdominales} max={999} goal={HERO_GOALS.abdominales} quota={quota.abdominales} onChange={setAbdominales} />
      <HeroField label="Sentadillas" value={sentadillas} max={999} goal={HERO_GOALS.sentadillas} quota={quota.sentadillas} onChange={setSentadillas} />
      <label className="field">
        <span>Kilómetros</span>
        <input inputMode="decimal" value={km} onChange={(event) => setKm(Number(event.target.value.replace(',', '.')) || 0)} />
        <div className="mini-bar" aria-hidden="true">
          <span style={{ width: `${Math.min(100, (km / HERO_GOALS.km) * 100)}%` }} />
          <i className="quota-mark" style={{ left: `${(quota.km / HERO_GOALS.km) * 100}%` }} />
        </div>
      </label>
      <p>El reto completo es una meta alta. La cuota sugerida respeta tu nivel. Parar antes no baja tu poder.</p>
      <p>Sin GPS. Tú marcas los kilómetros.</p>
      {fromTraining.flexiones > 0 ? <p>Hoy en el entreno: {formatInt(fromTraining.flexiones)} flexiones</p> : null}
      {fromTraining.abdominales > 0 ? <p>Hoy en el entreno: {formatInt(fromTraining.abdominales)} abdominales</p> : null}
      {fromTraining.sentadillas > 0 ? <p>Hoy en el entreno: {formatInt(fromTraining.sentadillas)} sentadillas</p> : null}
      <button
        type="button"
        className="btn"
        onClick={() => {
          if (flexiones === 0 && fromTraining.flexiones > 0) setFlexiones(fromTraining.flexiones);
          if (abdominales === 0 && fromTraining.abdominales > 0) setAbdominales(fromTraining.abdominales);
          if (sentadillas === 0 && fromTraining.sentadillas > 0) setSentadillas(fromTraining.sentadillas);
        }}
      >
        Usar esas cifras
      </button>
      <p>XP de hoy: {formatInt(xpDelReto(clampHero({ flexiones, abdominales, sentadillas, km })))}</p>
      <button type="button" className="btn btn-primary" onClick={() => void save()}>Guardar reto</button>
    </main>
  );
}

function HeroField({
  label,
  value,
  max,
  goal,
  quota,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  goal: number;
  quota: number;
  onChange: (value: number) => void;
}): ReactElement {
  return (
    <label className="field">
      <span>{label}</span>
      <input inputMode="numeric" value={value} onChange={(event) => onChange(Math.max(0, Math.min(max, Math.round(Number(event.target.value) || 0))))} />
      <div className="mini-bar" aria-hidden="true">
        <span style={{ width: `${Math.min(100, (value / goal) * 100)}%` }} />
        <i className="quota-mark" style={{ left: `${(quota / goal) * 100}%` }} />
      </div>
    </label>
  );
}

export function HeroHistoryPage(): ReactElement {
  const [logs, setLogs] = useState<HeroLog[]>([]);
  const [editing, setEditing] = useState<HeroLog | null>(null);
  const { refresh } = useApp();

  useEffect(() => { void listHero().then(setLogs); }, []);

  async function saveEdit(): Promise<void> {
    if (!editing) return;
    const log = clampHero(editing);
    await saveHero({ ...editing, ...log, xpAwarded: xpDelReto(log) });
    setLogs(await listHero());
    setEditing(null);
    await refresh();
  }

  return (
    <main className="screen">
      <Link to="/reto">Reto del héroe</Link>
      <h1>Historial del reto</h1>
      {logs.length === 0 ? (
        <div className="empty-card">
          <img src="/design/illustrations/empty-reto.svg" alt="" width="180" height="140" />
          <p>Cuando anotes un día, aparecerá aquí.</p>
        </div>
      ) : null}
      <ul className="plain">
        {logs.map((log) => (
          <li key={log.date} className="card">
            <strong>{log.date}</strong>
            <p>{log.flexiones} / {log.abdominales} / {log.sentadillas} / {formatDecimal(log.km, 1)} km · {formatInt(log.xpAwarded)} XP</p>
            <button type="button" className="btn" onClick={() => setEditing(log)}>Editar</button>
          </li>
        ))}
      </ul>
      {editing ? (
        <section className="card">
          <h2>Editar {editing.date}</h2>
          <label className="field"><span>Flexiones</span><input inputMode="numeric" value={editing.flexiones} onChange={(event) => setEditing({ ...editing, flexiones: Number(event.target.value) })} /></label>
          <label className="field"><span>Abdominales</span><input inputMode="numeric" value={editing.abdominales} onChange={(event) => setEditing({ ...editing, abdominales: Number(event.target.value) })} /></label>
          <label className="field"><span>Sentadillas</span><input inputMode="numeric" value={editing.sentadillas} onChange={(event) => setEditing({ ...editing, sentadillas: Number(event.target.value) })} /></label>
          <label className="field"><span>Kilómetros</span><input inputMode="decimal" value={editing.km} onChange={(event) => setEditing({ ...editing, km: Number(event.target.value) })} /></label>
          <button type="button" className="btn btn-primary" onClick={() => void saveEdit()}>Guardar día</button>
        </section>
      ) : null}
    </main>
  );
}
