import type { RankId } from '../catalog/types';
import type { AvatarGender } from '../domain/model';

export type AvatarPose = 'idle' | 'entrenando' | 'victoria' | 'cargando' | 'transformacion';

const HOLE_IDS: Record<string, string> = {
  'sentadilla-corporal': 'sentadilla',
  zancada: 'zancada',
  'curl-femoral-deslizante': 'curl-femoral-deslizante',
};

const FEMALE_POSES = new Set<AvatarPose>(['idle', 'entrenando', 'victoria', 'cargando']);

export function avatarSrc(gender: AvatarGender, rank: RankId): string {
  const folder = gender === 'mujer' ? 'female' : 'male';
  return `/design/manga/avatar/${folder}/${rank}.png`;
}

export function poseSrc(gender: AvatarGender, pose: AvatarPose): string | null {
  if (gender === 'mujer' && !FEMALE_POSES.has(pose)) return null;
  const folder = gender === 'mujer' ? 'female' : 'male';
  return `/design/manga/avatar/${folder}/poses/${pose}.png`;
}

export function originalExerciseSrc(exerciseId: string | undefined): string | null {
  if (!exerciseId) return null;
  const file = HOLE_IDS[exerciseId];
  if (!file) return null;
  return `/design/manga/exercises/${file}.png`;
}

export function isOriginalHole(exerciseId: string | undefined): boolean {
  return Boolean(exerciseId && exerciseId in HOLE_IDS);
}
