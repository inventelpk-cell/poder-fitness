import { useEffect, useRef, useState } from 'react'
import { heroRepsFromSession } from '../domain/session'
import { clampQuota, combinedTotals, defaultQuota } from '../domain/hero'
import type { HeroQuota } from '../domain/types'
import { usePoder } from '../state/store'
import { todayISO } from '../domain/dates'
import { asset } from '../ui/asset'

export function Hero() {
  const poder = usePoder()
  const ensure = useRef(poder.ensureTodayHero)
  ensure.current = poder.ensureTodayHero
  useEffect(() => { void ensure.current() }, [])
  const today = todayISO()
  const day = poder.heroDays.find((item) => item.date === today)
  const quota = day?.quota ?? poder.settings.heroQuotaOverride ?? defaultQuota(poder.streaks.level)
  const sessionPart = poder.sessions.filter((session) => session.date === today && session.status === 'completado').reduce((sum, session) => {
    const part = heroRepsFromSession(session)
    return { pushups: sum.pushups + part.pushups, abs: sum.abs + part.abs, squats: sum.squats + part.squats, km: 0 }
  }, { pushups: 0, abs: 0, squats: 0, km: 0 })
  const manual = day?.manual ?? { pushups: 0, abs: 0, squats: 0, km: 0 }
  const totals = combinedTotals(manual, sessionPart)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<HeroQuota>(poder.settings.heroQuotaOverride ?? quota)
  const history = [...poder.heroDays].sort((a, b) => b.date.localeCompare(a.date))

  function bump(key: keyof HeroQuota, delta: number) {
    void poder.addHero({ pushups: 0, abs: 0, squats: 0, km: 0, [key]: delta })
  }

  return (
    <section className="stack">
      <p className="pf-kicker">Día local</p>
      <h1 className="screen-title">Reto del héroe</h1>
      <p>El Cénit es 100 flexiones, 100 abdominales, 100 sentadillas y 10 km en un día</p>
      {history.length === 0 && totals.pushups + totals.abs + totals.squats + totals.km === 0 ? (
        <img className="empty-art" src={asset('art/empty/reto.svg')} alt="" />
      ) : null}
      <Counter label="Flexiones" value={totals.pushups} goal={quota.pushups} onDelta={(delta) => bump('pushups', delta)} />
      <Counter label="Abdominales" value={totals.abs} goal={quota.abs} onDelta={(delta) => bump('abs', delta)} />
      <Counter label="Sentadillas" value={totals.squats} goal={quota.squats} onDelta={(delta) => bump('squats', delta)} />
      <article className="card stack">
        <h2>Km</h2>
        <p className="tabular">{totals.km}/{quota.km}</p>
        <div className="split">
          <button className="btn ghost" type="button" onClick={() => bump('km', -0.1)}>−0,1 km</button>
          <button className="btn ghost" type="button" onClick={() => bump('km', 0.1)}>+0,1 km</button>
          <button className="btn ghost" type="button" onClick={() => bump('km', 1)}>+1 km</button>
        </div>
      </article>
      <button className="btn ghost" type="button" onClick={() => setOpen((value) => !value)}>Ajustar cuota</button>
      {open ? (
        <form className="card stack" onSubmit={(event) => {
          event.preventDefault()
          const next = clampQuota(draft)
          void poder.updateSettings({ ...poder.settings, heroQuotaOverride: next })
          setOpen(false)
        }}>
          <p className="muted">La cuota nueva vale desde mañana. Hoy se queda como está.</p>
          {(['pushups', 'abs', 'squats'] as const).map((key) => (
            <label key={key}>{key === 'pushups' ? 'Flexiones' : key === 'abs' ? 'Abdominales' : 'Sentadillas'}
              <input className="field" inputMode="numeric" step={5} min={10} max={100} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: Number(event.target.value) })} />
            </label>
          ))}
          <label>Km
            <input className="field" inputMode="decimal" step={0.5} min={0.5} max={10} value={draft.km} onChange={(event) => setDraft({ ...draft, km: Number(event.target.value) })} />
          </label>
          <button className="btn primary" type="submit">Guardar cuota</button>
        </form>
      ) : null}
      <h2>Historial</h2>
      {history.length === 0 ? <p>Anota una parte del reto y quedará en el día.</p> : (
        <ul className="stack">
          {history.map((item) => {
            const part = poder.sessions.filter((session) => session.date === item.date && session.status === 'completado').reduce((sum, session) => {
              const reps = heroRepsFromSession(session)
              return { pushups: sum.pushups + reps.pushups, abs: sum.abs + reps.abs, squats: sum.squats + reps.squats, km: 0 }
            }, { pushups: 0, abs: 0, squats: 0, km: 0 })
            const shown = combinedTotals(item.manual, part)
            return (
              <li key={item.date} className="card">
                <strong>{item.date}</strong>
                <p>Flexiones: {shown.pushups}/{item.quota.pushups}</p>
                <p>Abdominales: {shown.abs}/{item.quota.abs}</p>
                <p>Sentadillas: {shown.squats}/{item.quota.squats}</p>
                <p>Km: {shown.km}/{item.quota.km}</p>
                {item.shield ? <p>Escudo</p> : null}
                {item.bonusGranted ? <p>Cuota cerrada</p> : null}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function Counter({ label, value, goal, onDelta }: { label: string; value: number; goal: number; onDelta: (delta: number) => void }) {
  return (
    <article className="card stack">
      <h2>{label}</h2>
      <p className="tabular">{value}/{goal}</p>
      <div className="split">
        <button className="btn ghost" type="button" aria-label={`-1 ${label.toLowerCase()}`} onClick={() => onDelta(-1)}>−1</button>
        <button className="btn ghost" type="button" aria-label={`+1 ${label.toLowerCase()}`} onClick={() => onDelta(1)}>+1</button>
        <button className="btn ghost" type="button" aria-label={`+10 ${label.toLowerCase()}`} onClick={() => onDelta(10)}>+10</button>
      </div>
    </article>
  )
}
