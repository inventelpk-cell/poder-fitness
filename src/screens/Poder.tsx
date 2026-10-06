import { Link } from 'react-router'
import { ACHIEVEMENTS, rankForLevel, RANKS } from '../domain/ranks'
import { levelFromTotal } from '../domain/xp'
import { usePoder } from '../state/store'
import { asset } from '../ui/asset'
import { badgeGallery } from '../ui/badges'

export function Poder() {
  const poder = usePoder()
  const rank = rankForLevel(poder.streaks.level)
  const xp = levelFromTotal(poder.streaks.xpTotal)
  const owned = new Set(poder.achievements.map((item) => item.id))
  const badges = badgeGallery({ owned: [...owned], sessions: poder.sessions })
  const width = Math.min(100, Math.round((xp.xpInLevel / xp.xpToNext) * 100))
  return (
    <section className="stack">
      <p className="pf-kicker">{rank.title}</p>
      <h1 className="screen-title">{rank.name}</h1>
      <img className="rank-mark" src={asset(`art/ranks/${rank.id}.svg`)} alt="" style={{ width: 120, height: 120 }} />
      <p>{rank.line}</p>
      <p className="tabular">Nivel {poder.streaks.level} · {xp.xpInLevel} / {xp.xpToNext}</p>
      <div className="bar" aria-hidden="true"><span style={{ width: `${width}%` }} /></div>
      <button className="btn ghost" type="button" onClick={poder.replayRank}>Volver a ver el rango</button>
      <Link className="btn primary" to="/poder/reto">Reto del héroe</Link>
      <h2>Insignias</h2>
      <div className="badge-grid">
        {badges.map((badge) => (
          <figure key={badge.id}>
            <img className={badge.unlocked ? 'badge' : 'badge locked'} src={asset(`art/badges/${badge.id}.svg`)} alt="" />
            <figcaption>{badge.name}</figcaption>
          </figure>
        ))}
      </div>
      <h2>Logros</h2>
      <ul className="stack">
        {ACHIEVEMENTS.map((item) => (
          <li key={item.id} className="row">
            <span className="grow">{item.name}</span>
            <span className="muted">{owned.has(item.id) ? 'Conseguido' : `${item.xp} XP`}</span>
          </li>
        ))}
      </ul>
      <h2>Rangos</h2>
      <ul className="stack">
        {RANKS.map((item) => (
          <li key={item.id} className="row">
            <img className="rank-mark" src={asset(item.id === rank.id || poder.streaks.level >= item.min ? `art/ranks/${item.id}.svg` : `art/ranks/${item.id}.svg`)} alt="" style={{ opacity: poder.streaks.level >= item.min ? 1 : 0.35 }} />
            <span>{item.name} · {item.title}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
