import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { usePoder } from '../state/store'
import { exerciseImage } from '../ui/asset'
import { blockFromLibrary } from '../ui/blocks'
import { categoryLabel, equipmentLabel, levelLabel, mechanicLabel, muscleLabel } from '../ui/catalog'

export function ExerciseCard() {
  const poder = usePoder()
  const navigate = useNavigate()
  const params = useParams()
  const [search] = useSearchParams()
  const exercise = poder.exercises.find((item) => item.id === params.exerciseId)
  const [frame, setFrame] = useState(0)
  const [broken, setBroken] = useState<Record<number, boolean>>({})
  const [routineId, setRoutineId] = useState(poder.routines[0]?.id ?? '')
  if (!exercise) return <p>Ese ejercicio no está en la biblioteca.</p>
  const item = exercise
  const open = poder.openSession()
  const images = item.imagenes

  async function addToOpen() {
    if (!open) return
    const next = { ...open, exercises: [...open.exercises, blockFromLibrary(item)] }
    const ok = await poder.persistSession(next)
    if (ok) navigate(`/entreno/${open.id}`)
  }

  async function addToRoutine() {
    const routine = poder.routines.find((item) => item.id === routineId)
    if (!routine) {
      navigate('/plan/rutina/nueva')
      return
    }
    const block = blockFromLibrary(item)
    await poder.saveRoutine({
      ...routine,
      exercises: [...routine.exercises, {
        id: block.id,
        exerciseId: block.exerciseId,
        nombre: block.nombre,
        logging: block.logging,
        compound: block.compound,
        equipo: block.equipo,
        catalogEquip: block.catalogEquip,
        muscleGroup: block.muscleGroup,
        musculosPrimarios: block.musculosPrimarios,
        sets: block.setsPlanned,
        minReps: block.minReps,
        maxReps: block.maxReps,
        restSec: block.restSec,
        note: '',
        groupId: null,
      }],
    })
  }

  return (
    <article className="stack">
      <h1 className="screen-title">{item.nombre}</h1>
      <div className="pair">
        {images.length === 0 ? <div className="fallback-shot">Sin foto</div> : images.map((src, index) => (
          broken[index] ? (
            <div key={src} className="fallback-shot">Foto no disponible</div>
          ) : (
            <button key={src} type="button" className="ghost" onClick={() => setFrame(index)} aria-pressed={frame === index}>
              <img className="shot" src={exerciseImage(src)} alt="" onError={() => setBroken((current) => ({ ...current, [index]: true }))} />
            </button>
          )
        ))}
      </div>
      <p>Músculos: {exercise.musculosPrimarios.map(muscleLabel).join(', ') || 'Sin grupo'}</p>
      {exercise.musculosSecundarios.length > 0 ? <p className="muted">También: {exercise.musculosSecundarios.map(muscleLabel).join(', ')}</p> : null}
      <p>Equipo: {equipmentLabel(exercise.equipo)}</p>
      <p>Nivel: {levelLabel(exercise.nivel)}</p>
      <p>Categoría: {categoryLabel(exercise.categoria)}</p>
      <p>Mecánica: {mechanicLabel(exercise.mecanica)}</p>
      <ol>
        {exercise.pasos.map((step) => <li key={step}>{step}</li>)}
      </ol>
      {exercise.avisoIdioma ? <p>Pasos en el idioma de la ficha</p> : null}
      <div className="stack">
        {poder.routines.length === 0 ? (
          <Link className="btn ghost" to="/plan/rutina/nueva">Añadir a la rutina…</Link>
        ) : (
          <>
            <label htmlFor="rutina-destino">Añadir a la rutina…</label>
            <select id="rutina-destino" className="select" value={routineId} onChange={(event) => setRoutineId(event.target.value)}>
              {poder.routines.map((routine) => <option key={routine.id} value={routine.id}>{routine.name}</option>)}
            </select>
            <button className="btn ghost" type="button" onClick={() => { void addToRoutine() }}>Añadir a la rutina…</button>
          </>
        )}
        {open || search.get('anadir') === '1' ? (
          <button className="btn primary" type="button" disabled={!open} onClick={() => { void addToOpen() }}>Meter en el entreno de hoy</button>
        ) : null}
      </div>
    </article>
  )
}
