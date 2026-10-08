export interface SessionXpInput {
  seriesDeTrabajoCompletadas: number;
  hayRecordEnLaSesion: boolean;
  planDayId: string | null;
  camaraGravedad: boolean;
}

export interface SessionXpParts {
  base: number;
  series: number;
  sobrecarga: number;
  plan: number;
  camara: number;
  total: number;
}

export function xpDeSesion(input: SessionXpInput): SessionXpParts {
  const base = 40;
  const series = input.seriesDeTrabajoCompletadas * 6;
  const sobrecarga = input.hayRecordEnLaSesion ? 15 : 0;
  const plan = input.planDayId ? 10 : 0;
  const parcial = base + series + sobrecarga + plan;
  const camara = input.camaraGravedad ? Math.round(parcial * 0.2) : 0;
  const tope = input.camaraGravedad ? 300 : 250;
  return {
    base,
    series,
    sobrecarga,
    plan,
    camara,
    total: Math.min(tope, parcial + camara),
  };
}

export function breakdownLine(parts: SessionXpParts): string {
  const chunks = [`${parts.base} de base`, `${parts.series} de series`];
  if (parts.sobrecarga) chunks.push(`${parts.sobrecarga} por récord`);
  if (parts.plan) chunks.push(`${parts.plan} por seguir el plan`);
  if (parts.camara) chunks.push(`${parts.camara} de la cámara`);
  return chunks.join(', ');
}
