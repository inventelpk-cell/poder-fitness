export function timeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function localDateISO(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timeZone(),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value ?? '1970';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';
  return `${year}-${month}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1));
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function weekdayOf(iso: string): number {
  const day = parseISODate(iso).getUTCDay();
  return day === 0 ? 7 : day;
}

export function mondayOf(iso: string): string {
  return addDays(iso, 1 - weekdayOf(iso));
}

export function dateForWeekday(weekStart: string, weekday: number): string {
  return addDays(weekStart, weekday - 1);
}

export function defaultWeekdays(count: number): number[] {
  switch (count) {
    case 1:
      return [3];
    case 2:
      return [1, 4];
    case 3:
      return [1, 3, 5];
    case 4:
      return [1, 2, 4, 5];
    case 5:
      return [1, 2, 3, 5, 6];
    case 6:
      return [1, 2, 3, 4, 5, 6];
    case 7:
      return [1, 2, 3, 4, 5, 6, 7];
    default:
      return [1, 3, 5];
  }
}

export function formatClock(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timeZone(),
  }).format(new Date(iso));
}

export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(parseISODate(iso));
}

export function formatMonth(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, monthIndex, 1)),
  );
}

export function durationLabel(startedAt: string, finishedAt: string): string {
  const ms = Math.max(0, new Date(finishedAt).getTime() - new Date(startedAt).getTime());
  const total = Math.round(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  if (minutes <= 0) return `${seconds} s`;
  return `${minutes} min ${seconds.toString().padStart(2, '0')} s`;
}
