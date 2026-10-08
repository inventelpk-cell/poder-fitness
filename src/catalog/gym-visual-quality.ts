import type { Exercise } from './types';

const FORBIDDEN_EQUIPO =
  /\b(body\s*weight|dumbbell|barbell|cable|leverage\s*machine|smith\s*machine|resistance\s*band|stability\s*ball|exercise\s*ball|medicine\s*ball|ez\s*barbell|olympic\s*barbell|trap\s*bar|sled\s*machine)\b/i;

const FORBIDDEN_MUSCLE =
  /\b(deltoids|rhomboids|pectorals|hamstrings|quadriceps|forearms|shoulders|glutes|abductors|adductors|trapezius|obliques|lats|traps|delts|quads|calves|biceps|triceps|upper\s*back|lower\s*back|hip\s*flexors|rear\s*deltoids|latissimus\s*dorsi|rotator\s*cuff|grip\s*muscles|ankle\s*stabilizers|inner\s*thighs|lower\s*abs|upper\s*chest|cardiovascular\s*system|sternocleidomastoid|brachialis|soleus|abdominals)\b/i;

const FORBIDDEN_NAME =
  /\b(bodyweight|body\s*weight|dumbbell|barbell|two\s+brazo|un\s+brazo\s+arranque|rear\s+elevación|london\s+puente|sitted|ting\s+remo|jackknife|astride|handle\s+parallel|auto\s+inverso|glutes|elbow\s+fondos|suspended\s+remo|two\s+arm|twin\s+handle|plyométrico\s+sentadilla|palmada\s+flexiones|completo\s+sentadilla|^giro\s+remo|de\s+pie\s+remo|standing|seated|lying|overhead|reverse\s+grip|close\s+grip|wide\s+grip|neutral\s+grip)\b/i;

const CALQUE =
  /\b(cuadrupedia en cuadrupedia|talón toques|guillotine|dumbbell|barbell|two brazo|un brazo arranque|rear elevación|london puente|sitted|ting remo)\b/i;

function spanishNameIssues(name: string): string[] {
  const issues: string[] = [];
  if (FORBIDDEN_NAME.test(name)) issues.push('nombre:english');
  if (CALQUE.test(name)) issues.push('nombre:calque');
  return issues;
}

export function exerciseSpanishIssues(exercise: Exercise): string[] {
  const issues = [...spanishNameIssues(exercise.nombre)];
  for (const item of exercise.equipoTexto ?? []) {
    if (FORBIDDEN_EQUIPO.test(item)) issues.push(`equipo:${item}`);
  }
  for (const item of exercise.musculosTexto ?? []) {
    if (FORBIDDEN_MUSCLE.test(item)) issues.push(`musculo:${item}`);
  }
  return issues;
}

export function duplicateNameIssues(exercises: readonly Pick<Exercise, 'id' | 'nombre'>[]): string[] {
  const groups = new Map<string, string[]>();
  for (const exercise of exercises) {
    const key = exercise.nombre.toLowerCase();
    const list = groups.get(key) ?? [];
    list.push(exercise.id);
    groups.set(key, list);
  }
  const issues: string[] = [];
  for (const [name, ids] of groups) {
    if (ids.length > 1) issues.push(`duplicado:${name} (${ids.length})`);
  }
  return issues;
}
