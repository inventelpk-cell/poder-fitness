import credits from '../../data/exercises/CREDITS.md?raw'
import { usePoder } from '../state/store'

export function About() {
  const poder = usePoder()
  const count = poder.exercises.filter((exercise) => !exercise.custom).length
  return (
    <section className="stack">
      <h1 className="screen-title">Acerca de</h1>
      <p>Poder Fitness es un cuaderno de entreno para una persona. Los datos viven en este navegador.</p>
      <p>Biblioteca cargada: {count} ejercicios.</p>
      <p>
        La base y las fotos vienen de <a href="https://github.com/yuhonas/free-exercise-db">yuhonas/free-exercise-db</a>, licencia The Unlicense.
        El texto íntegro está en <code>data/exercises/CREDITS.md</code>.
      </p>
      <pre className="card" style={{ whiteSpace: 'pre-wrap' }}>{credits}</pre>
    </section>
  )
}
