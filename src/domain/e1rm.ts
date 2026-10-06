export function e1rm(weightKg: number, reps: number): number | null {
  if (!(reps >= 1 && reps <= 10) || !(weightKg > 0)) return null
  return weightKg * (1 + reps / 30)
}

export function e1rmRounded(weightKg: number, reps: number): number | null {
  const value = e1rm(weightKg, reps)
  if (value == null) return null
  return Math.round(value * 10) / 10
}
