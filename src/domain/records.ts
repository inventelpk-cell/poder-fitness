export interface RecordSet {
  pesoKg: number | null;
  reps: number | null;
  segundos: number | null;
  completed: boolean;
  kind: 'calentamiento' | 'trabajo';
}

export function isPersonalRecord(set: RecordSet, prior: readonly RecordSet[], medida: 'reps' | 'segundos'): boolean {
  if (!set.completed || set.kind !== 'trabajo') return false;
  const priorWork = prior.filter((item) => item.completed && item.kind === 'trabajo');
  const weight = set.pesoKg ?? 0;
  if (weight > 0) {
    const reps = set.reps ?? 0;
    if (reps < 1) return false;
    const weighted = priorWork.filter((item) => (item.pesoKg ?? 0) > 0);
    if (weighted.length === 0) return false;
    const maxWeight = Math.max(...weighted.map((item) => item.pesoKg ?? 0));
    if (weight > maxWeight) return true;
    const same = weighted.filter((item) => Math.round((item.pesoKg ?? 0) * 1000) === Math.round(weight * 1000));
    const maxReps = same.reduce((best, item) => Math.max(best, item.reps ?? 0), 0);
    return same.length > 0 && reps > maxReps;
  }
  const body = priorWork.filter((item) => (item.pesoKg ?? 0) <= 0);
  if (body.length === 0) return false;
  if (medida === 'segundos') {
    const secs = set.segundos ?? 0;
    const best = body.reduce((max, item) => Math.max(max, item.segundos ?? 0), 0);
    return secs > best;
  }
  const reps = set.reps ?? 0;
  const best = body.reduce((max, item) => Math.max(max, item.reps ?? 0), 0);
  return reps > best;
}
