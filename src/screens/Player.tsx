import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { playBeep, playEnd, unlockAudio } from '../audio/engine'
import { cuesForSecond } from '../ui/restCue'
import { isLoadEquipment } from '../domain/labels'
import { formatLastTime } from '../domain/progression'
import type { LibraryExercise, SessionExercise, WorkoutSession, WorkoutSet } from '../domain/types'
import { usePoder } from '../state/store'
import { inheritedBlock, profileEquip } from '../ui/blocks'
import { equipmentCovered } from '../domain/labels'
import { Modal } from '../ui/Modal'
import { fieldToKg, kgToField, weightStep } from '../ui/weight'

function clock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function laterPending(session: WorkoutSession, blockId: string, setId: string): boolean {
  let seen = false
  for (const exercise of session.exercises) {
    if (exercise.skipped) continue
    for (const set of exercise.sets) {
      if (seen && !set.done) return true
      if (exercise.id === blockId && set.id === setId) seen = true
    }
  }
  return false
}

function commitValue(block: SessionExercise, set: WorkoutSet, done: boolean): { set: WorkoutSet } | { error: string } {
  if (!done) return { set: { ...set, done: false } }
  if (block.logging === 'tiempo') {
    if ((set.seconds ?? 0) < 1) return { error: 'Anota los segundos' }
    return { set: { ...set, done: true } }
  }
  if (block.logging === 'distancia') {
    if (!((set.km ?? 0) > 0)) return { error: 'Anota la distancia' }
    return { set: { ...set, done: true } }
  }
  if ((set.reps ?? 0) < 1) return { error: 'Anota las repeticiones' }
  if (isLoadEquipment(block.equipo) && set.weightKg == null) return { error: 'Escribe el peso' }
  return { set: { ...set, done: true, weightKg: set.weightKg ?? 0 } }
}

