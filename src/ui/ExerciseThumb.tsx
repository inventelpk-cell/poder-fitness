import type { ReactElement } from 'react';
import { verifiedExerciseSrc } from '../catalog/everkinetic';
import type { Origin } from '../catalog/types';

export function ExerciseThumb({
  images,
  nombre,
  origen,
  size = 'tile',
  labelled = false,
}: {
  images: readonly string[] | undefined;
  nombre: string;
  origen?: Origin;
  size?: 'tile' | 'stage';
  labelled?: boolean;
}): ReactElement | null {
  const src = verifiedExerciseSrc(origen, images);
  if (!src) return null;
  const className = size === 'stage' ? 'exercise-thumb is-stage pf-ek' : 'exercise-thumb pf-ek';
  return (
    <span className={className}>
      <img src={src} alt={labelled ? nombre : ''} />
    </span>
  );
}
