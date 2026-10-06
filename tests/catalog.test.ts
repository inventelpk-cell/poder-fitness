import { describe, expect, it } from 'vitest';
import { bundledExercises, filterExercises, isReserveId } from '../src/catalog';

describe('catálogo', () => {
  const list = bundledExercises();

  it('buscar flexion devuelve la flexión de pecho', () => {
    const found = filterExercises(list, { query: 'flexion', musculos: [], equipos: [], patrones: [], niveles: [] });
    expect(found.some((item) => item.id === 'flexion-pecho')).toBe(true);
  });

  it('abdomen y barra no tienen resultados', () => {
    const found = filterExercises(list, {
      query: '',
      musculos: ['abdomen'],
      equipos: ['barra'],
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

  it('carga everkinetic sin inventar nivel ni patrón', () => {
    const illustrated = list.filter((item) => item.origen === 'everkinetic');
    expect(illustrated).toHaveLength(290);
    expect(illustrated.every((item) => item.nivel === null && item.patron === null)).toBe(true);
    expect(illustrated.filter((item) => (item.imagenes?.length ?? 0) === 0)).toHaveLength(3);
  });

  it('las reservas no se pueden tratar como borrables', () => {
    expect(isReserveId('flexion-pecho')).toBe(true);
    expect(isReserveId('peso-muerto')).toBe(false);
  });
});
