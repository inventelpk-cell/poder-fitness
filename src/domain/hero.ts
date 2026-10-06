export interface HeroLogInput {
  flexiones: number;
  abdominales: number;
  sentadillas: number;
  km: number;
}

export const HERO_GOALS = { flexiones: 100, abdominales: 100, sentadillas: 100, km: 10 } as const;

export function heroQuota(level: 'principiante' | 'intermedio' | 'avanzado'): HeroLogInput {
  switch (level) {
    case 'principiante':
      return { flexiones: 20, abdominales: 20, sentadillas: 20, km: 1 };
    case 'intermedio':
      return { flexiones: 50, abdominales: 50, sentadillas: 50, km: 3 };
    case 'avanzado':
      return { flexiones: 100, abdominales: 100, sentadillas: 100, km: 10 };
    default: {
      const unreachable: never = level;
      return unreachable;
    }
  }
}

export function xpDelReto(log: HeroLogInput): number {
  const flex = (Math.min(log.flexiones, 100) / 100) * 20;
  const abd = (Math.min(log.abdominales, 100) / 100) * 20;
  const sen = (Math.min(log.sentadillas, 100) / 100) * 20;
  const km = (Math.min(log.km, 10) / 10) * 25;
  const completo =
    log.flexiones >= 100 && log.abdominales >= 100 && log.sentadillas >= 100 && log.km >= 10 ? 15 : 0;
  return Math.round(flex + abd + sen + km + completo);
}

export function retoCompleto(log: HeroLogInput): boolean {
  return log.flexiones >= 100 && log.abdominales >= 100 && log.sentadillas >= 100 && log.km >= 10;
}

export function clampHero(log: HeroLogInput): HeroLogInput {
  const flexiones = Math.max(0, Math.min(999, Math.round(log.flexiones)));
  const abdominales = Math.max(0, Math.min(999, Math.round(log.abdominales)));
  const sentadillas = Math.max(0, Math.min(999, Math.round(log.sentadillas)));
  const km = Math.max(0, Math.min(99, Math.round(log.km * 10) / 10));
  return { flexiones, abdominales, sentadillas, km };
}
