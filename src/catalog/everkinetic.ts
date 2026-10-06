import type { Equipment, Exercise, Mechanic } from './types';
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

const EQUIPMENT_MAP: Record<string, Equipment> = {
  'peso corporal': 'peso-corporal',
  mancuernas: 'mancuernas',
  barra: 'barra',
  'banco plano': 'banco',
  'banco inclinado': 'banco',
  'banco declinado': 'banco',
  polea: 'polea',
  máquina: 'maquina',
  'máquina de pecho': 'maquina',
  'máquina de press': 'maquina',
  multipower: 'maquina',
  contractora: 'maquina',
  'banda elástica': 'banda',
  'barras paralelas': 'paralelas',
};

function mapEquipment(labels: readonly string[]): Equipment[] {
  const found = new Set<Equipment>();
  for (const label of labels) {
    const mapped = EQUIPMENT_MAP[label];
    if (mapped) found.add(mapped);
  }
  return [...found];
}

export function everkineticExercises(reservedIds: ReadonlySet<string>): Exercise[] {
  const rows = raw as EverkineticRow[];
  return rows
    .filter((row) => !reservedIds.has(row.id))
    .map((row) => {
      const pasos = row.instructions.map((step) => step.trim()).filter(Boolean);
      const resumen = row.summary.trim();
      return {
        id: row.id,
        nombre: row.name,
        alias: [row.nameEn, row.sourceId].filter(Boolean),
        patron: null,
        musculo: null,
        equipo: mapEquipment(row.equipment),
        nivel: null,
        prioridad: 80,
        compuesto: row.mechanic === 'compuesto' || row.mechanic === 'mixto',
        pasos: pasos.length > 0 ? pasos : resumen ? [resumen] : [],
        origen: 'everkinetic' as const,
        archivado: false,
        medida: 'reps' as const,
        cuentaEnVolumen: true,
        imagenes: row.images,
        mecanica: row.mechanic,
        resumen,
        consejos: row.tips.map((tip) => tip.trim()).filter(Boolean),
        equipoTexto: [...row.equipment],
        musculosTexto: [...row.primaryMuscles, ...row.secondaryMuscles],
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
