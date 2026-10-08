import type { ReactElement } from 'react';
import { exerciseTileMedia, mediaKind } from '../catalog/media';
import type { Exercise } from '../catalog/types';

export function ExerciseThumb({
  exercise,
  nombre,
  size = 'tile',
  labelled = false,
}: {
  exercise: Pick<Exercise, 'origen' | 'imagenes' | 'gif' | 'mediaId' | 'id'>;
  nombre: string;
  size?: 'tile' | 'stage';
  labelled?: boolean;
}): ReactElement | null {
  const src = exerciseTileMedia(exercise);
  if (!src) return null;
  const kind = mediaKind(exercise.origen, src);
  const className =
    size === 'stage'
      ? `exercise-thumb is-stage ${kind === 'everkinetic' ? 'pf-ek' : 'gv-media'}`
      : `exercise-thumb ${kind === 'everkinetic' ? 'pf-ek' : 'gv-media'}`;
  return (
    <span className={className}>
      <img src={src} alt={labelled ? nombre : ''} loading="lazy" />
    </span>
  );
}
