export function epley(peso: number, reps: number): number {
  return peso * (1 + reps / 30);
}

export function brzycki(peso: number, reps: number): number {
  return (peso * 36) / (37 - reps);
}

export function oneRmEstimado(peso: number, reps: number): number | null {
  if (peso <= 0 || reps < 1) return null;
  if (reps === 1) return peso;
  if (reps > 10) return null;
  return Math.min(epley(peso, reps), brzycki(peso, reps));
}

export function formatOneRm(value: number): string {
  return (Math.round(value * 10) / 10).toFixed(1).replace('.', ',');
}
