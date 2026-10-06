import { addDays, daysBetween, isoWeekId } from './dates'
import type { HeroQuota, HeroStreakState } from './types'

export function defaultQuota(level: number): HeroQuota {
  if (level <= 3) return { pushups: 20, abs: 20, squats: 20, km: 1 }
  if (level <= 7) return { pushups: 40, abs: 40, squats: 40, km: 2 }
  if (level <= 14) return { pushups: 60, abs: 60, squats: 60, km: 4 }
  if (level <= 29) return { pushups: 80, abs: 80, squats: 80, km: 6 }
  return { pushups: 100, abs: 100, squats: 100, km: 10 }
}

export function clampQuota(input: HeroQuota): HeroQuota {
  const reps = (value: number) => Math.min(100, Math.max(10, Math.round(value / 5) * 5))
  const km = Math.min(10, Math.max(0.5, Math.round(input.km * 2) / 2))
  return { pushups: reps(input.pushups), abs: reps(input.abs), squats: reps(input.squats), km }
}

export const HERO_PUSHUPS = ['Pushups', 'Incline_Push-Up', 'Decline_Push-Up', 'Push-Ups_-_Close_Triceps_Position', 'Pushups_Close_and_Wide_Hand_Positions']
export const HERO_ABS = ['Sit-Up', 'Crunch_-_Hands_Overhead', 'Reverse_Crunch', 'Air_Bike']
export const HERO_SQUATS = ['Bodyweight_Squat', 'Bodyweight_Walking_Lunge', 'Goblet_Squat', 'Dumbbell_Squat', 'Barbell_Full_Squat', 'Leg_Press']

export function emptyHeroStreak(today: string): HeroStreakState {
  return { streak: 0, lastActiveDate: null, shield: 1, shieldWeek: isoWeekId(today), shieldedDates: [] }
}

export function ensureHeroShield(state: HeroStreakState, today: string): HeroStreakState {
  const week = isoWeekId(today)
  if (state.shieldWeek !== week) return { ...state, shield: 1, shieldWeek: week }
  return state
}

export function displayHeroStreak(state: HeroStreakState, today: string): number {
  const current = ensureHeroShield(state, today)
  if (!current.lastActiveDate) return 0
  if (current.lastActiveDate === today) return current.streak
  const gap = daysBetween(current.lastActiveDate, today)
  if (gap === 1) return current.streak
  if (gap === 2 && current.shield > 0) return current.streak
  return 0
}

export function registerHeroActivity(state: HeroStreakState, today: string): { state: HeroStreakState; shieldedDate: string | null } {
  const current = ensureHeroShield(state, today)
  if (current.lastActiveDate === today) return { state: current, shieldedDate: null }
  if (!current.lastActiveDate || daysBetween(current.lastActiveDate, today) < 0) {
    return { state: { ...current, streak: Math.max(1, current.streak || 1), lastActiveDate: today }, shieldedDate: null }
  }
  const gap = daysBetween(current.lastActiveDate, today)
  if (gap === 1) {
    return { state: { ...current, streak: current.streak + 1, lastActiveDate: today }, shieldedDate: null }
  }
  if (gap === 2 && current.shield > 0) {
    const covered = addDays(current.lastActiveDate, 1)
    return {
      state: {
        ...current,
        shield: 0,
        streak: current.streak + 2,
        lastActiveDate: today,
        shieldedDates: [...current.shieldedDates, covered],
      },
      shieldedDate: covered,
    }
  }
  return { state: { ...current, streak: 1, lastActiveDate: today }, shieldedDate: null }
}

export interface HeroDayMath {
  quota: HeroQuota
  manual: HeroQuota
  manualXp: number
  bonusGranted: boolean
}

export function heroEntryXp(delta: HeroQuota): number {
  return delta.pushups + delta.abs + delta.squats + Math.round(delta.km * 8)
}

export function combinedTotals(manual: HeroQuota, session: HeroQuota): HeroQuota {
  return {
    pushups: manual.pushups + session.pushups,
    abs: manual.abs + session.abs,
    squats: manual.squats + session.squats,
    km: Math.round((manual.km + session.km) * 10) / 10,
  }
}

export function quotaMet(totals: HeroQuota, quota: HeroQuota): boolean {
  return totals.pushups >= quota.pushups
    && totals.abs >= quota.abs
    && totals.squats >= quota.squats
    && totals.km + 1e-9 >= quota.km
}

export function isCenit(totals: HeroQuota): boolean {
  return totals.pushups >= 100 && totals.abs >= 100 && totals.squats >= 100 && totals.km + 1e-9 >= 10
}

export function isMitad(totals: HeroQuota): boolean {
  return totals.pushups >= 50 && totals.abs >= 50 && totals.squats >= 50 && totals.km + 1e-9 >= 5
}

function clampManual(current: number, delta: number, max = 500): number {
  return Math.min(max, Math.max(0, Math.round((current + delta) * 10) / 10))
}

export function addHeroManual(
  day: HeroDayMath,
  delta: HeroQuota,
  session: HeroQuota,
): { day: HeroDayMath; xpDelta: number } {
  const manual: HeroQuota = {
    pushups: clampManual(day.manual.pushups, delta.pushups),
    abs: clampManual(day.manual.abs, delta.abs),
    squats: clampManual(day.manual.squats, delta.squats),
    km: clampManual(day.manual.km, delta.km, 100),
  }
  const applied: HeroQuota = {
    pushups: manual.pushups - day.manual.pushups,
    abs: manual.abs - day.manual.abs,
    squats: manual.squats - day.manual.squats,
    km: Math.round((manual.km - day.manual.km) * 10) / 10,
  }
  const manualXp = day.manualXp + heroEntryXp(applied)
  const met = quotaMet(combinedTotals(manual, session), day.quota)
  const bonusGranted = met ? true : false
  const prevGranted = Math.min(200, day.manualXp + (day.bonusGranted ? 40 : 0))
  const nextGranted = Math.min(200, Math.max(0, manualXp + (bonusGranted ? 40 : 0)))
  return {
    day: { ...day, manual, manualXp: Math.max(0, manualXp), bonusGranted },
    xpDelta: nextGranted - prevGranted,
  }
}
