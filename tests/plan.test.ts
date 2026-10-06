import { describe, expect, it } from 'vitest';
import { bundledExercises } from '../src/catalog';
import { daySequence, generateWeek } from '../src/domain/plan';
import type { GenerateInput } from '../src/domain/plan';

const exercises = bundledExercises();

function input(partial: Partial<GenerateInput> & Pick<GenerateInput, 'level' | 'goal' | 'equipment' | 'weekdays'>): GenerateInput {
  return {
    weekInArc: 1,
    variantBase: 0,
    weekStart: '2026-10-05',
    exercises,
    ...partial,
  };
}

describe('generador de planes', () => {
  it('principiante, hipertrofia, peso corporal, 3 días, arco 1 semana 1', () => {
    const days = generateWeek(
      input({
        level: 'principiante',
        goal: 'hipertrofia',
        equipment: ['peso-corporal'],
        weekdays: [1, 3, 5],
      }),
    );
    expect(days.map((day) => day.kind)).toEqual(['cuerpo', 'cuerpo', 'cuerpo']);
    expect(days.map((day) => day.variant)).toEqual([0, 1, 2]);
    expect(days[0]?.items.map((item) => item.slot)).toEqual(['rodilla', 'empuje-horizontal', 'traccion-horizontal', 'cadera', 'core']);
    for (const day of days) {
      const ids = day.items.map((item) => item.exerciseId);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) {
        const exercise = exercises.find((item) => item.id === id);
        expect(exercise?.nivel).toBe('principiante');
        expect(exercise?.equipo.every((piece) => piece === 'peso-corporal')).toBe(true);
        const samePattern = exercises.filter(
          (item) =>
            item.origen === 'everkinetic' &&
            item.entraEnPlan !== false &&
            item.patron === exercise?.patron &&
            item.nivel === 'principiante' &&
            item.equipo.every((piece) => piece === 'peso-corporal'),
        );
        if (samePattern.length > 0) expect(exercise?.origen).toBe('everkinetic');
      }
    }
    const again = generateWeek(
      input({
        level: 'principiante',
        goal: 'hipertrofia',
        equipment: ['peso-corporal'],
        weekdays: [1, 3, 5],
      }),
    );
    expect(again).toEqual(days);
  });

  it('no repite músculo seguido si hay alternativa', () => {
    const days = generateWeek(
      input({
        level: 'intermedio',
        goal: 'hipertrofia',
        equipment: ['mancuernas', 'barra', 'banco'],
        weekdays: [1, 3, 5],
      }),
    );
    expect(daySequence(3, 'intermedio', 'hipertrofia')).toEqual(['empuje', 'traccion', 'pierna']);
    for (const day of days) {
      for (let i = 1; i < day.items.length; i += 1) {
        const prev = exercises.find((item) => item.id === day.items[i - 1]?.exerciseId);
        const curr = exercises.find((item) => item.id === day.items[i]?.exerciseId);
        const same = prev?.musculo === curr?.musculo;
        if (!same) continue;
        const alternatives = exercises.filter(
          (item) =>
            item.origen !== 'semilla' &&
            item.entraEnPlan !== false &&
            item.patron === curr?.patron &&
            item.nivel !== 'avanzado' &&
            item.nivel !== null &&
            item.equipo.every((piece) => piece === 'peso-corporal' || ['mancuernas', 'barra', 'banco'].includes(piece)) &&
            item.id !== curr?.id,
        );
        expect(alternatives.some((item) => item.musculo !== prev?.musculo)).toBe(false);
      }
    }
  });

  it('intermedio, fuerza, barra banco y mancuernas, 4 días', () => {
    const days = generateWeek(
      input({
        level: 'intermedio',
        goal: 'fuerza',
        equipment: ['barra', 'banco', 'mancuernas'],
        weekdays: [1, 2, 4, 5],
      }),
    );
    expect(days.map((day) => day.kind)).toEqual(['torso', 'pierna', 'torso', 'pierna']);
    expect(days[0]?.variant).toBe(0);
    expect(days[2]?.variant).toBe(1);
    const firstTorso = days[0]?.items.map((item) => item.exerciseId) ?? [];
    const secondTorso = days[2]?.items.map((item) => item.exerciseId) ?? [];
    expect(firstTorso[0]).not.toBe(secondTorso[0]);
    const knees = days.filter((day) => day.kind === 'pierna').map((day) => day.items.find((item) => item.slot === 'rodilla')?.exerciseId);
    expect(knees[0]).toBeTruthy();
    expect(knees[0]).not.toBe(knees[1]);
  });

  it('avanzado con solo peso corporal no recibe peso muerto ni dominadas', () => {
    const days = generateWeek(
      input({
        level: 'avanzado',
        goal: 'fuerza',
        equipment: ['peso-corporal'],
        weekdays: [1, 2, 3, 4, 5, 6],
      }),
    );
    const ids = days.flatMap((day) => day.items.map((item) => item.exerciseId));
    expect(ids).not.toContain('peso-muerto');
    expect(ids).not.toContain('dominadas');
  });

  it('semana templo baja las series y el gato-camello se queda en 1x8', () => {
    const days = generateWeek(
      input({
        level: 'intermedio',
        goal: 'resistencia',
        equipment: ['peso-corporal'],
        weekdays: [1, 3, 5],
        weekInArc: 4,
      }),
    );
    const pulse = days.find((day) => day.kind === 'pulso');
    const mobility = pulse?.items.find((item) => item.slot === 'movilidad');
    expect(mobility).toMatchObject({ series: 1, repMin: 8, repMax: 8, descansoSegundos: 30 });
    const squat = days[0]?.items.find((item) => item.slot === 'rodilla');
    expect(squat?.series).toBe(2);
    expect(squat?.repObjetivo).toBe(squat?.repMin);
  });

  it('la plancha se prescribe en segundos', () => {
    const plank = exercises.find((item) => item.id === 'plancha');
    expect(plank).toBeTruthy();
    const days = generateWeek(
      input({
        level: 'principiante',
        goal: 'hipertrofia',
        equipment: ['peso-corporal'],
        weekdays: [1],
        exercises: exercises.filter((item) => item.origen === 'semilla' || item.id === 'plancha'),
      }),
    );
    const chosen = days[0]?.items.find((item) => item.exerciseId === 'plancha');
    expect(chosen).toMatchObject({ medida: 'segundos', repMin: 20, repMax: 40, descansoSegundos: 90, repObjetivo: 20 });
  });

  it('un clavo de hueco se conserva', () => {
    const days = generateWeek(
      input({
        level: 'principiante',
        goal: 'hipertrofia',
        equipment: ['peso-corporal'],
        weekdays: [1, 3, 5],
        pins: [{ weekday: 1, slot: 'core', exerciseId: 'bicho-muerto' }],
      }),
    );
    expect(days[0]?.items.find((item) => item.slot === 'core')?.exerciseId).toBe('bicho-muerto');
    expect(days[0]?.items.find((item) => item.slot === 'core')?.pinned).toBe(true);
  });
});
