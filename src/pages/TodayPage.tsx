import { useEffect, useState, type ReactElement } from 'react';
import { Link } from 'react-router';
import { RankEmblem } from '../assets';
import { listHero, listPlans, listSessions, performedFrom, saveSession } from '../db/db';
import { arcTitle } from '../domain/arc';
import { localDateISO, mondayOf } from '../domain/dates';
import { formatInt } from '../domain/format';
import { HERO_GOALS } from '../domain/hero';
import { labelDayKind, labelRank } from '../domain/labels';
import { nivelDePoder, nextLevelXp, rankForXp, xpParaAlcanzarNivel } from '../domain/ranks';
import { buildSession } from '../domain/session';
import { heroStreak, weekStreak } from '../domain/streaks';
import type { Plan, WorkoutSession } from '../domain/model';
import { useApp } from '../state/app-state';
import { useWorkoutLauncher } from '../state/launch';

export function TodayPage(): ReactElement {
  const { profile, plan, arc, live, heroToday, exercises } = useApp();
  const { launch, dialog } = useWorkoutLauncher();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [plans, setPlans] = useState<Plan[]>(plan ? [plan] : []);
  const [heroDays, setHeroDays] = useState<{ date: string; log: { flexiones: number; abdominales: number; sentadillas: number; km: number } }[]>([]);

  useEffect(() => {
    void listSessions().then(setSessions);
    void listHero().then((logs) => setHeroDays(logs.map((log) => ({ date: log.date, log }))));
    void listPlans().then(setPlans);
  }, [plan?.id, live?.id]);

  if (!profile || !plan || !arc) return <main className="screen"><p>Preparando la semana…</p></main>;

  const today = localDateISO();
  const day = plan.days.find((item) => item.date === today);
  const rank = rankForXp(profile.xpTotal);
  const level = nivelDePoder(profile.xpTotal);
  const floor = xpParaAlcanzarNivel(level);
  const next = nextLevelXp(level);
  const span = next === null ? 1 : Math.max(1, next - floor);
  const monday = mondayOf(today);
  const streak = weekStreak({
    plans: plans.map((item) => ({ weekStart: item.weekStart, planned: item.days.length })),
    completedDates: sessions.filter((session) => session.status === 'completada').map((session) => session.date),
    thisMonday: monday,
  });
  const hero = heroStreak(heroDays, today);

  return (
    <main className="screen">
      {dialog}
      <header className="hero-head">
        <div className={`aura-wrap pf-aura pf-aura--${rank.id}`}>
          <RankEmblem id={rank.id} />
        </div>
        <div>
          <p className="kicker">{profile.name}</p>
          <h1>
            Nivel {level} · {labelRank(rank.id)}
          </h1>
          <p className="muted">
            {formatInt(profile.xpTotal)} XP{level === 100 ? ', nivel 100' : ''}
          </p>
          <div className="bar" aria-hidden="true">
            <span style={{ width: `${next === null ? 100 : Math.min(100, ((profile.xpTotal - floor) / span) * 100)}%` }} />
          </div>
          <p className="muted">
            {arcTitle(arc.number)} · semana {arc.weekInArc}
          </p>
        </div>
      </header>
      {arc.repeatNotice || streak.restart ? <p className="banner">Esta semana se empieza de nuevo.</p> : null}
      {arc.repeatNotice ? <p className="muted">Repites esta semana del arco para asentar el poder.</p> : null}
      <p>
        {streak.done} de {streak.planned || plan.days.length} entrenos esta semana
        {streak.weeks > 0 ? ` · ${streak.weeks} ${streak.weeks === 1 ? 'semana' : 'semanas'} en racha` : ''}
      </p>
      {hero.lost ? <p>La racha del reto vuelve a cero. Tu poder se queda.</p> : null}
      {live ? (
        <section className="card accent">
          <h2>Entreno a medias</h2>
          <p>{live.nombre}</p>
          <Link className="btn btn-primary" to={`/entreno/${live.id}`}>
            Seguir entreno
          </Link>
        </section>
      ) : null}
      {day ? (
        <section className="card">
          <p className="kicker">{labelDayKind(day.kind)}</p>
          <h2>Hoy toca entrenar</h2>
          <ul className="plain">
            {day.items.map((item) => (
              <li key={`${item.slot}-${item.exerciseId}`}>{exercises.find((entry) => entry.id === item.exerciseId)?.nombre ?? item.exerciseId}</li>
            ))}
          </ul>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              void launch(async () => {
                const history = await listSessions();
                const session = buildSession({
                  profile,
                  exercises,
                  nombre: labelDayKind(day.kind),
                  planDay: day,
                  weekInArc: arc.weekInArc,
                  performed: performedFrom(history),
                });
                await saveSession(session);
                return session.id;
              })
            }
          >
            Empezar entreno
          </button>
        </section>
      ) : (
        <section className="card">
          <h2>Hoy el plan descansa. El reto sigue disponible.</h2>
        </section>
      )}
      <section className="card">
        <div className="split">
          <h2>Reto del héroe</h2>
          <Link to="/reto">Abrir</Link>
        </div>
        <ul className="mini-bars">
          {(
            [
              ['Flexiones', heroToday?.flexiones ?? 0, HERO_GOALS.flexiones],
              ['Abdominales', heroToday?.abdominales ?? 0, HERO_GOALS.abdominales],
              ['Sentadillas', heroToday?.sentadillas ?? 0, HERO_GOALS.sentadillas],
              ['Km', heroToday?.km ?? 0, HERO_GOALS.km],
            ] as const
          ).map(([label, value, goal]) => (
            <li key={label}>
              <span>{label}</span>
              <span className="bar" aria-hidden="true">
                <span style={{ width: `${Math.min(100, (value / goal) * 100)}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
