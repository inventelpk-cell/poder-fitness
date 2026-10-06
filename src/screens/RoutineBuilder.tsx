import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { catalogEquipToProfile } from '../domain/labels'
import type { LibraryExercise, Routine, RoutineExercise } from '../domain/types'
import { usePoder } from '../state/store'
import { profileEquip } from '../ui/blocks'

function blankExercise(exercise: LibraryExercise): RoutineExercise {
  return {
    id: crypto.randomUUID(),
    exerciseId: exercise.id,
    nombre: exercise.nombre,
    logging: exercise.logging,
    compound: exercise.compound,
    equipo: profileEquip(exercise),
    catalogEquip: exercise.equipo || catalogEquipToProfile(exercise.equipo)[0],
    muscleGroup: exercise.muscleGroup,
    musculosPrimarios: exercise.musculosPrimarios,
    sets: 3,
    minReps: exercise.logging === 'tiempo' ? 20 : 8,
    maxReps: exercise.logging === 'tiempo' ? 45 : 12,
    restSec: 90,
    note: '',
    groupId: null,
  }
}

export function RoutineBuilder() {
  const poder = usePoder()
  const navigate = useNavigate()
  const params = useParams()
  const existing = poder.routines.find((routine) => routine.id === params.id)
  const [name, setName] = useState(existing?.name ?? '')
  const [exercises, setExercises] = useState<RoutineExercise[]>(existing?.exercises ?? [])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [customOpen, setCustomOpen] = useState(false)
  const [customName, setCustomName] = useState('')
  const matches = useMemo(() => {
    const text = query.trim().toLowerCase()
    if (text.length < 2) return []
    return poder.exercises.filter((exercise) => exercise.nombre.toLowerCase().includes(text)).slice(0, 8)
  }, [poder.exercises, query])

  function update(id: string, patch: Partial<RoutineExercise>) {
    setExercises((current) => current.map((exercise) => exercise.id === id ? { ...exercise, ...patch } : exercise))
  }

  async function save() {
    const clean = name.trim()
    if (clean.length < 1 || clean.length > 40) {
      setError('El nombre tiene entre 1 y 40 caracteres')
      return
    }
    if (exercises.length === 0) {
      setError('Añade al menos un ejercicio')
      return
    }
    const routine: Routine = { id: existing?.id ?? crypto.randomUUID(), name: clean, exercises }
    await poder.saveRoutine(routine)
    navigate('/plan')
  }

  return (
    <section className="stack">
      <h1 className="screen-title">{existing ? 'Editar rutina' : 'Nueva rutina'}</h1>
      <label htmlFor="rutina-nombre">Nombre</label>
      <input id="rutina-nombre" className="field" value={name} maxLength={40} onChange={(event) => setName(event.target.value)} />
      {exercises.map((exercise, index) => (
        <article key={exercise.id} className="card stack">
          <strong>{exercise.nombre}</strong>
          <div className="split">
            <label>Series<input className="field" inputMode="numeric" value={exercise.sets} onChange={(event) => update(exercise.id, { sets: clamp(Number(event.target.value), 1, 10) })} /></label>
            <label>Desde<input className="field" inputMode="numeric" value={exercise.minReps} onChange={(event) => update(exercise.id, { minReps: clamp(Number(event.target.value), 1, 100) })} /></label>
            <label>Hasta<input className="field" inputMode="numeric" value={exercise.maxReps} onChange={(event) => update(exercise.id, { maxReps: clamp(Number(event.target.value), 1, 100) })} /></label>
            <label>Descanso<input className="field" inputMode="numeric" value={exercise.restSec} onChange={(event) => update(exercise.id, { restSec: clamp(Math.round(Number(event.target.value) / 15) * 15, 15, 300) })} /></label>
          </div>
          <label>Nota<input className="field" maxLength={140} value={exercise.note} onChange={(event) => update(exercise.id, { note: event.target.value })} /></label>
          <div className="split">
            <button className="btn ghost" type="button" disabled={index === 0} onClick={() => setExercises((current) => move(current, index, -1))}>Subir</button>
            <button className="btn ghost" type="button" disabled={index === exercises.length - 1} onClick={() => setExercises((current) => move(current, index, 1))}>Bajar</button>
            <button className="btn danger" type="button" onClick={() => { if (window.confirm(`Quitar ${exercise.nombre}`)) setExercises((current) => current.filter((item) => item.id !== exercise.id)) }}>Quitar</button>
          </div>
        </article>
      ))}
      <label htmlFor="buscar-rutina">Añadir ejercicio</label>
      <input id="buscar-rutina" className="field" value={query} placeholder="Busca en la biblioteca" onChange={(event) => setQuery(event.target.value)} />
      <ul>
        {matches.map((exercise) => (
          <li key={exercise.id}>
            <button className="btn ghost" type="button" onClick={() => { setExercises((current) => [...current, blankExercise(exercise)]); setQuery('') }}>{exercise.nombre}</button>
          </li>
        ))}
      </ul>
      <button className="btn ghost" type="button" onClick={() => setCustomOpen((value) => !value)}>Crear ejercicio</button>
      {customOpen ? (
        <form className="card stack" onSubmit={(event) => {
          event.preventDefault()
          const nombre = customName.trim()
          if (!nombre) return
          const id = `custom_${crypto.randomUUID()}`
          void poder.saveCustom({
            id,
            nombre,
            musculosPrimarios: ['abdominales'],
            equipo: 'peso-corporal',
            mecanica: 'aislamiento',
            logging: 'reps',
            custom: true,
          }).then(() => {
            setCustomName('')
            setCustomOpen(false)
          })
        }}>
          <label htmlFor="custom-nombre">Nombre en español</label>
          <input id="custom-nombre" className="field" value={customName} onChange={(event) => setCustomName(event.target.value)} />
          <button className="btn primary" type="submit">Guardar ejercicio</button>
        </form>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
      <button className="btn primary" type="button" onClick={() => { void save() }}>Guardar</button>
    </section>
  )
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function move<T>(list: T[], index: number, delta: number): T[] {
  const next = [...list]
  const target = index + delta
  const item = next[index]
  const other = next[target]
  if (!item || !other) return list
  next[index] = other
  next[target] = item
  return next
}
