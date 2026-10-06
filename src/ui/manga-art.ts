import type { RankId } from '../catalog/types';
import type { AvatarGender } from '../domain/model';

export type AvatarPose = 'idle' | 'entrenando' | 'victoria' | 'cargando' | 'transformacion';

const HOLE_IDS: Record<string, string> = {
  'sentadilla-corporal': 'sentadilla',
  zancada: 'zancada',
  'curl-femoral-deslizante': 'curl-femoral-deslizante',
};

const femaleRanks = import.meta.glob('../../design/manga/avatar/female/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const femalePoses = import.meta.glob('../../design/manga/avatar/female/poses/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const exerciseArt = import.meta.glob('../../design/manga/exercises/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

function bundled(map: Record<string, string>, fileName: string): boolean {
  return Object.keys(map).some((key) => key.endsWith(`/${fileName}`));
}

export function avatarSrc(gender: AvatarGender, rank: RankId): string {
  if (gender === 'mujer' && bundled(femaleRanks, `${rank}.png`)) {
    return `/design/manga/avatar/female/${rank}.png`;
  }
  return `/design/manga/avatar/male/${rank}.png`;
}

export function poseSrc(gender: AvatarGender, pose: AvatarPose): string {
  if (gender === 'mujer' && bundled(femalePoses, `${pose}.png`)) {
    return `/design/manga/avatar/female/poses/${pose}.png`;
  }
  return `/design/manga/avatar/male/poses/${pose}.png`;
}

export function originalExerciseSrc(exerciseId: string | undefined): string | null {
  if (!exerciseId) return null;
  const file = HOLE_IDS[exerciseId];
  if (!file || !bundled(exerciseArt, `${file}.png`)) return null;
  return `/design/manga/exercises/${file}.png`;
}

export function isOriginalHole(exerciseId: string | undefined): boolean {
  return Boolean(exerciseId && exerciseId in HOLE_IDS);
}
