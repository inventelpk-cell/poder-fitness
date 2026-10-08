import { describe, expect, it } from 'vitest';
import { pickCoachLine } from '../src/domain/coach';

describe('frases del entrenador', () => {
  it('no repite la frase exacta seguida', () => {
    const first = pickCoachLine({ coach: 'teo', event: 'serie', tone: 'suave', lastId: null, random: () => 0 });
    const second = pickCoachLine({ coach: 'teo', event: 'serie', tone: 'suave', lastId: first.id, random: () => 0 });
    expect(second.id).not.toBe(first.id);
    expect(second.text).not.toBe(first.text);
  });

  it('separa el tono suave y el brusco de Darío', () => {
    const brusco = pickCoachLine({ coach: 'dario', event: 'empezar', tone: 'brusco', lastId: null, random: () => 0 });
    const suave = pickCoachLine({ coach: 'dario', event: 'empezar', tone: 'suave', lastId: null, random: () => 0 });
    expect(brusco.text).toBe('Empieza. Esa pausa ya ha sido el calentamiento.');
    expect(suave.text).toBe('Empieza cuando quieras. Yo estoy mirando.');
    expect(brusco.id).not.toBe(suave.id);
  });
});
