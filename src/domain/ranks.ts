import type { RankId } from '../catalog/types';
import { RANK_IDS } from '../catalog/types';
import { assertNever } from './assert';

export interface RankBand {
  id: RankId;
  minLevel: number;
  maxLevel: number;
  xp: number;
}

export const RANKS: readonly RankBand[] = [
  { id: 'chispa', minLevel: 1, maxLevel: 5, xp: 0 },
  { id: 'brasa', minLevel: 6, maxLevel: 12, xp: 825 },
  { id: 'llama', minLevel: 13, maxLevel: 22, xp: 2937 },
  { id: 'incendio', minLevel: 23, maxLevel: 32, xp: 7073 },
  { id: 'tormenta', minLevel: 33, maxLevel: 44, xp: 12177 },
  { id: 'relampago', minLevel: 45, maxLevel: 56, xp: 19324 },
  { id: 'nova', minLevel: 57, maxLevel: 68, xp: 27413 },
  { id: 'eclipse', minLevel: 69, maxLevel: 80, xp: 36327 },
  { id: 'mitico', minLevel: 81, maxLevel: 92, xp: 45980 },
  { id: 'absoluto', minLevel: 93, maxLevel: 100, xp: 56310 },
];

export function xpParaAlcanzarNivel(nivel: number): number {
  if (nivel <= 1) return 0;
  return Math.round(80 * Math.pow(nivel - 1, 1.45));
}

export const XP_NIVEL_100 = 62627;

export function nivelDePoder(xpTotal: number): number {
  const xp = Math.max(0, Math.floor(xpTotal));
  let level = 1;
  for (let n = 2; n <= 100; n += 1) {
    if (xp >= xpParaAlcanzarNivel(n)) level = n;
    else break;
  }
  return level;
}

export function rankForLevel(level: number): RankBand {
  const found = RANKS.find((rank) => level >= rank.minLevel && level <= rank.maxLevel);
  return found ?? RANKS[0]!;
}

export function rankForXp(xpTotal: number): RankBand {
  return rankForLevel(nivelDePoder(xpTotal));
}

export function nextLevelXp(level: number): number | null {
  if (level >= 100) return null;
  return xpParaAlcanzarNivel(level + 1);
}

export function ranksCrossed(beforeXp: number, afterXp: number, seen: readonly RankId[]): RankId[] {
  const before = rankForXp(beforeXp).id;
  const after = rankForXp(afterXp).id;
  if (before === after) return [];
  const start = RANK_IDS.indexOf(before);
  const end = RANK_IDS.indexOf(after);
  if (end <= start) return [];
  const crossed: RankId[] = [];
  for (let i = start + 1; i <= end; i += 1) {
    const id = RANK_IDS[i];
    if (id && id !== 'chispa' && !seen.includes(id)) crossed.push(id);
  }
  return crossed;
}

export function achievementIdForRank(id: RankId): string | null {
  switch (id) {
    case 'chispa':
      return null;
    case 'brasa':
    case 'llama':
    case 'incendio':
    case 'tormenta':
    case 'relampago':
    case 'nova':
    case 'eclipse':
    case 'mitico':
    case 'absoluto':
      return `rango-${id}`;
    default:
      return assertNever(id, 'rango');
  }
}
