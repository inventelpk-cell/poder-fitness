import { describe, expect, it } from 'vitest';
import { bundledExercises, filterExercises, isReserveId } from '../src/catalog';

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
    expect(illustrated.filter((item) => (item.imagenes?.length ?? 0) === 0)).toHaveLength(3);
    const push = illustrated.find((item) => item.id === 'push-ups');
    expect(push?.pasos.length).toBeGreaterThan(2);
    expect(push?.imagenes?.length).toBeGreaterThan(0);
  });

  it('las reservas no se pueden tratar como borrables', () => {
    expect(isReserveId('flexion-pecho')).toBe(true);
    expect(isReserveId('peso-muerto')).toBe(false);
  });
});
