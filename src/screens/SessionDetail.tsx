import { Link, useParams } from 'react-router'
import { longDate } from '../domain/dates'
import { PATTERN_NAME } from '../domain/labels'
import { formatWeight } from '../domain/units'
import { usePoder } from '../state/store'
import { useStart } from '../ui/useStart'

export function SessionDetail() {
  const params = useParams()
  const poder = usePoder()
  const { go, dialog } = useStart()
  const session = poder.sessions.find((item) => item.id === params.sessionId)
  if (!session) return <p>Esa sesión no está en el historial.</p>
  return (
    <article className="stack">
      <h1 className="screen-title">{session.pattern ? PATTERN_NAME[session.pattern] : 'Sesión'}</h1>
      <p>{longDate(session.date)} · {session.xp} XP</p>
      {session.records.map((record) => <p key={`${record.exerciseId}-${record.type}`}>Récord · {record.nombre}</p>)}
      {session.exercises.map((exercise) => (
        <section key={exercise.id} className="card">
          <h2>{exercise.nombre}</h2>
          <ul>
            {exercise.sets.filter((set) => set.done).map((set) => (
              <li key={set.id}>
                {set.kind === 'calentamiento' ? 'Calentamiento' : 'Trabajo'} · {set.weightKg != null ? formatWeight(set.weightKg, poder.settings.unit) : 'sin carga'} · {set.reps ?? set.seconds ?? set.km ?? 0}
              </li>
            ))}
          </ul>
        </section>
      ))}
      <button className="btn primary" type="button" onClick={() => { void go({ type: 'repeat', session }, true) }}>Repetir esta sesión</button>
      <Link className="btn ghost" to="/historial">Volver</Link>
      {dialog}
    </article>
  )
}
