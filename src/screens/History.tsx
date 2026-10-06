import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { addDays, formatISODate, mondayOf, parseISODate, todayISO } from '../domain/dates'
import { heroRepsFromSession } from '../domain/session'
import { combinedTotals } from '../domain/hero'
import { MUSCLE_GROUP_LABEL } from '../domain/labels'
import { formatWeight } from '../domain/units'
import type { MuscleGroup } from '../domain/types'
import { usePoder } from '../state/store'
import { asset } from '../ui/asset'

const GROUPS: MuscleGroup[] = ['pecho', 'espalda', 'hombros', 'brazos', 'piernas', 'gluteos', 'core', 'pantorrillas']
const COLORS = ['#ff6a1a', '#3b82ff', '#ffc43a', '#3ddc97', '#c4beb4', '#ff5a6a', '#8e97ab', '#e39b12']
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export function History() {
  const poder = usePoder()
  const today = todayISO()
  const initial = parseISODate(today)
  const [cursor, setCursor] = useState({ year: initial.getFullYear(), month: initial.getMonth() })
  const [selected, setSelected] = useState(today)
  const [exerciseId, setExerciseId] = useState(poder.memory.find((item) => item.bestE1rmKg)?.exerciseId ?? '')
  const [kg, setKg] = useState('')
  const completed = poder.sessions.filter((session) => session.status === 'completado')
  const cells = useMemo(() => monthCells(cursor.year, cursor.month), [cursor])
  const monthHas = cells.some((date) => date && (completed.some((session) => session.date === date) || poder.heroDays.some((day) => day.date === date && (day.manual.pushups + day.manual.abs + day.manual.squats + day.manual.km > 0))))
  const daySessions = completed.filter((session) => session.date === selected)
  const hero = poder.heroDays.find((day) => day.date === selected)
  const sessionPart = daySessions.reduce((sum, session) => {
    const part = heroRepsFromSession(session)
    return { pushups: sum.pushups + part.pushups, abs: sum.abs + part.abs, squats: sum.squats + part.squats, km: 0 }
  }, { pushups: 0, abs: 0, squats: 0, km: 0 })
  const totals = combinedTotals(hero?.manual ?? { pushups: 0, abs: 0, squats: 0, km: 0 }, sessionPart)
  const volume = weeklyRows(completed, today)
  const volumeEmpty = volume.every((row) => GROUPS.every((group) => row[group] === 0))
  const e1rmRows = completed
    .filter((session) => session.exerciseE1rm.some((item) => item.exerciseId === exerciseId))
    .slice(-16)
    .map((session) => ({
      fecha: session.date.slice(5),
      kg: session.exerciseE1rm.find((item) => item.exerciseId === exerciseId)?.e1rmKg ?? 0,
    }))
  const weights = [...poder.bodyWeight].sort((a, b) => a.at.localeCompare(b.at))
  const weightRows = last90(weights, today)

  return (
    <section className="stack">
      <h1 className="screen-title">Historial</h1>
      <div className="row">
        <button className="btn ghost" type="button" onClick={() => setCursor((value) => shiftMonth(value, -1))}>Mes anterior</button>
        <strong className="grow">{MONTHS[cursor.month]} {cursor.year}</strong>
        <button className="btn ghost" type="button" onClick={() => setCursor((value) => shiftMonth(value, 1))}>Mes siguiente</button>
      </div>
      <div className="calendar" aria-label="Calendario">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((label) => <span key={label} className="muted">{label}</span>)}
        {cells.map((date, index) => {
          if (!date) return <span key={`e-${index}`} />
          const hasSession = completed.some((session) => session.date === date)
          const hasHero = poder.heroDays.some((day) => day.date === date && day.manual.pushups + day.manual.abs + day.manual.squats + day.manual.km > 0)
          const day = Number(date.slice(8))
          return (
            <button
              key={date}
              type="button"
              className={`day-cell${date === today ? ' today' : ''}${date === selected ? ' selected' : ''}`}
              aria-label={`${day} de ${MONTHS[cursor.month]}${date === today ? ', hoy' : ''}`}
              onClick={() => setSelected(date)}
            >
              {day} {hasSession ? <i className="dot orange" /> : hasHero ? <i className="dot blue" /> : null}
            </button>
          )
        })}
      </div>
      {!monthHas ? <p>Este mes todavía no tiene marcas</p> : null}
      <article className="card stack">
        <h2>{longDate(selected)}</h2>
        {daySessions.length === 0 ? <p className="muted">Sin sesión cerrada</p> : daySessions.map((session) => (
          <Link key={session.id} to={`/historial/${session.id}`}>{session.xp} XP · {session.exercises.length} ejercicios</Link>
        ))}
        <p>Flexiones: {totals.pushups}</p>
        <p>Abdominales: {totals.abs}</p>
        <p>Sentadillas: {totals.squats}</p>
        <p>Km: {totals.km}</p>
        {hero?.shield ? <p>Escudo</p> : null}
      </article>
      <article className="card stack">
        <h2>Volumen semanal</h2>
        {volumeEmpty ? <p>Cierra una sesión con carga para ver el volumen.</p> : (
          <>
            <div className="table-scroll" role="img" aria-label="Volumen de las últimas 12 semanas" style={{ height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={volume}>
                  <XAxis dataKey="semana" />
                  <YAxis />
                  <Tooltip />
                  {GROUPS.map((group, index) => <Bar key={group} dataKey={group} stackId="v" fill={COLORS[index]} name={MUSCLE_GROUP_LABEL[group]} />)}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="table-scroll">
            <table className="data">
              <caption>Volumen semanal en kg por grupo</caption>
              <thead><tr><th>Semana</th>{GROUPS.map((group) => <th key={group}>{MUSCLE_GROUP_LABEL[group]}</th>)}</tr></thead>
              <tbody>
                {volume.map((row) => (
                  <tr key={String(row.semana)}><td>{row.semana}</td>{GROUPS.map((group) => <td key={group}>{row[group]}</td>)}</tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </article>
      <article className="card stack">
        <h2>1RM estimado</h2>
        <label htmlFor="e1rm">Ejercicio</label>
        <select id="e1rm" className="select" value={exerciseId} onChange={(event) => setExerciseId(event.target.value)}>
          <option value="">Elige</option>
          {poder.memory.filter((item) => item.bestE1rmKg).map((item) => <option key={item.exerciseId} value={item.exerciseId}>{exerciseName(item.exerciseId, poder.exercises, poder.sessions)}</option>)}
        </select>
        {e1rmRows.length === 0 ? <p>Los récords aparecen al repetir un ejercicio</p> : (
          <>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={e1rmRows}><XAxis dataKey="fecha" /><YAxis /><Tooltip /><Line dataKey="kg" stroke="#ffc43a" /></LineChart>
              </ResponsiveContainer>
            </div>
            <table className="data">
              <caption>1RM estimado</caption>
              <thead><tr><th>Fecha</th><th>kg</th></tr></thead>
              <tbody>{e1rmRows.map((row) => <tr key={row.fecha}><td>{row.fecha}</td><td>{row.kg}</td></tr>)}</tbody>
            </table>
          </>
        )}
      </article>
      <article className="card stack">
        <h2>Peso corporal</h2>
        <form className="split" onSubmit={(event) => {
          event.preventDefault()
          const value = Number(kg.replace(',', '.'))
          if (value < 30 || value > 300) return
          void poder.addWeight(value)
          setKg('')
        }}>
          <label className="grow" htmlFor="peso">Anotar peso
            <input id="peso" className="field" inputMode="decimal" value={kg} onChange={(event) => setKg(event.target.value)} />
          </label>
          <button className="btn primary" type="submit">Anotar peso</button>
        </form>
        {weights.length === 0 ? <p>Anota un peso entre 30 y 300 kg.</p> : (
          <>
            {weightRows.length > 0 ? (
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <LineChart data={weightRows}><XAxis dataKey="fecha" /><YAxis domain={[30, 300]} /><Tooltip /><Line dataKey="kg" stroke="#3b82ff" /></LineChart>
                </ResponsiveContainer>
              </div>
            ) : null}
            <table className="data">
              <caption>Peso corporal</caption>
              <thead><tr><th>Fecha</th><th>Peso</th></tr></thead>
              <tbody>
                {weights.map((entry) => (
                  <tr key={entry.id}><td>{longDate(entry.date)}</td><td>{formatWeight(entry.kg, poder.settings.unit)}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </article>
      <article className="card stack">
        <h2>Récords</h2>
        {poder.memory.every((item) => item.bestE1rmKg == null && item.bestReps.length === 0) ? (
          <>
            <img className="empty-art" src={asset('art/empty/historial.svg')} alt="" />
            <p>Los récords aparecen al repetir un ejercicio</p>
          </>
        ) : poder.memory.map((item) => (
          <p key={item.exerciseId}>{exerciseName(item.exerciseId, poder.exercises, poder.sessions)}{item.bestE1rmKg ? ` · ${formatWeight(item.bestE1rmKg, 'kg')} estimados` : ''}</p>
        ))}
      </article>
    </section>
  )
}

function longDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return `${day} de ${MONTHS[(month ?? 1) - 1]} de ${year}`
}

function exerciseName(
  id: string,
  exercises: { id: string; nombre: string }[],
  sessions: { exerciseE1rm: { exerciseId: string; nombre: string }[]; records: { exerciseId: string; nombre: string }[] }[],
): string {
  const known = exercises.find((exercise) => exercise.id === id)
  if (known) return known.nombre
  for (const session of sessions) {
    const estimated = session.exerciseE1rm.find((item) => item.exerciseId === id)
    if (estimated) return estimated.nombre
    const record = session.records.find((item) => item.exerciseId === id)
    if (record) return record.nombre
  }
  return 'Ejercicio'
}

function monthCells(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1)
  const pad = (first.getDay() + 6) % 7
  const count = new Date(year, month + 1, 0).getDate()
  const cells: (string | null)[] = Array.from({ length: pad }, () => null)
  for (let day = 1; day <= count; day += 1) cells.push(formatISODate(new Date(year, month, day)))
  return cells
}

function shiftMonth(value: { year: number; month: number }, delta: number): { year: number; month: number } {
  const date = new Date(value.year, value.month + delta, 1)
  return { year: date.getFullYear(), month: date.getMonth() }
}

function weeklyRows(sessions: { status: string; date: string; volumeByGroup: { group: MuscleGroup; kg: number }[] }[], today: string) {
  const start = addDays(mondayOf(today), -77)
  return Array.from({ length: 12 }, (_, index) => {
    const monday = addDays(start, index * 7)
    const sunday = addDays(monday, 6)
    const row: Record<string, string | number> = { semana: monday.slice(5) }
    for (const group of GROUPS) row[group] = 0
    for (const session of sessions) {
      if (session.date < monday || session.date > sunday) continue
      for (const slice of session.volumeByGroup) row[slice.group] = Number(row[slice.group]) + Math.round(slice.kg)
    }
    return row
  })
}

function last90(entries: { date: string; kg: number }[], today: string) {
  const from = addDays(today, -90)
  const byDay = new Map<string, number>()
  for (const entry of entries) {
    if (entry.date < from) continue
    byDay.set(entry.date, entry.kg)
  }
  return [...byDay.entries()].map(([fecha, value]) => ({ fecha: fecha.slice(5), kg: value }))
}
