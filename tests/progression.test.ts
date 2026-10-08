import { describe, expect, it } from 'vitest';
import { arcTitle, toRoman } from '../src/domain/arc';
import { xpDelReto } from '../src/domain/hero';
import { jumpAmount, proposeLoad } from '../src/domain/loads';
import { brzycki, epley, oneRmEstimado } from '../src/domain/one-rm';
import { isPersonalRecord } from '../src/domain/records';
import { nivelDePoder, rankForXp, xpParaAlcanzarNivel, XP_NIVEL_100 } from '../src/domain/ranks';
import { xpDeSesion } from '../src/domain/xp';
import { fromDisplay, roundToIncrement, toDisplay } from '../src/domain/units';

describe('XP, rangos y 1RM', () => {
  it('los umbrales de rango coinciden con la fórmula', () => {
    expect(xpParaAlcanzarNivel(1)).toBe(0);
    expect(xpParaAlcanzarNivel(6)).toBe(825);
    expect(xpParaAlcanzarNivel(13)).toBe(2937);
    expect(xpParaAlcanzarNivel(23)).toBe(7073);
    expect(xpParaAlcanzarNivel(33)).toBe(12177);
    expect(xpParaAlcanzarNivel(45)).toBe(19324);
    expect(xpParaAlcanzarNivel(57)).toBe(27413);
    expect(xpParaAlcanzarNivel(69)).toBe(36327);
    expect(xpParaAlcanzarNivel(81)).toBe(45980);
    expect(xpParaAlcanzarNivel(93)).toBe(56310);
    expect(xpParaAlcanzarNivel(100)).toBe(XP_NIVEL_100);
    expect(nivelDePoder(0)).toBe(1);
    expect(rankForXp(0).id).toBe('chispa');
    expect(nivelDePoder(825)).toBe(6);
    expect(rankForXp(825).id).toBe('brasa');
    expect(nivelDePoder(824)).toBe(5);
    expect(nivelDePoder(XP_NIVEL_100)).toBe(100);
    expect(nivelDePoder(XP_NIVEL_100 + 500)).toBe(100);
    expect(rankForXp(2937).id).toBe('llama');
  });

  it('calcula el XP de sesión y el tope', () => {
    expect(xpDeSesion({ seriesDeTrabajoCompletadas: 6, hayRecordEnLaSesion: false, planDayId: 'dia', camaraGravedad: false }).total).toBe(86);
    expect(xpDeSesion({ seriesDeTrabajoCompletadas: 4, hayRecordEnLaSesion: false, planDayId: 'dia', camaraGravedad: false }).total).toBe(74);
    expect(xpDeSesion({ seriesDeTrabajoCompletadas: 40, hayRecordEnLaSesion: false, planDayId: null, camaraGravedad: false }).total).toBe(250);
    const withCamera = xpDeSesion({ seriesDeTrabajoCompletadas: 6, hayRecordEnLaSesion: false, planDayId: 'dia', camaraGravedad: true });
    expect(withCamera.camara).toBe(17);
    expect(withCamera.total).toBe(103);
    expect(xpDeSesion({ seriesDeTrabajoCompletadas: 40, hayRecordEnLaSesion: false, planDayId: 'dia', camaraGravedad: true }).total).toBe(300);
  });

  it('estima el 1RM con el menor entre Epley y Brzycki', () => {
    expect(oneRmEstimado(100, 5)).toBe(Math.min(epley(100, 5), brzycki(100, 5)));
    expect(oneRmEstimado(100, 5)).toBe(112.5);
    expect(Math.round((oneRmEstimado(80, 10) ?? 0) * 10) / 10).toBe(106.7);
    expect(oneRmEstimado(100, 1)).toBe(100);
    expect(oneRmEstimado(50, 12)).toBeNull();
  });
});

