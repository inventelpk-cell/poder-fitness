import { describe, expect, it } from 'vitest';
import { duplicateNameIssues, exerciseSpanishIssues } from '../src/catalog/gym-visual-quality';
import type { Exercise } from '../src/catalog/types';
import raw from '../data/exercises/gym-visual.es.json';

const catalog = raw as Exercise[];

describe('calidad gym visual en español', () => {
  it('no deja nombres, equipo ni músculos con tokens ingleses habituales', () => {
    const issues = catalog.flatMap((exercise) =>
      exerciseSpanishIssues(exercise).map((issue) => `${exercise.id}:${issue}`),
    );
    expect(issues).toEqual([]);
  });

  it('no deja nombres duplicados', () => {
    expect(duplicateNameIssues(catalog)).toEqual([]);
  });
});