export function Player() {
  const params = useParams()
  const navigate = useNavigate()
  const poder = usePoder()
  const remote = poder.sessions.find((session) => session.id === params.sessionId) ?? null
  const [session, setSession] = useState<WorkoutSession | null>(remote)
  const [cursor, setCursor] = useState(0)
  const [error, setError] = useState('')
  const [rest, setRest] = useState<{ endsAt: number; hold: number | null } | null>(null)
  const [stepsOpen, setStepsOpen] = useState(false)
  const [subOpen, setSubOpen] = useState(false)
  const [more, setMore] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [query, setQuery] = useState('')
  const [future, setFuture] = useState(false)
  const [impact, setImpact] = useState(false)
  const persistRef = useRef(poder.persistSession)
  persistRef.current = poder.persistSession
  const chain = useRef(Promise.resolve(true))
  const pull = useRef(false)

  useEffect(() => {
    if (!remote) return
    setSession((current) => (!current || current.id !== remote.id ? remote : current))
  }, [remote])

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== 'visible') return
      pull.current = true
      void poder.refresh()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [poder])

  useEffect(() => {
    if (!pull.current || !remote) return
    pull.current = false
    setSession(remote)
  }, [remote])

  if (!session) return <p>No encuentro esa sesión.</p>
  if (session.status === 'completado') {
    return <Link to={`/entreno/${session.id}/resumen`}>Ver resumen</Link>
  }

  const visible = session.exercises.filter((exercise) => !exercise.skipped)
  const safeIndex = Math.min(cursor, Math.max(0, visible.length - 1))
  const block = visible[safeIndex]
  const library = block ? poder.exercises.find((exercise) => exercise.id === block.exerciseId) : undefined
  const memory = block ? poder.memory.find((item) => item.exerciseId === block.exerciseId) : undefined
  const heavy = Boolean(block?.compound)

  function save(next: WorkoutSession): Promise<boolean> {
    setSession(next)
    const run = chain.current.then(() => persistRef.current(next))
    chain.current = run.then(() => true, () => false)
    return run
  }

  function patchBlock(blockId: string, map: (exercise: SessionExercise) => SessionExercise): WorkoutSession {
    return {
      ...session!,
      exercises: session!.exercises.map((exercise) => exercise.id === blockId ? map(exercise) : exercise),
    }
  }

  async function mark(set: WorkoutSet, done: boolean) {
    if (!block) return
    void unlockAudio()
    const result = commitValue(block, set, done)
    if ('error' in result) {
      setError(result.error)
      return
    }
    setError('')
    const next = patchBlock(block.id, (exercise) => ({
      ...exercise,
      sets: exercise.sets.map((item) => item.id === set.id ? result.set : item),
    }))
    const previous = session
    const ok = await save(next)
    if (!ok) {
      setSession(previous)
      return
    }
    if (!done) {
      setRest(null)
      return
    }
    if (poder.settings.themeIntensity === 'maximo' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setImpact(true)
      window.setTimeout(() => setImpact(false), 180)
    }
    if (laterPending(next, block.id, set.id)) setRest({ endsAt: Date.now() + block.restSec * 1000, hold: null })
  }

  function editSet(setId: string, patch: Partial<WorkoutSet>) {
    if (!block) return
    setSession(patchBlock(block.id, (exercise) => ({
      ...exercise,
      sets: exercise.sets.map((item) => item.id === setId ? { ...item, ...patch } : item),
    })))
  }

  async function finish() {
    if (!session) return
    await poder.closeWorkout(session)
    navigate(`/entreno/${session.id}/resumen`)
  }

  async function endOrAsk() {
    if (!session) return
    const done = session.exercises.some((exercise) => exercise.sets.some((set) => set.kind === 'trabajo' && set.done))
    if (!done) {
      await poder.discardWorkout(session)
      navigate('/')
      return
    }
    const pending = session.exercises.some((exercise) => !exercise.skipped && exercise.sets.some((set) => set.kind === 'trabajo' && !set.done))
    if (pending) setConfirm(true)
    else await finish()
  }

  async function substitute(choice: LibraryExercise) {
    if (!session || !block) return
    const fresh = inheritedBlock(block, choice)
    const doneSets = block.sets.filter((set) => set.done)
    const exercises = doneSets.length === 0
      ? session.exercises.map((exercise) => exercise.id === block.id ? fresh : exercise)
      : session.exercises.flatMap((exercise) => exercise.id === block.id
        ? [{ ...block, sets: doneSets, setsPlanned: doneSets.filter((set) => set.kind === 'trabajo').length }, fresh]
        : [exercise])
    const ok = await save({ ...session, exercises })
    if (ok && future) {
      await poder.rewriteFutureExercise(block.exerciseId, {
        exerciseId: choice.id,
        nombre: choice.nombre,
        logging: choice.logging,
        compound: choice.compound,
        equipo: profileEquip(choice),
        muscleGroup: choice.muscleGroup,
      })
    }
    setSubOpen(false)
  }

  const candidates = poder.profile && block ? poder.exercises.filter((exercise) => {
    if (exercise.id === block.exerciseId) return false
    const primary = block.musculosPrimarios[0]
    const muscleOk = primary
      ? exercise.musculosPrimarios[0] === primary
      : false
    const covered = equipmentCovered(profileEquip(exercise), poder.profile?.equipment ?? [])
    const text = query.trim().toLowerCase()
    const named = text.length === 0 || exercise.nombre.toLowerCase().includes(text)
    return muscleOk && covered && named
  }).slice(0, 30) : []

  return (
    <section className={impact ? 'stack impact' : 'stack'}>
      <div className="row">
        <p className="muted grow">{visible.length === 0 ? 'Sesión suelta' : `${safeIndex + 1} de ${visible.length}`}</p>
        <button className="btn ghost" type="button" onClick={() => setMore((value) => !value)}>Más</button>
      </div>
      {!block ? (
        <article className="card stack">
          <h1 className="screen-title">Añade un ejercicio</h1>
          <Link className="btn primary" to="/biblioteca?anadir=1">Añadir ejercicio</Link>
        </article>
      ) : (
        <>
          <h1 className="screen-title">{block.nombre}</h1>
          <button className="btn ghost" type="button" onClick={() => setStepsOpen(true)}>Ver pasos</button>
          <p>{formatLastTime(memory?.lastWorkingSets, poder.settings.unit, block.exerciseId === 'Plank')}</p>
          {block.sets.map((set, index) => (
            <div key={set.id} className={set.done ? 'set-row done' : 'set-row'}>
              <div className="stack">
                <span>{set.kind === 'calentamiento' ? 'Calentamiento' : `Trabajo ${index + 1}`}</span>
                {block.logging === 'reps_peso' || block.logging === 'reps' ? (
                  <div className="split">
                    {block.logging === 'reps_peso' ? (
                      <div className="row">
                        <button className="btn ghost" type="button" aria-label="Bajar peso" onClick={() => {
                          const current = set.weightKg ?? 0
                          const step = weightStep(poder.settings.unit, heavy)
                          const shown = (poder.settings.unit === 'lb' ? Number(kgToField(current, 'lb').replace(',', '.')) : current) - step
                          editSet(set.id, { weightKg: fieldToKg(String(Math.max(0, shown)), poder.settings.unit) })
                        }}>−</button>
                        <input className="field" inputMode="decimal" aria-label={poder.settings.unit === 'lb' ? 'Peso en lb' : 'Peso en kg'} value={kgToField(set.weightKg, poder.settings.unit)} onChange={(event) => editSet(set.id, { weightKg: event.target.value.trim() === '' ? null : fieldToKg(event.target.value, poder.settings.unit) })} />
                        <span aria-hidden="true">{poder.settings.unit === 'lb' ? 'lb' : 'kg'}</span>
                        <button className="btn ghost" type="button" aria-label="Subir peso" onClick={() => {
                          const current = set.weightKg ?? 0
                          const step = weightStep(poder.settings.unit, heavy)
                          const shown = (poder.settings.unit === 'lb' ? Number(kgToField(current, 'lb').replace(',', '.')) : current) + step
                          editSet(set.id, { weightKg: fieldToKg(String(shown), poder.settings.unit) })
                        }}>+</button>
                      </div>
                    ) : null}
                    <input className="field" inputMode="numeric" aria-label="Repeticiones" value={set.reps ?? ''} onChange={(event) => editSet(set.id, { reps: event.target.value === '' ? null : Number(event.target.value) })} />
                  </div>
                ) : null}
                {block.logging === 'tiempo' ? (
                  <input className="field" inputMode="numeric" aria-label="Segundos" value={set.seconds ?? ''} onChange={(event) => editSet(set.id, { seconds: event.target.value === '' ? null : Number(event.target.value) })} />
                ) : null}
                {block.logging === 'distancia' ? (
                  <input className="field" inputMode="decimal" aria-label="Kilómetros" value={set.km ?? ''} onChange={(event) => editSet(set.id, { km: event.target.value === '' ? null : Number(event.target.value.replace(',', '.')) })} />
                ) : null}
                {set.kind === 'calentamiento' ? <button className="btn ghost" type="button" onClick={() => { void save(patchBlock(block.id, (exercise) => ({ ...exercise, sets: exercise.sets.filter((item) => item.id !== set.id) }))) }}>Quitar</button> : null}
              </div>
              <button className="btn primary" type="button" aria-pressed={set.done} onClick={() => { void mark(set, !set.done) }}>Hecha</button>
            </div>
          ))}
          {error ? <p role="alert">{error}</p> : null}
          <div className="split">
            <button className="btn ghost" type="button" disabled={safeIndex === 0} onClick={() => setCursor((value) => Math.max(0, value - 1))}>Anterior</button>
            <button className="btn ghost" type="button" disabled={safeIndex >= visible.length - 1} onClick={() => setCursor((value) => value + 1)}>Siguiente</button>
          </div>
        </>
      )}
      {more ? (
        <div className="card stack">
          {block ? (
            <button className="btn ghost" type="button" onClick={() => {
              const sample = [...block.sets].reverse().find((set) => set.kind === 'trabajo')
              const extra: WorkoutSet = sample
                ? { ...sample, id: crypto.randomUUID(), done: false }
                : { id: crypto.randomUUID(), kind: 'trabajo', weightKg: null, reps: block.minReps, seconds: null, km: null, done: false }
              void save(patchBlock(block.id, (exercise) => ({ ...exercise, sets: [...exercise.sets, extra] })))
              setMore(false)
            }}>Añadir serie</button>
          ) : null}
          <Link className="btn ghost" to="/biblioteca?anadir=1">Añadir ejercicio</Link>
          {block ? <button className="btn ghost" type="button" onClick={() => { setSubOpen(true); setMore(false) }}>Sustituir</button> : null}
          {block ? (
            <button className="btn ghost" type="button" onClick={() => { void save(patchBlock(block.id, (exercise) => ({ ...exercise, skipped: !exercise.skipped }))); setMore(false) }}>
              {block.skipped ? 'Recuperar ejercicio' : 'Saltar'}
            </button>
          ) : null}
        </div>
      ) : null}
      <button className="btn danger" type="button" onClick={() => { void endOrAsk() }}>
        {session.exercises.some((exercise) => exercise.sets.some((set) => set.kind === 'trabajo' && set.done)) ? 'Terminar' : 'Descartar'}
      </button>
      {rest ? (
        <RestBar
          endsAt={rest.endsAt}
          hold={rest.hold}
          volume={poder.settings.restVolume}
          onHold={(hold) => setRest({ endsAt: rest.endsAt, hold })}
          onShift={(delta) => {
            if (rest.hold != null) setRest({ endsAt: rest.endsAt, hold: Math.max(0, rest.hold + delta) })
            else setRest({ endsAt: Math.max(Date.now(), rest.endsAt + delta), hold: null })
          }}
          onClear={() => setRest(null)}
        />
      ) : null}
      {stepsOpen && block ? (
        <Modal title={block.nombre} onClose={() => setStepsOpen(false)}>
          <ol>{(library?.pasos ?? []).map((step) => <li key={step}>{step}</li>)}</ol>
          {library?.avisoIdioma ? <p>Pasos en el idioma de la ficha</p> : null}
        </Modal>
      ) : null}
      {subOpen && block ? (
        <Modal title="Sustituir" onClose={() => setSubOpen(false)}>
          <input className="field" aria-label="Buscar sustituto" value={query} onChange={(event) => setQuery(event.target.value)} />
          <label className="check">
            <input type="checkbox" checked={future} onChange={(event) => setFuture(event.target.checked)} />
            Usar este cambio en las sesiones futuras del arco
          </label>
          <ul>
            {candidates.map((exercise) => (
              <li key={exercise.id}><button className="btn ghost" type="button" onClick={() => { void substitute(exercise) }}>{exercise.nombre}</button></li>
            ))}
          </ul>
        </Modal>
      ) : null}
      {confirm ? (
        <Modal title="Cerrar sesión" onClose={() => setConfirm(false)}>
          <p>Cierras con series sin anotar. Esas no suman.</p>
          <div className="split">
            <button className="btn ghost" type="button" onClick={() => setConfirm(false)}>Volver</button>
            <button className="btn primary" type="button" onClick={() => { void finish() }}>Cerrar sesión</button>
          </div>
        </Modal>
      ) : null}
    </section>
  )
}

