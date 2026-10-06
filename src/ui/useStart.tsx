import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { unlockAudio } from '../audio/engine'
import type { SessionExercise, WorkoutSession } from '../domain/types'
import { usePoder } from '../state/store'
import { Modal } from './Modal'

type Job =
  | { type: 'planned'; id: string }
  | { type: 'routine'; id: string }
  | { type: 'loose' }
  | { type: 'repeat'; session: WorkoutSession }

async function runJob(job: Job, poder: ReturnType<typeof usePoder>): Promise<WorkoutSession | null> {
  switch (job.type) {
    case 'planned':
      return poder.startPlanned(job.id)
    case 'routine':
      return poder.startRoutine(job.id)
    case 'loose':
      return poder.startLoose()
    case 'repeat': {
      const created = await poder.startLoose()
      if (!created) return null
      const exercises: SessionExercise[] = job.session.exercises.map((exercise) => ({
        ...exercise,
        id: crypto.randomUUID(),
        skipped: false,
        substituted: false,
        sets: exercise.sets
          .filter((set) => set.kind === 'trabajo')
          .map((set) => ({ ...set, id: crypto.randomUUID(), done: false })),
      }))
      const next = { ...created, exercises }
      await poder.persistSession(next)
      return next
    }
    default: {
      const unreachable: never = job
      return unreachable
    }
  }
}

export function useStart() {
  const poder = usePoder()
  const navigate = useNavigate()
  const [ask, setAsk] = useState(false)
  const [arm, setArm] = useState(false)
  const job = useRef<Job | null>(null)

  useEffect(() => {
    if (!arm || poder.openSession()) return
    const pending = job.current
    job.current = null
    setArm(false)
    if (!pending) return
    void runJob(pending, poder).then((session) => {
      if (session) navigate(`/entreno/${session.id}`)
    })
  }, [arm, poder, navigate])

  async function go(next: Job, withAudio: boolean) {
    if (withAudio) await unlockAudio()
    if (poder.openSession()) {
      job.current = next
      setAsk(true)
      return
    }
    const session = await runJob(next, poder)
    if (session) navigate(`/entreno/${session.id}`)
  }

  const dialog = ask ? (
    <Modal title="Sesión abierta" onClose={() => setAsk(false)}>
      <p>Tienes una sesión abierta</p>
      <div className="split">
        <button
          className="btn primary"
          type="button"
          onClick={() => {
            const open = poder.openSession()
            setAsk(false)
            if (open) navigate(`/entreno/${open.id}`)
          }}
        >
          Seguir
        </button>
        <button
          className="btn danger"
          type="button"
          onClick={() => {
            setAsk(false)
            void poder.discardOpen().then(async () => {
              await poder.refresh()
              setArm(true)
            })
          }}
        >
          Descartar la abierta
        </button>
      </div>
    </Modal>
  ) : null

  return { go, dialog }
}
