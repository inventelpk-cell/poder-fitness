import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router'
import { playRecord } from '../audio/engine'
import { usePoder } from '../state/store'

export function Summary() {
  const params = useParams()
  const poder = usePoder()
  const session = poder.sessions.find((item) => item.id === params.sessionId)
  const played = useRef(false)
  useEffect(() => {
    if (!session || played.current || session.records.length === 0) return
    played.current = true
    playRecord(poder.settings.restVolume)
  }, [session, poder.settings.restVolume])
  if (!session) return <p>El resumen no está.</p>
  const breakdown = session.xpBreakdown
  return (
    <section className="stack">
      <p className="pf-kicker">Sesión cerrada</p>
      <h1 className="screen-title">Poder de hoy</h1>
      <p className="tabular" style={{ fontSize: '2rem' }}>+{session.xp} XP</p>
      {breakdown ? (
        <ul>
          <li>Series: {breakdown.series}</li>
          <li>Volumen: {breakdown.volumen}</li>
          <li>Récords: {breakdown.records}</li>
          <li>Sesión completa: {breakdown.sesion}</li>
        </ul>
      ) : null}
      {session.records.map((record) => (
        <p key={`${record.exerciseId}-${record.type}`} style={{ color: 'var(--amarillo)' }}>
          Récord · {record.nombre} · {record.type === 'carga' ? 'carga' : 'repeticiones'}
        </p>
      ))}
      {session.progressNotes.map((note) => <p key={note.exerciseId}>{note.text}</p>)}
      <Link className="btn ghost" to="/historial">Historial</Link>
      <Link className="btn primary" to="/">A inicio</Link>
    </section>
  )
}
