import type { ReactElement } from 'react';
import type { RankId } from '../catalog/types';
import type { AvatarGender } from '../domain/model';
import { avatarSrc, poseSrc, type AvatarPose } from './manga-art';

export function Avatar({
  gender,
  rank,
  pose,
  className = '',
}: {
  gender: AvatarGender;
  rank: RankId;
  pose?: AvatarPose;
  className?: string;
}): ReactElement {
  const src = (pose ? poseSrc(gender, pose) : null) ?? avatarSrc(gender, rank);
  return (
    <div className={`avatar-frame ${className}`.trim()}>
      <img src={src} alt="" />
    </div>
  );
}
