import { describe, expect, it } from 'vitest';
import { bundledExercises, filterExercises, isReserveId } from '../src/catalog';
import { exerciseTileMedia } from '../src/catalog/media';

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

  it('los 40 primeros muestran gif o imagen verificada', () => {
    const first = filterExercises(list, { query: '', musculos: [], equipos: [], patrones: [], niveles: [] }).slice(0, 40);
    const srcs = first.map((item) => exerciseTileMedia(item));
    srcs.forEach((src, index) => {
      const item = first[index];
      if (!item) return;
      if (item.origen === 'semilla') {
        expect(src).toBeNull();
        return;
      }
      if (item.origen === 'gym-visual') {
        expect(src).not.toBeNull();
        expect(src?.includes('/gym-visual/')).toBe(true);
        return;
      }
      if (!src) return;
      expect(src.startsWith('/ejercicios/') || src.includes('/gym-visual/')).toBe(true);
    });
    const shown = srcs.filter((src): src is string => src !== null);
    expect(new Set(shown).size).toBe(shown.length);
  });

  it('el catálogo gym visual queda mapeado con gif e instrucciones en español', () => {
    const catalog = list.filter((item) => item.origen === 'gym-visual');
    expect(catalog.length).toBeGreaterThan(1300);
    expect(catalog.every((item) => item.patron !== null && item.musculo !== null && item.nivel !== null)).toBe(true);
    expect(catalog.every((item) => item.gif && item.pasos.length > 0)).toBe(true);
    const bench = catalog.find((item) => item.id === 'gv-0025');
    expect(bench?.nombre).toMatch(/press de banca/i);
    expect(bench?.pasos[0]).toMatch(/Túmbate|Coloca|Agarra/i);
    expect(exerciseTileMedia(bench!)?.endsWith('.gif')).toBe(true);
  });

  it('las reservas no se pueden tratar como borrables', () => {
    expect(isReserveId('flexion-pecho')).toBe(true);
    expect(isReserveId('peso-muerto')).toBe(false);
  });
});
