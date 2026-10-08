import { describe, expect, it } from 'vitest';
import { everkineticExercises } from '../src/catalog/everkinetic';
import { mapEverkinetic } from '../src/catalog/map-everkinetic';
import type { Equipment, Level, Pattern } from '../src/catalog/types';
import raw from '../data/exercises/exercises.es.json';

interface Row {
  id: string;
  name: string;
  nameEn: string;
  primaryMuscles: string[];
  equipment: string[];
  mechanic: 'compuesto' | 'aislamiento' | 'isométrico' | 'mixto';
  instructions: string[];
  images: string[];
}

const rows = raw as Row[];

function mapped(id: string) {
  const row = rows.find((item) => item.id === id);
  if (!row) throw new Error(id);
  return mapEverkinetic(row);
}

describe('mapeo everkinetic', () => {
  it('cubre los 290 con patrón, músculo y nivel', () => {
    expect(rows).toHaveLength(290);
    for (const row of rows) {
      const result = mapEverkinetic(row);
      expect(result.patron, row.id).toBeTruthy();
      expect(result.musculo, row.id).toBeTruthy();
      expect(result.nivel, row.id).toBeTruthy();
      expect(result.equipo.length > 0 || result.entraEnPlan === false, row.id).toBe(true);
    }
  });

  it('no reescribe instrucciones ni fotos', () => {
    const list = everkineticExercises(new Set());
    expect(list).toHaveLength(290);
    for (const exercise of list) {
      const row = rows.find((item) => item.id === exercise.id);
      expect(exercise.pasos).toEqual(row?.instructions.map((step) => step.trim()).filter(Boolean));
      expect(exercise.imagenes).toEqual(row?.images);
    }
  });

  it.each([
    ['push-ups', 'empuje-horizontal', ['peso-corporal'], 'principiante', true],
    ['bench-press', 'empuje-horizontal', ['barra', 'banco'], 'intermedio', true],
    ['barbell-squat', 'rodilla', ['barra'], 'intermedio', true],
    ['squats-using-dumbbells', 'rodilla', ['mancuernas'], 'principiante', true],
    ['barbell-dead-lifts', 'cadera', ['barra'], 'avanzado', true],
    ['chin-ups', 'traccion-vertical', ['peso-corporal', 'barra-dominadas'], 'intermedio', true],
    ['wide-grip-lat-pull-down', 'traccion-vertical', ['polea'], 'principiante', true],
    ['body-row', 'traccion-horizontal', ['peso-corporal'], 'principiante', true],
    ['bridging', 'cadera', ['peso-corporal'], 'principiante', true],
    ['crunches', 'core', ['peso-corporal'], 'principiante', true],
    ['biceps-curl-with-dumbbell', 'biceps', ['mancuernas'], 'principiante', true],
    ['standing-calf-raise-with-dumbbell', 'gemelo', ['mancuernas'], 'principiante', true],
    ['seated-leg-curl', 'femoral', ['maquina'], 'principiante', true],
    ['dumbbell-lunges', 'rodilla-unilateral', ['mancuernas'], 'principiante', true],
    ['ankle-circles', 'movilidad', ['peso-corporal'], 'principiante', true],
    ['dumbbell-shoulder-press', 'empuje-vertical', ['mancuernas'], 'principiante', true],
    ['side-plank', 'core', ['peso-corporal'], 'principiante', true],
    ['bosu-ball-push-up', 'empuje-horizontal', [], 'principiante', false],
  ] as const)('%s → %s', (id, patron, equipo, nivel, entra) => {
    const result = mapped(id);
    expect(result.patron).toBe(patron satisfies Pattern);
    expect(result.nivel).toBe(nivel satisfies Level);
    expect(result.entraEnPlan).toBe(entra);
    expect([...result.equipo].sort()).toEqual([...(equipo as readonly Equipment[])].sort());
  });
});
