import type { Unit } from './units';
import { fromDisplay, roundToIncrement, toDisplay } from './units';

export interface HistorySet {
  pesoKg: number;
  reps: number | null;
  segundos: number | null;
  completed: boolean;
  kind: 'calentamiento' | 'trabajo';
}

export interface HistorySession {
  sets: HistorySet[];
}

export type LoadDirection = 'sube' | 'baja' | 'igual' | 'vacio';

export interface LoadProposal {
  pesoKg: number | null;
  direction: LoadDirection;
  anteriorKg: number | null;
}

export function jumpAmount(compuesto: boolean, unit: Unit, increment: number): number {
  const base = unit === 'lb' ? (compuesto ? 5 : 2.5) : compuesto ? 2.5 : 1;
  return Math.max(base, increment);
}

function workSets(session: HistorySession): HistorySet[] {
  return session.sets.filter((set) => set.kind === 'trabajo' && set.completed);
}

function metric(set: HistorySet, medida: 'reps' | 'segundos'): number {
  return medida === 'segundos' ? (set.segundos ?? 0) : (set.reps ?? 0);
}

function sameWeight(sets: HistorySet[]): number | null {
  const first = sets[0];
  if (!first) return null;
  const weight = Math.round(first.pesoKg * 1000) / 1000;
  const all = sets.every((set) => Math.round(set.pesoKg * 1000) / 1000 === weight);
  return all ? weight : null;
}

export function proposeLoad(input: {
  history: HistorySession[];
  repMin: number;
  repMax: number;
  compuesto: boolean;
  unit: Unit;
  increment: number;
  medida: 'reps' | 'segundos';
  weekInArc: 1 | 2 | 3 | 4;
  allowUp: boolean;
}): LoadProposal {
  const recent = input.history
    .map((session) => ({ sets: workSets(session) }))
    .filter((session) => session.sets.length > 0)
    .slice(0, 2);
  const latest = recent[0]?.sets ?? [];
  const anterior = latest.length ? latest[latest.length - 1]!.pesoKg : null;
  if (anterior === null) return { pesoKg: null, direction: 'vacio', anteriorKg: null };
  const anteriorKg = Math.round(anterior * 1000) / 1000;
  if (anteriorKg <= 0) return { pesoKg: 0, direction: 'igual', anteriorKg: 0 };

  if (input.weekInArc === 4) {
    const display = toDisplay(anteriorKg, input.unit) * 0.85;
    let rounded = roundToIncrement(display, input.increment);
    if (rounded > toDisplay(anteriorKg, input.unit)) rounded = toDisplay(anteriorKg, input.unit);
    const kg = fromDisplay(rounded, input.unit);
    const capped = kg > anteriorKg ? anteriorKg : kg;
    return { pesoKg: Math.max(0, capped), direction: 'igual', anteriorKg };
  }

  let direction: LoadDirection = 'igual';
  if (recent.length >= 2) {
    const older = recent[1]!.sets;
    const combined = [...latest, ...older];
    const shared = sameWeight(combined);
    const allMax =
      shared !== null &&
      latest.every((set) => metric(set, input.medida) >= input.repMax) &&
      older.every((set) => metric(set, input.medida) >= input.repMax);
    const bothUnder =
      shared !== null &&
      latest.some((set) => metric(set, input.medida) < input.repMin) &&
      older.some((set) => metric(set, input.medida) < input.repMin);
    if (allMax && bothUnder) direction = 'igual';
    else if (allMax) direction = 'sube';
    else if (bothUnder) direction = 'baja';
  }
  if (direction === 'sube' && !input.allowUp) direction = 'igual';
  if (direction === 'igual') return { pesoKg: anteriorKg, direction, anteriorKg };

  const jump = jumpAmount(input.compuesto, input.unit, input.increment);
  const display = toDisplay(anteriorKg, input.unit);
  const next = direction === 'sube' ? display + jump : Math.max(0, display - jump);
  const rounded = roundToIncrement(next, input.increment);
  return { pesoKg: fromDisplay(Math.max(0, rounded), input.unit), direction, anteriorKg };
}

export function warmupWeights(workKg: number, unit: Unit, increment: number): number[] {
  if (workKg <= 0) return [];
  const display = toDisplay(workKg, unit);
  const targets = [0.5, 0.75];
  const reps = [8, 5];
  const weights: number[] = [];
  targets.forEach((ratio, index) => {
    const rounded = roundToIncrement(display * ratio, increment);
    if (rounded <= 0 || rounded >= display - 1e-9) return;
    const kg = fromDisplay(rounded, unit);
    if (kg > 0 && kg < workKg && !weights.includes(kg)) weights.push(kg);
    void reps[index];
  });
  return weights;
}
