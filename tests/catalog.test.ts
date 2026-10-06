import { describe, expect, it } from 'vitest';
import { bundledExercises, filterExercises, isReserveId } from '../src/catalog';

const imageFiles = import.meta.glob('../data/exercises/images/*', { eager: true, query: '?raw', import: 'default' });

describe('catálogo', () => {
  const list = bundledExercises();

  it('buscar flexion devuelve la flexión de pecho', () => {
    const found = filterExercises(list, { query: 'flexion', musculos: [], equipos: [], patrones: [], niveles: [] });
    expect(found.some((item) => item.id === 'flexion-pecho')).toBe(true);
  });

  it('un filtro imposible deja el catálogo vacío', () => {
    const found = filterExercises(list, {
      query: '',
      musculos: ['gemelos'],
      equipos: ['paralelas'],
      patrones: [],
      niveles: [],
    });
    expect(found).toEqual([]);
  });

  it('limpiar filtros devuelve el catálogo visible', () => {
    const found = filterExercises(list, { query: '', musculos: [], equipos: [], patrones: [], niveles: [] });
    expect(found).toHaveLength(list.length);
    expect(found.map((item) => item.nombre).join('|')).toBe(
      [...found].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })).map((item) => item.nombre).join('|'),
    );
  });

  it('los 290 de everkinetic quedan mapeados sin tocar fotos ni pasos', () => {
    const illustrated = list.filter((item) => item.origen === 'everkinetic');
    expect(illustrated).toHaveLength(290);
    expect(illustrated.every((item) => item.patron !== null && item.musculo !== null && item.nivel !== null)).toBe(true);
    const withoutArt = illustrated.filter((item) => (item.imagenes?.length ?? 0) === 0).map((item) => item.id).sort();
    expect(withoutArt).toEqual([
      'bent-over-row-with-barbell',
      'incline-inner-biceps-curl-with-dumbbell',
      'standing-calf-raise-with-dumbbell',
    ]);
    const known = new Map(
      Object.entries(imageFiles).map(([key, raw]) => [key.slice(key.lastIndexOf('/') + 1), String(raw).length]),
    );
    for (const item of illustrated) {
      for (const path of item.imagenes ?? []) {
        const name = path.slice(path.lastIndexOf('/') + 1);
        const size = known.get(name);
        expect(size, path).toBeGreaterThan(200);
      }
    }
    const push = illustrated.find((item) => item.id === 'push-ups');
    expect(push?.pasos.length).toBeGreaterThan(2);
    expect(push?.imagenes?.length).toBeGreaterThan(0);
  });

  it('las reservas no se pueden tratar como borrables', () => {
    expect(isReserveId('flexion-pecho')).toBe(true);
    expect(isReserveId('peso-muerto')).toBe(false);
  });
});
