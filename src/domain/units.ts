export const LB_PER_KG = 2.2046226218

export function kgToLb(kg: number): number {
  return kg * LB_PER_KG
}

export function lbToKg(lb: number): number {
  return lb / LB_PER_KG
}

/** Libras visibles a un decimal. El kg guardado no se reescribe. */
export function kgToDisplayLb(kg: number): number {
  return Math.round(kgToLb(kg) * 10) / 10
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10
}

export function tidy(value: number): number {
  return Math.round(value * 1000) / 1000
}

export function roundToIncrement(value: number, increment: number): number {
  const steps = Math.round(value / increment)
  return tidy(steps * increment)
}

export function formatEs(value: number, digits: number): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

export function formatWeight(kg: number, unit: 'kg' | 'lb'): string {
  if (unit === 'lb') return `${formatEs(kgToDisplayLb(kg), 1)} lb`
  const digits = Math.abs(kg * 100 - Math.round(kg * 100)) < 0.001 && Math.abs(kg * 10 - Math.round(kg * 10)) > 0.05 ? 2 : Math.abs(kg - Math.round(kg)) < 0.001 ? 0 : 1
  return `${formatEs(kg, digits)} kg`
}

export function parseDecimal(raw: string): number | null {
  const text = raw.trim().replace(',', '.')
  if (text === '' || text === '-' || text === '.' || text === '-.') return null
  const value = Number(text)
  return Number.isFinite(value) ? value : null
}
