/**
 * Catálogo offline: `data/exercises/exercises.es.json`.
 * Músculos, equipo, categoría y mecánica usan los id de `glossary.es.json`.
 * Las rutas de `images` son relativas a `data/exercises/`.
 */

export const MUSCLE_IDS = [
  "abdomen bajo",
  "abdominales",
  "abductores de cadera",
  "antebrazos",
  "brazos",
  "bíceps",
  "core",
  "cuello",
  "cuádriceps",
  "deltoides lateral",
  "deltoides posterior",
  "dorsales",
  "espalda",
  "espalda alta",
  "espalda media",
  "extensores del cuello",
  "flexores del cuello",
  "flexores laterales del cuello",
  "gemelos",
  "glúteos",
  "hombros",
  "isquiotibiales",
  "lumbar",
  "oblícuos",
  "pecho",
  "trapecio",
  "tríceps",
] as const;

export const EQUIPMENT_IDS = [
  "agarre en V",
  "balón medicinal",
  "banco de hiperextensiones",
  "banco declinado",
  "banco inclinado",
  "banco plano",
  "banda elástica",
  "barra",
  "barras paralelas",
  "bosu",
  "contractora",
  "disco",
  "fitball",
  "mancuernas",
  "multipower",
  "máquina",
  "máquina de pecho",
  "máquina de press",
  "peso corporal",
  "polea",
  "remo en T",
  "tabla de equilibrio",
] as const;

export const CATEGORY_IDS = ["fuerza"] as const;

export const MECHANIC_IDS = [
  "compuesto",
  "aislamiento",
  "isométrico",
  "mixto",
] as const;

export type MuscleId = (typeof MUSCLE_IDS)[number];
export type EquipmentId = (typeof EQUIPMENT_IDS)[number];
export type CategoryId = (typeof CATEGORY_IDS)[number];
export type MechanicId = (typeof MECHANIC_IDS)[number];

export interface Exercise {
  id: string;
  sourceId: string;
  name: string;
  nameEn: string;
  summary: string;
  instructions: string[];
  tips: string[];
  primaryMuscles: MuscleId[];
  secondaryMuscles: MuscleId[];
  equipment: EquipmentId[];
  category: CategoryId;
  mechanic: MechanicId;
  level: null;
  force: null;
  images: string[];
}

export type ExerciseCatalog = Exercise[];
