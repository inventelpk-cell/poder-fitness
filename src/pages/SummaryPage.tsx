import { useEffect, useState, type ReactElement } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { getSession, saveProfile } from '../db/db';
import { formatInt, formatWeightKg } from '../domain/format';
import { labelRank } from '../domain/labels';
import type { RankId } from '../catalog/types';
import type { WorkoutSession } from '../domain/model';
import { RANK_IDS } from '../catalog/types';
import { nivelDePoder, nextLevelXp, rankForXp, ranksCrossed, xpParaAlcanzarNivel } from '../domain/ranks';
import { volumeOf } from '../domain/session';
import { breakdownLine } from '../domain/xp';
import { useApp } from '../state/app-state';
import { Transformacion } from '../ui/Transformacion';

export function SummaryPage(): ReactElement {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, refresh } = useApp();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [queue, setQueue] = useState<RankId[] | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    void getSession(id).then((found) => setSession(found ?? null));
  }, [id]);

  useEffect(() => {
    if (!profile || !session || session.status !== 'completada' || queue) return;
    const state = location.state as { xpBefore?: number } | null;
    const before = state?.xpBefore ?? Math.max(0, profile.xpTotal - session.xpAwarded);
    setQueue(ranksCrossed(before, profile.xpTotal, profile.ranksSeen));
  }, [profile, session, location.state, queue]);

  const pending = queue?.[step];

  useEffect(() => {
    if (!profile || !pending || profile.ranksSeen.includes(pending)) return;
    void saveProfile({ ...profile, ranksSeen: [...profile.ranksSeen, pending] }).then(() => refresh());
  }, [pending, profile, refresh]);

  if (!profile || !session) return <main className="screen narrow"><p>Cargando el resumen…</p></main>;

  if (pending) {
    const index = RANK_IDS.indexOf(pending);
    const desde = RANK_IDS[index - 1] ?? 'chispa';
    return <Transformacion desde={desde} hacia={pending} onDone={() => setStep((value) => value + 1)} />;
  }

  const minutes = session.finishedAt
    ? Math.max(1, Math.round((new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime()) / 60000))
    : 0;
  const volume = volumeOf(session);
  const level = nivelDePoder(profile.xpTotal);
  const floor = xpParaAlcanzarNivel(level);
  const next = nextLevelXp(level);
  const span = next === null ? 1 : Math.max(1, next - floor);
  const rank = rankForXp(profile.xpTotal);

  return (
    <main className="screen narrow">
      <p className="kicker">{labelRank(rank.id)}</p>
      <h1>{session.nombre}</h1>
      <p>{minutes} min</p>
      <p>Series de trabajo: {session.exercises.reduce((sum, exercise) => sum + exercise.series.filter((set) => set.kind === 'trabajo' && set.completed).length, 0)}</p>
      <p>Volumen: {formatWeightKg(volume.kg, profile.unit)}{volume.bodyReps ? ` · ${formatInt(volume.bodyReps)} reps con el cuerpo` : ''}</p>
      <p className="num">{formatInt(session.xpAwarded)} XP</p>
      {session.xpParts ? <p>{breakdownLine(session.xpParts)}</p> : null}
      {session.recordNames.length > 0 ? <p>Récords: {session.recordNames.join(', ')}</p> : null}
      <div className="bar" aria-hidden="true"><span style={{ width: `${next === null ? 100 : Math.min(100, ((profile.xpTotal - floor) / span) * 100)}%` }} /></div>
      <p>{formatInt(profile.xpTotal)} XP{level === 100 ? ', nivel 100' : ''}</p>
      <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>Listo</button>
    </main>
  );
}
