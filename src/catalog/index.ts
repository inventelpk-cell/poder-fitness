import { gymVisualExercises } from './gym-visual';
import { SEED_EXERCISES } from './seed';
import {
  isReserveId,
  type Equipment,
  type Exercise,
  type Level,
  type Muscle,
  type Pattern,
} from './types';

export { SEED_EXERCISES, isReserveId };
export type { Equipment, Exercise, Level, Muscle, Pattern };
export * from './types';

export interface CatalogFilters {
  query: string;
  musculos: Muscle[];
  equipos: Equipment[];
  patrones: Pattern[];
  niveles: Level[];
}

export function emptyFilters(): CatalogFilters {
  return { query: '', musculos: [], equipos: [], patrones: [], niveles: [] };
}

export function bundledExercises(): Exercise[] {
  const seed = SEED_EXERCISES.map((exercise) => ({
    ...exercise,
    alias: [...exercise.alias],
    equipo: [...exercise.equipo],
    pasos: [...exercise.pasos],
  }));
  return [...seed, ...gymVisualExercises()];
}

export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

export function filterExercises(list: readonly Exercise[], filters: CatalogFilters): Exercise[] {
  const query = normalizeSearch(filters.query);
  return list
    .filter((exercise) => !exercise.archivado)
    .filter((exercise) => {
      if (!query) return true;
      const fields = [exercise.nombre, ...exercise.alias];
      return fields.some((field) => normalizeSearch(field).includes(query));
    })
    .filter((exercise) => filters.musculos.length === 0 || (exercise.musculo !== null && filters.musculos.includes(exercise.musculo)))
    .filter((exercise) => filters.equipos.length === 0 || exercise.equipo.some((item) => filters.equipos.includes(item)))
    .filter((exercise) => filters.patrones.length === 0 || (exercise.patron !== null && filters.patrones.includes(exercise.patron)))
    .filter((exercise) => filters.niveles.length === 0 || exercise.nivel === null || filters.niveles.includes(exercise.nivel))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
}

export function levelAllows(user: Level, exercise: Level): boolean {
  const rank = { principiante: 0, intermedio: 1, avanzado: 2 } as const;
  return rank[exercise] <= rank[user];
}

export function equipmentCovers(user: readonly Equipment[], needed: readonly Equipment[]): boolean {
  const owned = new Set<Equipment>(user);
  owned.add('peso-corporal');
  return needed.every((item) => item === 'peso-corporal' || owned.has(item));
}

export function nameKey(value: string): string {
  return normalizeSearch(value);
}
