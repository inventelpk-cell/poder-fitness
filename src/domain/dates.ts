export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

export function formatISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayISO(now = new Date()): string {
  return formatISODate(now)
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso)
  date.setDate(date.getDate() + days)
  return formatISODate(date)
}

export function daysBetween(from: string, to: string): number {
  const ms = parseISODate(to).getTime() - parseISODate(from).getTime()
  return Math.round(ms / 86_400_000)
}

/** Lunes = 0 … domingo = 6. */
export function weekdayMon0(iso: string): number {
  return (parseISODate(iso).getDay() + 6) % 7
}

export function mondayOf(iso: string): string {
  return addDays(iso, -weekdayMon0(iso))
}

export function sundayOf(iso: string): string {
  return addDays(mondayOf(iso), 6)
}

export function isoWeekId(iso: string): string {
  const date = parseISODate(iso)
  const thursday = new Date(date)
  const mondayIndex = (thursday.getDay() + 6) % 7
  thursday.setDate(thursday.getDate() - mondayIndex + 3)
  const isoYear = thursday.getFullYear()
  const firstThursday = new Date(isoYear, 0, 4)
  const firstMondayIndex = (firstThursday.getDay() + 6) % 7
  firstThursday.setDate(firstThursday.getDate() - firstMondayIndex + 3)
  const week = 1 + Math.round((thursday.getTime() - firstThursday.getTime()) / 604_800_000)
  return `${isoYear}-W${String(week).padStart(2, '0')}`
}

export function resolveSessionDate(startedAtIso: string, now: Date): string {
  const startedLocal = formatISODate(new Date(startedAtIso))
  const nowLocal = formatISODate(now)
  const delta = daysBetween(startedLocal, nowLocal)
  if (delta < 0 && delta >= -1) return nowLocal
  return startedLocal
}
