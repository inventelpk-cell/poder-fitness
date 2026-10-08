import { useEffect, useState, type ReactElement } from 'react';
import { Link } from 'react-router';
import { Avatar } from '../ui/Avatar';
import { listHero, listPlans, listSessions, performedFrom, saveSession } from '../db/db';
import { localDateISO, mondayOf } from '../domain/dates';
import { labelDayKind, labelRank, WEEKDAY_SHORT } from '../domain/labels';
import { nivelDePoder, rankForXp } from '../domain/ranks';
import { buildSession } from '../domain/session';
import { heroStreak, weekStreak } from '../domain/streaks';
import type { Plan, WorkoutSession } from '../domain/model';
import { useApp } from '../state/app-state';
import { useWorkoutLauncher } from '../state/launch';
import { CoachBubble } from '../ui/CoachBubble';
import { ExerciseThumb } from '../ui/ExerciseThumb';
import { HeroRings } from '../ui/Rings';

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
  const monday = mondayOf(today);
  const streak = weekStreak({
    plans: plans.map((item) => ({ weekStart: item.weekStart, planned: item.days.length })),
    completedDates: sessions.filter((session) => session.status === 'completada').map((session) => session.date),
    thisMonday: monday,
  });
  const hero = heroStreak(heroDays, today);

  const doneDates = new Set(sessions.filter((session) => session.status === 'completada').map((session) => session.date));
  const todayJs = new Date(`${today}T12:00:00`).getDay();
  const todayWeekday = todayJs === 0 ? 7 : todayJs;
  const fecha = new Date(`${today}T12:00:00`).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
  const fechaLinea = fecha.charAt(0).toUpperCase() + fecha.slice(1);

  return (
    <main className="screen dashboard">
      {dialog}
      <header className="power-board today-head">
        <div className="today-copy">
          <p className="kicker">{fechaLinea}</p>
          <h1>Hoy</h1>
          <p className="today-rank">{labelRank(rank.id)} · Nivel {level}</p>
        </div>
        <Avatar gender={profile.avatar} rank={rank.id} />
      </header>
      <CoachBubble event={hero.lost || streak.restart || arc.repeatNotice ? 'racha' : 'empezar'} />
      {arc.repeatNotice || streak.restart ? <p className="banner">Esta semana se empieza de nuevo.</p> : null}
      {arc.repeatNotice ? <p className="muted">Repites esta semana del arco para asentar el poder.</p> : null}
      <section className="card week-card">
        <div className="split">
          <h2>Esta semana</h2>
          <p className="muted">
            {streak.done} de {streak.planned || plan.days.length} entrenos
            {streak.weeks > 0 ? ` · ${streak.weeks} ${streak.weeks === 1 ? 'semana' : 'semanas'} en racha` : ''}
          </p>
        </div>
        <ol className="week-strip">
          {WEEKDAY_SHORT.map((label, index) => {
            const weekday = index + 1;
            const planned = plan.days.find((item) => item.weekday === weekday);
            const done = planned ? doneDates.has(planned.date) : false;
            const isToday = weekday === todayWeekday;
            const tone = done ? 'is-done' : isToday ? 'is-today' : planned ? 'is-planned' : '';
            return (
              <li key={label} className={tone}>
                <span>{label}</span>
                <i aria-hidden="true" />
              </li>
            );
          })}
        </ol>
      </section>
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
        <section className="card today-session">
          <p className="kicker">{labelDayKind(day.kind)}</p>
          <h2>Hoy toca entrenar</h2>
          <ul className="session-list">
            {day.items.map((item) => {
              const exercise = exercises.find((entry) => entry.id === item.exerciseId);
              const nombre = exercise?.nombre ?? item.exerciseId;
              const dose = item.medida === 'segundos' ? `${item.series} × ${item.repObjetivo} s` : `${item.series} × ${item.repObjetivo}`;
              const thumb = exercise ? <ExerciseThumb exercise={exercise} nombre={nombre} /> : null;
              return (
                <li key={`${item.slot}-${item.exerciseId}`} className={thumb ? 'has-media' : undefined}>
                  {thumb}
                  <Link className="session-name" to={`/biblioteca/${item.exerciseId}`}>
                    {nombre}
                  </Link>
                  <span className="session-dose">{dose}</span>
                </li>
              );
            })}
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
        <section className="card today-rest">
          <img src="/design/illustrations/empty-rutinas.svg" alt="" width="220" height="140" />
          <h2>Hoy el plan descansa. El reto sigue disponible.</h2>
        </section>
      )}
      <section className="card hero-card">
        <div className="split">
          <h2>Reto del héroe</h2>
          <Link to="/reto">Abrir</Link>
        </div>
        <HeroRings
          flexiones={heroToday?.flexiones ?? 0}
          abdominales={heroToday?.abdominales ?? 0}
          sentadillas={heroToday?.sentadillas ?? 0}
          km={heroToday?.km ?? 0}
        />
      </section>
    </main>
  );
}
