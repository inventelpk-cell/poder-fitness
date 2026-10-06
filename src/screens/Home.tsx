import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import { todayISO, mondayOf } from '../domain/dates'
import { heroRepsFromSession } from '../domain/session'
import { combinedTotals, displayHeroStreak } from '../domain/hero'
import { PATTERN_NAME } from '../domain/labels'
import { rankForLevel } from '../domain/ranks'
import { levelFromTotal } from '../domain/xp'
import { activeArc, weekSessionCount } from '../domain/view'
import { unlockAudio } from '../audio/engine'
import { usePoder } from '../state/store'
import { asset } from '../ui/asset'
import { useStart } from '../ui/useStart'
import type { PlannedExercise } from '../domain/types'

function durationLabel(exercises: PlannedExercise[]): string {
  const totalSets = exercises.reduce((sum, exercise) => sum + exercise.warmup.length + exercise.sets, 0)
  const rest = exercises.reduce((sum, exercise, index) => {
    const sets = exercise.warmup.length + exercise.sets
    const internal = Math.max(0, sets - 1) * exercise.restSec
    const between = index < exercises.length - 1 && sets > 0 ? exercise.restSec : 0
    return sum + internal + between
  }, 0)
  const minutes = Math.max(1, Math.round((totalSets * 45 + rest) / 60))
  return `${minutes} min`
}

export function Home() {
  const poder = usePoder()
  const navigate = useNavigate()
  const { go, dialog } = useStart()
  const ensure = useRef(poder.ensureTodayHero)
  ensure.current = poder.ensureTodayHero
  useEffect(() => { void ensure.current() }, [])
  const profile = poder.profile
  if (!profile) return null
  const today = todayISO()
  const rank = rankForLevel(poder.streaks.level)
  const xp = levelFromTotal(poder.streaks.xpTotal)
  const arc = activeArc(poder.arcs)
  const planned = arc?.sessions.find((session) => session.date === today && session.status !== 'cancelado')
  const open = poder.openSession()
  const doneToday = poder.sessions.find((session) => session.status === 'completado' && session.plannedSessionId === planned?.id)
  const anyDone = poder.sessions.some((session) => session.status === 'completado')
  const monday = mondayOf(today)
  const goal = poder.streaks.gym.weekGoals[monday] ?? profile.daysPerWeek
  const doneWeek = weekSessionCount(poder.sessions, today)
  const heroDay = poder.heroDays.find((day) => day.date === today)
  const quota = heroDay?.quota ?? { pushups: 20, abs: 20, squats: 20, km: 1 }
  const sessionPart = poder.sessions.filter((session) => session.date === today && session.status === 'completado').reduce((sum, session) => {
    const part = heroRepsFromSession(session)
    return { pushups: sum.pushups + part.pushups, abs: sum.abs + part.abs, squats: sum.squats + part.squats, km: 0 }
  }, { pushups: 0, abs: 0, squats: 0, km: 0 })
  const totals = combinedTotals(heroDay?.manual ?? { pushups: 0, abs: 0, squats: 0, km: 0 }, sessionPart)
  const width = Math.min(100, Math.round((xp.xpInLevel / xp.xpToNext) * 100))

  return (
    <section className="stack">
      <div className="row">
        <img className="rank-mark" src={asset(`art/ranks/${rank.id}.svg`)} alt="" />
        <div className="grow">
          <h1 className="screen-title">Hola, {profile.name}</h1>
          <p className="muted">{rank.name}</p>
        </div>
        <Link className="btn ghost" to="/ajustes">Ajustes</Link>
      </div>
      <article className="card stack">
        <div className="row">
          <strong className="tabular">Nivel {poder.streaks.level}</strong>
          <span className="muted grow tabular">{xp.xpInLevel} / {xp.xpToNext}</span>
        </div>
        <div className="bar" aria-hidden="true"><span style={{ width: `${width}%` }} /></div>
        <p>Constancia: {poder.streaks.gym.streak} semanas</p>
        <p>{doneWeek} de {goal}</p>
        <p className="muted">Racha del reto: {displayHeroStreak(poder.streaks.hero, today)} días</p>
      </article>
      {open ? (
        <article className="card stack">
          <h2>Sesión en curso</h2>
          <button className="btn primary" type="button" onClick={() => navigate(`/entreno/${open.id}`)}>Seguir entreno</button>
        </article>
      ) : (
        <article className="card stack">
          <h2>Hoy</h2>
          {planned && planned.status === 'planificado' ? (
            <>
              <p>{PATTERN_NAME[planned.pattern]}</p>
              <p className="muted">{durationLabel(planned.exercises)}</p>
              <div className="split">
                <Link className="btn ghost" to={`/plan?sesion=${planned.id}`}>Ver sesión</Link>
                <button className="btn primary" type="button" onClick={() => { void unlockAudio(); void go({ type: 'planned', id: planned.id }, true) }}>Empezar</button>
              </div>
            </>
          ) : null}
          {planned && (planned.status === 'completado' || doneToday) ? (
            <>
              <p>Sesión cerrada</p>
              <p>Poder ganado: {doneToday?.xp ?? 0} XP</p>
              {doneToday ? <Link className="btn ghost" to={`/entreno/${doneToday.id}/resumen`}>Ver resumen</Link> : null}
            </>
          ) : null}
          {!planned || planned.status === 'omitido' || planned.status === 'cancelado' ? (
            <>
              <p>Hoy el arco descansa</p>
              <button className="btn ghost" type="button" onClick={() => { void unlockAudio(); void go({ type: 'loose' }, true) }}>Entrenar igual</button>
            </>
          ) : null}
        </article>
      )}
      <Link className="card" to="/poder/reto">
        <h2>Reto del héroe</h2>
        <div className="hero-grid">
          <span className="stat"><b className="tabular">{totals.pushups}/{quota.pushups}</b> Flexiones</span>
          <span className="stat"><b className="tabular">{totals.abs}/{quota.abs}</b> Abdominales</span>
          <span className="stat"><b className="tabular">{totals.squats}/{quota.squats}</b> Sentadillas</span>
          <span className="stat"><b className="tabular">{totals.km}/{quota.km}</b> Km</span>
        </div>
      </Link>
      {anyDone ? null : (
        <article className="card">
          <img className="empty-art" src={asset('art/onboarding/despierta.svg')} alt="" />
          <p>Tu primera sesión está en el plan de hoy</p>
        </article>
      )}
      <div className="split">
        <Link className="btn ghost" to="/historial">Historial</Link>
        <Link className="btn ghost" to="/poder">Poder</Link>
      </div>
      {dialog}
    </section>
  )
}