describe('cargas', () => {
  const base = {
    repMin: 8,
    repMax: 12,
    compuesto: true,
    unit: 'kg' as const,
    increment: 2.5,
    medida: 'reps' as const,
    weekInArc: 1 as const,
    allowUp: true,
  };

  function session(peso: number, reps: number, count = 3) {
    return {
      sets: Array.from({ length: count }, () => ({
        pesoKg: peso,
        reps,
        segundos: null,
        completed: true,
        kind: 'trabajo' as const,
      })),
    };
  }

  it('dos sesiones al máximo proponen un solo salto', () => {
    const proposal = proposeLoad({ ...base, history: [session(60, 12), session(60, 12)] });
    expect(proposal.pesoKg).toBe(62.5);
    expect(proposal.direction).toBe('sube');
    expect(proposal.anteriorKg).toBe(60);
  });

  it('una sesión no basta para subir', () => {
    const proposal = proposeLoad({ ...base, history: [session(60, 12)] });
    expect(proposal.pesoKg).toBe(60);
    expect(proposal.direction).toBe('igual');
  });

  it('dos sesiones por debajo del mínimo bajan un salto y no pasan de cero', () => {
    expect(proposeLoad({ ...base, history: [session(60, 6), session(60, 6)] }).pesoKg).toBe(57.5);
    expect(proposeLoad({ ...base, history: [session(2.5, 6), session(2.5, 6)] }).pesoKg).toBe(0);
  });

  it('la primera vez deja el campo vacío', () => {
    expect(proposeLoad({ ...base, history: [] })).toEqual({ pesoKg: null, direction: 'vacio', anteriorKg: null });
  });

  it('el peso corporal a cero no salta de kilos', () => {
    const proposal = proposeLoad({ ...base, history: [session(0, 12), session(0, 12)] });
    expect(proposal.pesoKg).toBe(0);
    expect(proposal.direction).toBe('igual');
  });

  it('en semana templo aplica el 85 % redondeado y nunca por encima', () => {
    const proposal = proposeLoad({ ...base, weekInArc: 4, history: [session(100, 8)] });
    expect(proposal.pesoKg).toBe(85);
    expect(proposal.pesoKg).toBeLessThanOrEqual(100);
  });

  it('en la cresta el salto solo entra si se permite', () => {
    const up = proposeLoad({ ...base, weekInArc: 3, allowUp: true, history: [session(60, 12), session(60, 12)] });
    const held = proposeLoad({ ...base, weekInArc: 3, allowUp: false, history: [session(60, 12), session(60, 12)] });
    expect(up.pesoKg).toBe(62.5);
    expect(held.pesoKg).toBe(60);
  });

  it('el salto usa el incremento del perfil si es mayor que la base', () => {
    expect(jumpAmount(false, 'kg', 2.5)).toBe(2.5);
    expect(jumpAmount(true, 'kg', 0.5)).toBe(2.5);
    expect(jumpAmount(true, 'lb', 1)).toBe(5);
  });

  it('el redondeo empata hacia abajo', () => {
    expect(roundToIncrement(1.25, 2.5)).toBe(0);
    expect(roundToIncrement(85, 2.5)).toBe(85);
  });

  it('un récord exige superar el historial anterior', () => {
    const prior = [{ pesoKg: 60, reps: 8, segundos: null, completed: true, kind: 'trabajo' as const }];
    expect(isPersonalRecord({ pesoKg: 62.5, reps: 5, segundos: null, completed: true, kind: 'trabajo' }, prior, 'reps')).toBe(true);
    expect(isPersonalRecord({ pesoKg: 60, reps: 9, segundos: null, completed: true, kind: 'trabajo' }, prior, 'reps')).toBe(true);
    expect(isPersonalRecord({ pesoKg: 60, reps: 8, segundos: null, completed: true, kind: 'trabajo' }, prior, 'reps')).toBe(false);
    expect(isPersonalRecord({ pesoKg: 50, reps: 12, segundos: null, completed: true, kind: 'calentamiento' }, prior, 'reps')).toBe(false);
  });
});

describe('reto, arcos y unidades', () => {
  it('el parcial del reto redondea y el día canónico vale 100', () => {
    expect(xpDelReto({ flexiones: 50, abdominales: 0, sentadillas: 0, km: 0 })).toBe(10);
    expect(xpDelReto({ flexiones: 40, abdominales: 10, sentadillas: 0, km: 0.5 })).toBe(11);
    expect(xpDelReto({ flexiones: 100, abdominales: 100, sentadillas: 100, km: 10 })).toBe(100);
    expect(xpDelReto({ flexiones: 200, abdominales: 0, sentadillas: 0, km: 0 })).toBe(20);
  });

  it('nombra el arco con romanos', () => {
    expect(toRoman(1)).toBe('I');
    expect(toRoman(4)).toBe('IV');
    expect(toRoman(6)).toBe('VI');
    expect(toRoman(9)).toBe('IX');
    expect(toRoman(14)).toBe('XIV');
    expect(toRoman(20)).toBe('XX');
    expect(arcTitle(1)).toBe('Arco del Cimiento I');
    expect(arcTitle(6)).toBe('Arco del Cimiento VI');
    expect(arcTitle(2)).toBe('Arco de la Ascensión II');
  });

  it('guardar kilos y mostrar libras no cambia el valor interno', () => {
    const kg = 80.4;
    const shown = toDisplay(kg, 'lb');
    expect(shown).toBeCloseTo(80.4 / 0.45359237, 5);
    expect(fromDisplay(shown, 'lb')).toBeCloseTo(80.4, 3);
  });
});
