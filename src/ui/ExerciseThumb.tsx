import type { ReactElement } from 'react';
import { exerciseThumb, imageSrc } from '../catalog/everkinetic';

export function ExerciseThumb({
  images,
  nombre,
  size = 'tile',
  labelled = false,
}: {
  images: readonly string[] | undefined;
  nombre: string;
  size?: 'tile' | 'stage';
  labelled?: boolean;
}): ReactElement {
  const thumb = exerciseThumb(images);
  const className = size === 'stage' ? 'exercise-thumb is-stage' : 'exercise-thumb';
  if (thumb) {
    return <img className={className} src={imageSrc(thumb)} alt="" width={size === 'stage' ? 240 : 72} height={size === 'stage' ? 150 : 72} />;
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
