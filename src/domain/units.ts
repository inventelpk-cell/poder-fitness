export const LB_IN_KG = 0.45359237;

export type Unit = 'kg' | 'lb';

export function roundKg(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function kgToLb(kg: number): number {
  return kg / LB_IN_KG;
}

export function lbToKg(lb: number): number {
  return roundKg(lb * LB_IN_KG);
}

export function toDisplay(kg: number, unit: Unit): number {
  return unit === 'lb' ? kgToLb(kg) : kg;
}

export function fromDisplay(value: number, unit: Unit): number {
  return unit === 'lb' ? lbToKg(value) : roundKg(value);
}

export function roundToIncrement(value: number, increment: number): number {
  if (increment <= 0) return value;
  const steps = value / increment;
  const lower = Math.floor(steps + 1e-9);
  const upper = Math.ceil(steps - 1e-9);
  const low = lower * increment;
  const high = upper * increment;
  const dLow = Math.abs(value - low);
  const dHigh = Math.abs(high - value);
  const chosen = dHigh < dLow - 1e-9 ? high : low;
  return Math.round(chosen * 1000) / 1000;
}

export function roundWeightKg(kg: number, unit: Unit, increment: number): number {
  const display = toDisplay(kg, unit);
  const rounded = roundToIncrement(display, increment);
  return fromDisplay(rounded, unit);
}

export const KG_INCREMENTS = [0.5, 1, 2.5] as const;
export const LB_INCREMENTS = [1, 2.5, 5] as const;

export function defaultIncrement(unit: Unit): number {
  return unit === 'lb' ? 5 : 2.5;
}

export function mapIncrement(increment: number, from: Unit, to: Unit): number {
  if (from === to) return increment;
  if (from === 'kg' && to === 'lb') {
    if (increment <= 0.5) return 1;
    if (increment <= 1) return 2.5;
    return 5;
  }
  if (increment <= 1) return 0.5;
  if (increment <= 2.5) return 1;
  return 2.5;
}
