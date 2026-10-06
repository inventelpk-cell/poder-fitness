import { mapEverkinetic } from './map-everkinetic';
import type { Exercise, Mechanic } from './types';
import raw from '../../data/exercises/exercises.es.json';

interface EverkineticRow {
  id: string;
  sourceId: string;
  name: string;
  nameEn: string;
  summary: string;
  instructions: string[];
  tips: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
  mechanic: Mechanic;
  level: null;
  force: null;
  images: string[];
}

export function everkineticExercises(reservedIds: ReadonlySet<string>): Exercise[] {
  const rows = raw as EverkineticRow[];
  return rows
    .filter((row) => !reservedIds.has(row.id))
    .map((row) => {
      const pasos = row.instructions.map((step) => step.trim()).filter(Boolean);
      const resumen = row.summary.trim();
      const mapped = mapEverkinetic({
        id: row.id,
        name: row.name,
        nameEn: row.nameEn,
        primaryMuscles: row.primaryMuscles,
        equipment: row.equipment,
        mechanic: row.mechanic,
      });
      return {
        id: row.id,
        nombre: row.name,
        alias: [row.nameEn, row.sourceId].filter(Boolean),
        patron: mapped.patron,
        musculo: mapped.musculo,
        equipo: mapped.equipo,
        nivel: mapped.nivel,
        prioridad: mapped.prioridad,
        compuesto: mapped.compuesto,
        pasos: pasos.length > 0 ? pasos : resumen ? [resumen] : [],
        origen: 'everkinetic' as const,
        archivado: false,
        medida: 'reps' as const,
        cuentaEnVolumen: mapped.patron !== 'movilidad',
        imagenes: row.images,
        mecanica: row.mechanic,
        resumen,
        consejos: row.tips.map((tip) => tip.trim()).filter(Boolean),
        equipoTexto: [...row.equipment],
        musculosTexto: [...row.primaryMuscles, ...row.secondaryMuscles],
        entraEnPlan: mapped.entraEnPlan,
      };
    });
}

export function imageCaption(path: string, index: number): string {
  if (path.includes('relaxation')) return 'Posición inicial';
  if (path.includes('tension')) return 'Contracción';
  return `Ilustración ${index + 1}`;
}

export function imageSrc(path: string): string {
  return `/ejercicios/${path}`;
}

export function exerciseThumb(images: readonly string[] | undefined): string | null {
  if (!images || images.length === 0) return null;
  const tension = images.find((path) => path.includes('tension'));
  return tension ?? images[0] ?? null;
}
