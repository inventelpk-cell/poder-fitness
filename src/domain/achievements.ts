import type { RankId } from '../catalog/types';
import { achievementIdForRank } from './ranks';

export interface AchievementDef {
  id: string;
  nombre: string;
  condicion: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'primera-sesion', nombre: 'Primera sesión', condicion: 'Cierra 1 entreno.' },
  { id: 'diez-sesiones', nombre: 'Diez sesiones', condicion: 'Cierra 10 entrenos.' },
  { id: 'cincuenta-sesiones', nombre: 'Cincuenta sesiones', condicion: 'Cierra 50 entrenos.' },
  { id: 'cien-sesiones', nombre: 'Cien sesiones', condicion: 'Cierra 100 entrenos.' },
  { id: 'semana-completa', nombre: 'Semana cerrada', condicion: 'Cumple 1 semana del plan.' },
  { id: 'cuatro-semanas', nombre: 'Arco cerrado', condicion: 'Termina la semana 4 de un arco.' },
  { id: 'reto-anotado', nombre: 'Reto anotado', condicion: 'Anota un día del reto con alguna cifra.' },
  { id: 'reto-completo', nombre: 'Reto completo', condicion: 'Cumple un día canónico del reto.' },
  { id: 'reto-siete', nombre: 'Siete días de reto', condicion: 'Llega a 7 días seguidos de reto completo.' },
  { id: 'primer-record', nombre: 'Primer récord', condicion: 'Supera una marca en una serie de trabajo.' },
  { id: 'volumen-10k', nombre: 'Diez mil kilos', condicion: 'Acumula 10.000 kg de volumen, o 22.046 lb.' },
  { id: 'camara', nombre: 'Cámara de gravedad', condicion: 'Cierra un entreno con la cámara activa.' },
  { id: 'primera-pesada', nombre: 'Primera pesada', condicion: 'Registra tu peso corporal.' },
  { id: 'ejercicio-propio', nombre: 'Ejercicio propio', condicion: 'Crea un ejercicio.' },
  { id: 'rango-brasa', nombre: 'Brasa', condicion: 'Entra en el rango Brasa.' },
  { id: 'rango-llama', nombre: 'Llama', condicion: 'Entra en el rango Llama.' },
  { id: 'rango-incendio', nombre: 'Incendio', condicion: 'Entra en el rango Incendio.' },
  { id: 'rango-tormenta', nombre: 'Tormenta', condicion: 'Entra en el rango Tormenta.' },
  { id: 'rango-relampago', nombre: 'Relámpago', condicion: 'Entra en el rango Relámpago.' },
  { id: 'rango-nova', nombre: 'Nova', condicion: 'Entra en el rango Nova.' },
  { id: 'rango-eclipse', nombre: 'Eclipse', condicion: 'Entra en el rango Eclipse.' },
  { id: 'rango-mitico', nombre: 'Mítico', condicion: 'Entra en el rango Mítico.' },
  { id: 'rango-absoluto', nombre: 'Absoluto', condicion: 'Entra en el rango Absoluto.' },
];

export interface AchievementFacts {
  completedSessions: number;
  closedWeeks: number;
  closedArcs: number;
  heroLogged: boolean;
  heroComplete: boolean;
  heroStreak: number;
  records: number;
  volumeKg: number;
  volumeLb: number;
  unit: 'kg' | 'lb';
  cameraSessions: number;
  bodyWeights: number;
  customExercises: number;
  ranksReached: RankId[];
}

export function unlockedIds(facts: AchievementFacts): string[] {
  const ids: string[] = [];
  if (facts.completedSessions >= 1) ids.push('primera-sesion');
  if (facts.completedSessions >= 10) ids.push('diez-sesiones');
  if (facts.completedSessions >= 50) ids.push('cincuenta-sesiones');
  if (facts.completedSessions >= 100) ids.push('cien-sesiones');
  if (facts.closedWeeks >= 1) ids.push('semana-completa');
  if (facts.closedArcs >= 1) ids.push('cuatro-semanas');
  if (facts.heroLogged) ids.push('reto-anotado');
  if (facts.heroComplete) ids.push('reto-completo');
  if (facts.heroStreak >= 7) ids.push('reto-siete');
  if (facts.records >= 1) ids.push('primer-record');
  const volumeHit = facts.unit === 'lb' ? facts.volumeLb >= 22046 : facts.volumeKg >= 10000;
  if (volumeHit) ids.push('volumen-10k');
  if (facts.cameraSessions >= 1) ids.push('camara');
  if (facts.bodyWeights >= 1) ids.push('primera-pesada');
  if (facts.customExercises >= 1) ids.push('ejercicio-propio');
  for (const rank of facts.ranksReached) {
    const id = achievementIdForRank(rank);
    if (id) ids.push(id);
  }
  return ids;
}
