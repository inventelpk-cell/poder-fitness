import type { ReactElement } from 'react';
import { AchievementArt } from '../assets';
import { Avatar } from '../ui/Avatar';
import { ACHIEVEMENTS } from '../domain/achievements';
import { formatInt } from '../domain/format';
import { labelRank } from '../domain/labels';
import { nivelDePoder, rankForXp, xpParaAlcanzarNivel, nextLevelXp } from '../domain/ranks';
import { useApp } from '../state/app-state';

export function PowerPage(): ReactElement {
  const { profile, achievements } = useApp();
  if (!profile) return <main className="screen"><p>Cargando tu poder…</p></main>;
  const rank = rankForXp(profile.xpTotal);
  const level = nivelDePoder(profile.xpTotal);
  const floor = xpParaAlcanzarNivel(level);
  const next = nextLevelXp(level);
  const span = next === null ? 1 : Math.max(1, next - floor);
  const owned = new Set(achievements.map((item) => item.id));
  const won = ACHIEVEMENTS.filter((item) => owned.has(item.id));
  const missing = ACHIEVEMENTS.filter((item) => !owned.has(item.id));

  return (
    <main className="screen power-screen">
      <p className="kicker">Nivel de poder</p>
      <Avatar gender={profile.avatar} rank={rank.id} className="power-avatar" />
      <h1>Nivel {level}</h1>
      <p className="rank-name">{labelRank(rank.id)}</p>
      <section className="card power-card">
        <p className="num">{formatInt(profile.xpTotal)} XP{level === 100 ? ', nivel 100' : ''}</p>
        <div className="bar" aria-hidden="true"><span style={{ width: `${next === null ? 100 : Math.min(100, ((profile.xpTotal - floor) / span) * 100)}%` }} /></div>
      </section>
      <h2>Medallas</h2>
      <div className="medal-grid">
        {won.map((item) => (
          <article key={item.id} className="card medal-card">
            <AchievementArt id={item.id} earned />
            <strong>{item.nombre}</strong>
            <p>{item.condicion}</p>
          </article>
        ))}
      </div>
      <h2>Por conseguir</h2>
      <div className="medal-grid">
        {missing.map((item) => (
          <article key={item.id} className="card medal-card is-locked">
            <AchievementArt id={item.id} earned={false} />
            <strong>{item.nombre}</strong>
            <p>{item.condicion}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
