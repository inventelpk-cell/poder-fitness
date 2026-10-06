import credits from '../../data/exercises/CREDITS.md?raw'
import { usePoder } from '../state/store'

function creditParagraphs(markdown: string): string[] {
  return markdown
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block
      .split('\n')
      .map((line) => line
        .replace(/^#{1,6}\s+/, '')
        .replace(/^[-*]\s+/, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
        .trim())
      .filter((line) => line.length > 0)
      .join(' '))
    .filter((paragraph) => paragraph.length > 0)
}

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
      {creditParagraphs(credits).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    </section>
  )
}
