import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { createProfile, ensureSeed, getProfile, normalizeProfile } from '../src/db/db';
import type { Profile } from '../src/domain/model';

function profile(partial: Partial<Profile> = {}): Profile {
  return {
    name: 'Ana',
    level: 'principiante',
    goal: 'fuerza',
    equipment: ['peso-corporal'],
    daysPerWeek: 3,
    weekdays: [1, 3, 5],
    unit: 'kg',
    increment: 2.5,
    theme: 'media',
    sound: true,
    avatar: 'mujer',
    coach: 'ciro',
    darioTone: 'brusco',
    sessionMinutes: 45,
    exclusiones: '',
    xpTotal: 0,
    ranksSeen: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

describe('perfil', () => {
  it('completa avatar y entrenador cuando el registro viejo no los trae', () => {
    const stored = {
      ...profile(),
      avatar: 'otro',
      coach: undefined,
      darioTone: undefined,
      sessionMinutes: undefined,
      exclusiones: undefined,
    } as unknown as Profile;
    const next = normalizeProfile(stored);
    expect(next.avatar).toBe('hombre');
    expect(next.coach).toBe('lino');
    expect(next.darioTone).toBe('suave');
    expect(next.sessionMinutes).toBe(45);
    expect(next.exclusiones).toBe('');
  });

  it('guarda el avatar y el entrenador elegidos', async () => {
    await ensureSeed();
    await createProfile(profile());
    const saved = await getProfile();
    expect(saved?.avatar).toBe('mujer');
    expect(saved?.coach).toBe('ciro');
    expect(saved?.darioTone).toBe('brusco');
  });
});
