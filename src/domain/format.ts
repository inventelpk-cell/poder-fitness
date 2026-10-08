import type { Unit } from './units';
import { toDisplay } from './units';

const intFmt = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 });

export function formatInt(value: number): string {
  return intFmt.format(Math.round(value));
}

export function formatDecimal(value: number, digits = 1): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatWeightKg(kg: number, unit: Unit): string {
  const shown = toDisplay(kg, unit);
  const rounded = Math.round(shown * 10) / 10;
  const text = formatDecimal(rounded, 1);
  return `${text} ${unit}`;
}

export function formatSignedWeight(kg: number, unit: Unit): string {
  return formatWeightKg(kg, unit);
}