function RestBar({ endsAt, hold, volume, onHold, onShift, onClear }: {
  endsAt: number
  hold: number | null
  volume: number
  onHold: (hold: number | null) => void
  onShift: (deltaMs: number) => void
  onClear: () => void
}) {
  const [now, setNow] = useState(() => Date.now())
  const [cues, setCues] = useState<string[]>([])
  const sounded = useRef(false)
  const lastBeep = useRef(99)
  const previousSeconds = useRef<number | null>(null)
  useEffect(() => {
    let frame = 0
    const tick = () => {
      setNow(Date.now())
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])
  const left = hold != null ? hold : Math.max(0, endsAt - now)
  const seconds = Math.ceil(left / 1000)
  useEffect(() => {
    const next = cuesForSecond(previousSeconds.current, seconds)
    previousSeconds.current = seconds
    next.forEach((cue, index) => {
      window.setTimeout(() => {
        setCues((current) => current.includes(cue) ? current : [...current, cue])
      }, index * 60)
    })
  }, [seconds])
  useEffect(() => {
    if (hold != null) return
    const seconds = Math.ceil(left / 1000)
    if (seconds >= 1 && seconds <= 3 && seconds < lastBeep.current) playBeep(volume)
    lastBeep.current = seconds
  }, [left, hold, volume])
  useEffect(() => {
    if (hold != null || sounded.current) return
    const delay = endsAt - Date.now()
    const play = () => {
      if (sounded.current) return
      sounded.current = true
      playEnd(volume)
    }
    if (delay <= 0) {
      play()
      return
    }
    const timer = window.setTimeout(play, delay)
    return () => window.clearTimeout(timer)
  }, [endsAt, hold, volume])
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && hold == null && Date.now() >= endsAt && !sounded.current) {
        sounded.current = true
        playEnd(volume)
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [endsAt, hold, volume])
  const finished = left <= 0
  return (
    <div className={finished ? 'rest finished' : 'rest'} role="timer" aria-label="Descanso">
      <div className="sr" aria-live="polite" aria-atomic="false">
        {cues.map((cue) => <span key={cue}>{cue}. </span>)}
      </div>
      <p className="tabular" style={{ fontSize: '2.4rem', margin: 0 }}>{clock(left)}</p>
      <div className="split">
        <button className="btn ghost" type="button" onClick={() => onHold(hold == null ? left : null)}>{hold == null ? 'Pausa' : 'Reanudar'}</button>
        <button className="btn ghost" type="button" onClick={() => onShift(30_000)}>+30 s</button>
        <button className="btn ghost" type="button" onClick={() => onShift(-15_000)}>−15 s</button>
        <button className="btn ghost" type="button" onClick={onClear}>Saltar</button>
        {finished ? <button className="btn primary" type="button" onClick={onClear}>Listo</button> : null}
      </div>
    </div>
  )
}
