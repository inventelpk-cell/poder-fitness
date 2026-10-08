import type { Exercise } from './types';
import raw from '../../data/exercises/gym-visual.es.json';

export function gymVisualExercises(): Exercise[] {
  return (raw as Exercise[]).map((exercise) => ({
    ...exercise,
    alias: [...exercise.alias],
    equipo: [...exercise.equipo],
    pasos: [...exercise.pasos],
    imagenes: exercise.imagenes ? [...exercise.imagenes] : undefined,
    equipoTexto: exercise.equipoTexto ? [...exercise.equipoTexto] : undefined,
    musculosTexto: exercise.musculosTexto ? [...exercise.musculosTexto] : undefined,
  }));
}
