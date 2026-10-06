import { useEffect, useState, type ReactElement } from 'react';
import { AchievementArt } from '../assets';
import { Avatar } from '../ui/Avatar';
import { ACHIEVEMENTS } from '../domain/achievements';
import { listPlans, listSessions } from '../db/db';
import { addDays, localDateISO, mondayOf } from '../domain/dates';
import { formatInt } from '../domain/format';
import { labelRank } from '../domain/labels';
import type { Plan, WorkoutSession } from '../domain/model';
import { nivelDePoder, RANKS, rankForXp, xpParaAlcanzarNivel, nextLevelXp } from '../domain/ranks';
import { volumeOf } from '../domain/session';
import { weekStreak } from '../domain/streaks';
import { useApp } from '../state/app-state';

export function PowerPage(): ReactElement {
  const { profile, achievements } = useApp();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    void listSessions().then(setSessions);
    void listPlans().then(setPlans);
  }, [profile?.xpTotal]);

  if (!profile) return <main className="screen"><p>Cargando tu poder…</p></main>;
  const rank = rankForXp(profile.xpTotal);
  const level = nivelDePoder(profile.xpTotal);
  const floor = xpParaAlcanzarNivel(level);
  const next = nextLevelXp(level);
  const span = next === null ? 1 : Math.max(1, next - floor);
  const progress = next === null ? 100 : Math.min(100, ((profile.xpTotal - floor) / span) * 100);
  const owned = new Set(achievements.map((item) => item.id));
  const today = localDateISO();
  const monday = mondayOf(today);
  const completed = sessions.filter((session) => session.status === 'completada');
  const streak = weekStreak({
    plans: plans.map((item) => ({ weekStart: item.weekStart, planned: item.days.length })),
    completedDates: completed.map((session) => session.date),
    thisMonday: monday,
  });
  const weeks = lastWeeks(completed, monday);
  const maxScore = Math.max(1, ...weeks.map((week) => week.score));
  const volume = completed.reduce((sum, session) => sum + volumeOf(session).kg, 0);

  return (
    <main className="screen power-screen">
      <p className="kicker">Tu poder</p>
      <h1>Nivel {level}</h1>
      <p className="rank-name">{formatInt(profile.xpTotal)} XP · {labelRank(rank.id)}</p>
      <Avatar gender={profile.avatar} rank={rank.id} className={`power-avatar pf-aura pf-aura--${rank.id}`} />
      <ol className="rank-strip">
        {RANKS.map((band) => (
          <li key={band.id} className={band.id === rank.id ? 'is-on' : ''}>
            <Avatar gender={profile.avatar} rank={band.id} />
            <span>{labelRank(band.id)}</span>
          </li>
        ))}
      </ol>
      <section className="card power-card">
        <p className="num">{formatInt(profile.xpTotal)} XP{level === 100 ? ', nivel 100' : ''}</p>
        <div className="bar" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
      </section>
      <div className="stat-row">
        <article className="card stat-card">
          <strong>{formatInt(completed.length)}</strong>
          <span>Entrenos</span>
        </article>
        <article className="card stat-card">
          <strong>{formatInt(streak.weeks)}</strong>
          <span>Racha</span>
        </article>
        <article className="card stat-card">
          <strong>{formatInt(Math.round(volume))}</strong>
          <span>Volumen</span>
        </article>
      </div>
      <section className="card week-chart-card">
        <h2>12 semanas</h2>
        <div className="week-chart" role="img" aria-label="Volumen de 12 semanas">
          {weeks.map((week) => (
            <i key={week.start} style={{ height: `${Math.max(8, Math.round((week.score / maxScore) * 100))}%` }} />
          ))}
        </div>
      </section>
      <h2>Medallas</h2>
      <div className="medal-rail">
        {ACHIEVEMENTS.map((item) => {
          const earned = owned.has(item.id);
          return (
            <article key={item.id} className={earned ? 'medal-pip' : 'medal-pip is-locked'} title={item.condicion}>
              <AchievementArt id={item.id} earned={earned} />
              <strong>{item.nombre}</strong>
            </article>
          );
        })}
      </div>
    </main>
  );
}

function lastWeeks(sessions: WorkoutSession[], monday: string): { start: string; score: number }[] {
  const weeks = Array.from({ length: 12 }, (_, index) => ({ start: addDays(monday, -7 * (11 - index)), score: 0 }));
  for (const session of sessions) {
    const bucket = weeks.find((week) => session.date >= week.start && session.date < addDays(week.start, 7));
    if (!bucket) continue;
    const volume = volumeOf(session);
    bucket.score += volume.kg + volume.bodyReps;
  }
  return weeks;
}
