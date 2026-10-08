import type { ReactElement } from 'react';
import { exerciseStageMedia, GYM_VISUAL_ATTRIBUTION } from '../catalog/media';
import type { Exercise } from '../catalog/types';
import { labelEquipment, labelMuscle } from '../domain/labels';

export function HowTo({ exercise }: { exercise: Exercise }): ReactElement {
  const src = exerciseStageMedia(exercise);
  const muscles =
    exercise.musculosTexto && exercise.musculosTexto.length > 0
      ? exercise.musculosTexto.join(', ')
      : exercise.musculo
        ? labelMuscle(exercise.musculo)
        : 'Sin músculo indicado';
  const gear =
    exercise.equipoTexto && exercise.equipoTexto.length > 0
      ? exercise.equipoTexto.join(', ')
      : exercise.equipo.map((item) => labelEquipment(item)).join(', ') || 'Sin equipo indicado';

  return (
    <section className="how-to">
      <p className="kicker">Cómo se hace</p>
      <p>
        <span className="muted">Músculos. </span>
        {muscles}
      </p>
      <p>
        <span className="muted">Equipo. </span>
        {gear}
      </p>
      {src ? (
        <span className={`exercise-thumb is-stage ${exercise.origen === 'everkinetic' ? 'pf-ek' : 'gv-media'}`}>
          <img src={src} alt="" loading="lazy" />
        </span>
      ) : null}
      {exercise.pasos.length > 0 ? (
        <div>
          <h2>Pautas</h2>
          <ol>
            {exercise.pasos.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      ) : null}
      {exercise.consejos && exercise.consejos.length > 0 ? (
        <div>
          <h2>Consejos</h2>
          <ul>
            {exercise.consejos.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {exercise.origen === 'gym-visual' ? (
        <p className="muted attribution">{exercise.atribucion ?? GYM_VISUAL_ATTRIBUTION}</p>
      ) : null}
    </section>
  );
}
