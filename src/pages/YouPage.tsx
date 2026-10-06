import type { ReactElement } from 'react';
import { Link } from 'react-router';
import { RankEmblem } from '../assets';
import { HEALTH_LINE, labelEquipment, labelGoal, labelLevel, labelRank, labelWeekday } from '../domain/labels';
import { nivelDePoder, rankForXp } from '../domain/ranks';
import { useApp } from '../state/app-state';

export function YouPage(): ReactElement {
  const { profile } = useApp();
  if (!profile) return <main className="screen"><p>Cargando…</p></main>;
  const rank = rankForXp(profile.xpTotal);
  return (
    <main className="screen">
      <header className="hero-head">
        <div className={`aura-wrap pf-aura pf-aura--${rank.id}`}>
          <RankEmblem id={rank.id} size={88} />
        </div>
        <div>
          <h1>{profile.name}</h1>
          <p>
            Nivel {nivelDePoder(profile.xpTotal)} · {labelRank(rank.id)}
          </p>
        </div>
      </header>
      <section className="card">
        <p>{labelLevel(profile.level)}</p>
        <p>{labelGoal(profile.goal)}</p>
        <p>{profile.equipment.map((item) => labelEquipment(item)).join(', ')}</p>
        <p>{profile.weekdays.map((day) => labelWeekday(day)).join(', ')}</p>
        <p>{HEALTH_LINE}</p>
      </section>
      <div className="row">
        <Link className="btn" to="/poder">Poder</Link>
        <Link className="btn btn-primary" to="/ajustes">Ajustes</Link>
      </div>
    </main>
  );
}
