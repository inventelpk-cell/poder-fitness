import { useEffect, useRef, useState, type ReactElement } from 'react';
import { coachPortrait, pickCoachLine, type CoachEvent, type CoachLine } from '../domain/coach';
import { useApp } from '../state/app-state';

export function CoachBubble({ event, tick = 0 }: { event: CoachEvent; tick?: number }): ReactElement | null {
  const { profile } = useApp();
  const lastId = useRef<string | null>(null);
  const [line, setLine] = useState<CoachLine | null>(null);
  const coach = profile?.coach;
  const tone = profile?.darioTone;

  useEffect(() => {
    if (!coach || !tone) return;
    const next = pickCoachLine({ coach, event, tone, lastId: lastId.current });
    lastId.current = next.id;
    setLine(next);
  }, [coach, tone, event, tick]);

  if (!profile || !line) return null;

  return (
    <div className="coach-bubble" role="status">
      <img src={coachPortrait(profile.coach)} alt="" width={32} height={32} />
      <p>{line.text}</p>
    </div>
  );
}
