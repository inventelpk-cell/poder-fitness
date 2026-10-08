import { exerciseThumb, imageSrc, verifiedExerciseSrc } from './everkinetic';
import type { Exercise, Origin } from './types';

function publicSrc(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

function basename(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1);
}

function mediaMatchesExercise(exercise: Pick<Exercise, 'id' | 'mediaId' | 'imagenes' | 'gif'>, path: string | undefined): boolean {
  if (!path) return false;
  const file = basename(path);
  if (exercise.mediaId && file.includes(exercise.mediaId)) return true;
  const numeric = exercise.id.replace(/^gv-/, '');
  if (numeric && file.startsWith(`${numeric}-`)) return true;
  return exercise.imagenes?.some((image) => basename(image) === file) ?? false;
}

export function exerciseGif(exercise: Pick<Exercise, 'gif' | 'mediaId' | 'id' | 'imagenes'>): string | null {
  if (!exercise.gif || !mediaMatchesExercise(exercise, exercise.gif)) return null;
  return publicSrc(exercise.gif);
}

export function exerciseImage(exercise: Pick<Exercise, 'origen' | 'imagenes' | 'gif' | 'mediaId' | 'id'>): string | null {
  const gif = exerciseGif(exercise);
  if (gif) return gif;
  const image = exercise.imagenes?.[0];
  if (image && mediaMatchesExercise(exercise, image)) return publicSrc(image);
  return verifiedExerciseSrc(exercise.origen, exercise.imagenes);
}

export function exerciseStageMedia(exercise: Exercise): string | null {
  return exerciseImage(exercise);
}

export function exerciseTileMedia(
  exercise: Pick<Exercise, 'origen' | 'imagenes' | 'gif' | 'mediaId' | 'id'>,
): string | null {
  const gif = exerciseGif(exercise);
  if (gif) return gif;
  const image = exercise.imagenes?.[0];
  if (image && mediaMatchesExercise(exercise, image)) return publicSrc(image);
  if (exercise.origen === 'everkinetic') {
    const thumb = exerciseThumb(exercise.imagenes);
    return thumb ? imageSrc(thumb) : null;
  }
  return null;
}

export function mediaKind(origen: Origin | undefined, src: string | null): 'gif' | 'image' | 'everkinetic' | null {
  if (!src) return null;
  if (src.endsWith('.gif')) return 'gif';
  if (origen === 'everkinetic') return 'everkinetic';
  return 'image';
}

export const GYM_VISUAL_ATTRIBUTION = '© Gym visual — https://gymvisual.com/';
