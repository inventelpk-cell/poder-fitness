import { kgToDisplayLb, lbToKg, parseDecimal } from '../domain/units'
import type { Unit } from '../domain/types'

export function kgToField(kg: number | null, unit: Unit): string {
  if (kg == null) return ''
  const shown = unit === 'lb' ? kgToDisplayLb(kg) : Math.round(kg * 1000) / 1000
  const text = Number.isInteger(shown) ? String(shown) : String(shown)
  return text.replace('.', ',')
}

export function fieldToKg(raw: string, unit: Unit): number | null {
  const value = parseDecimal(raw)
  if (value == null) return null
  return unit === 'lb' ? lbToKg(value) : value
}

export function weightStep(unit: Unit, heavy: boolean): number {
  if (unit === 'lb') return heavy ? 5 : 2.5
  return 0.5
}
