import type { ReactElement } from 'react';
import { exerciseThumb, imageSrc } from '../catalog/everkinetic';
import { isOriginalHole, originalExerciseSrc, poseSrc } from './manga-art';

export function ExerciseThumb({
  images,
  nombre,
  exerciseId,
  size = 'tile',
  labelled = false,
}: {
  images: readonly string[] | undefined;
  nombre: string;
  exerciseId?: string;
  size?: 'tile' | 'stage';
  labelled?: boolean;
}): ReactElement {
  const className = size === 'stage' ? 'exercise-thumb is-stage' : 'exercise-thumb';
  const original = originalExerciseSrc(exerciseId);
  if (original) {
    return labelled ? (
      <img className={className} src={original} alt={nombre} width={size === 'stage' ? 240 : 72} height={size === 'stage' ? 150 : 72} />
    ) : (
      <img className={className} src={original} alt="" width={size === 'stage' ? 240 : 72} height={size === 'stage' ? 150 : 72} />
    );
  }
  const thumb = exerciseThumb(images);
  if (thumb) {
    const src = imageSrc(thumb);
    return (
      <span className={`${className} pf-ek pf-ek--hueso`}>
        <img src={src} alt={labelled ? nombre : ''} />
      </span>
    );
  }
  if (isOriginalHole(exerciseId)) {
    return (
      <img
        className={className}
        src={poseSrc('hombre', 'entrenando')}
        alt={labelled ? nombre : ''}
        width={size === 'stage' ? 240 : 72}
        height={size === 'stage' ? 150 : 72}
      />
    );
  }
  if (labelled) {
    return (
      <span className={`${className} thumb-mark`} role="img" aria-label={nombre}>
        <img src="/design/brand/logo-symbol.svg" alt="" />
      </span>
    );
  }
  return (
    <span className={`${className} thumb-mark`} aria-hidden="true">
      <img src="/design/brand/logo-symbol.svg" alt="" />
    </span>
  );
}
