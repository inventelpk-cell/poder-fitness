import { Link, useSearchParams } from 'react-router'
import { addDays, mondayOf, todayISO, weekdayMon0 } from '../domain/dates'
import { PATTERN_NAME, WEEKDAY_LABELS, weekLine } from '../domain/labels'
import { activeArc } from '../domain/view'
import { currentWeekIndex } from '../domain/plan'
import { unlockAudio } from '../audio/engine'
import { usePoder } from '../state/store'
import { asset } from '../ui/asset'
import { equipmentLabel } from '../ui/catalog'
import { useStart } from '../ui/useStart'
import type { PlannedSession } from '../domain/types'

function sessionOn(sessions: PlannedSession[], date: string): PlannedSession | undefined {
  return sessions.find((session) => session.date === date && session.status !== 'cancelado')
}

export function Plan() {
  const poder = usePoder()
  const { go, dialog } = useStart()
  const [params] = useSearchParams()
  const arc = activeArc(poder.arcs)
  const today = todayISO()
  const focusId = params.get('sesion')
  const focus = arc?.sessions.find((session) => session.id === focusId)
  if (!arc || !poder.profile) return null
  const week = currentWeekIndex(arc.startsOn, today) as 1 | 2 | 3 | 4
  const monday = mondayOf(today)
  const days = Array.from({ length: 7 }, (_, index) => addDays(monday, index))

  return (
    <section className="stack">
      <p className="pf-kicker">Semana {Math.min(4, week)} de 4</p>
      <h1 className="screen-title">{arc.name}</h1>
      <p>{weekLine(Math.min(4, week))}</p>
      {focus && focus.status === 'planificado' ? (
        <article className="card stack" aria-label="Sesión del día">
          <h2>{PATTERN_NAME[focus.pattern]}</h2>
          <p className="muted">{focus.date}</p>
          <ul className="stack">
            {focus.exercises.map((exercise) => (
              <li key={`${exercise.exerciseId}-${exercise.role}`}>
                <strong>{exercise.nombre}</strong>
                <p className="muted">{exercise.sets} series · {exercise.minReps}–{exercise.maxReps} · {exercise.restSec} s · {exercise.equipo.map((item) => equipmentLabel(item === 'cuerpo' ? 'peso-corporal' : item)).join(', ')}</p>
              </li>
            ))}
          </ul>
          <button className="btn primary" type="button" onClick={() => { void unlockAudio(); void go({ type: 'planned', id: focus.id }, true) }}>Empezar</button>
        </article>
      ) : null}
      <div className="week">
        {days.map((date) => {
          const planned = sessionOn(arc.sessions, date)
          const label = WEEKDAY_LABELS[weekdayMon0(date)]
          return (
            <article key={date} className={date === today ? 'card today' : 'card'} style={{ padding: '0.45rem' }}>
              <p>{label}</p>
              <p>{planned && planned.status !== 'omitido' ? PATTERN_NAME[planned.pattern] : 'Descanso'}</p>
              {date === today && planned?.status === 'planificado' ? (
                <button className="btn primary" type="button" onClick={() => { void unlockAudio(); void go({ type: 'planned', id: planned.id }, true) }}>Empezar</button>
              ) : null}
              {date > today && date <= addDays(monday, 6) && planned?.status === 'planificado' ? (
                <button className="btn ghost" type="button" onClick={() => { void poder.swapDates(today, date) }}>Adelantar a hoy</button>
              ) : null}
            </article>
          )
        })}
      </div>
      <div className="row">
        <h2 className="grow">Rutinas</h2>
        <Link className="btn primary" to="/plan/rutina/nueva">Nueva rutina</Link>
      </div>
      {poder.routines.length === 0 ? (
        <article className="card">
          <img className="empty-art" src={asset('art/empty/rutinas.svg')} alt="" />
          <p>Guarda una rutina para repetirla cuando quieras, fuera del arco.</p>
        </article>
      ) : (
        <ul className="stack">
          {poder.routines.map((routine) => (
            <li key={routine.id} className="card row">
              <Link className="grow" to={`/plan/rutina/${routine.id}`}>{routine.name}</Link>
              <button className="btn primary" type="button" onClick={() => { void unlockAudio(); void go({ type: 'routine', id: routine.id }, true) }}>Hacer hoy</button>
            </li>
          ))}
        </ul>
      )}
      <button
        className="btn ghost"
        type="button"
        onClick={() => {
          if (window.confirm('Se cierra el arco activo y empieza el siguiente con tu perfil actual.')) void poder.beginNewArc()
        }}
      >
        Nuevo arco con mi perfil actual
      </button>
      {dialog}
    </section>
  )
}
