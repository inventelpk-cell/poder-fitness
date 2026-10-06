import type { RoutineItem } from '../domain/model';

const KEY = 'poder-fitness-draft';

export interface BuilderDraft {
  mode: 'new' | 'routine' | 'day';
  id: string;
  name: string;
  items: RoutineItem[];
}

export function readDraft(): BuilderDraft | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as BuilderDraft;
    if (!parsed || !Array.isArray(parsed.items)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeDraft(draft: BuilderDraft | null): void {
  if (!draft) sessionStorage.removeItem(KEY);
  else sessionStorage.setItem(KEY, JSON.stringify(draft));
}
