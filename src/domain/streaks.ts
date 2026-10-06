import { addDays, mondayOf } from './dates'
import type { GymStreakState } from './types'

export function emptyGymStreak(): GymStreakState {
  return { streak: 0, countedWeeks: [], closedWeeks: [], weekGoals: {} }
}

export function freezeWeekGoal(state: GymStreakState, weekMonday: string, goal: number): GymStreakState {
  if (state.weekGoals[weekMonday] != null) return state
  return { ...state, weekGoals: { ...state.weekGoals, [weekMonday]: goal } }
}

function countInWeek(dates: string[], monday: string): number {
  const sunday = addDays(monday, 6)
  return dates.filter((date) => date >= monday && date <= sunday).length
}

export function evaluateGymStreak(state: GymStreakState, today: string, completedDates: string[]): GymStreakState {
  const thisMonday = mondayOf(today)
  const next: GymStreakState = {
    streak: state.streak,
    countedWeeks: [...state.countedWeeks],
    closedWeeks: [...state.closedWeeks],
    weekGoals: { ...state.weekGoals },
  }
  const mondays = Object.keys(next.weekGoals).sort()
  for (const monday of mondays) {
    if (monday >= thisMonday || next.closedWeeks.includes(monday)) continue
    const goal = next.weekGoals[monday] ?? 0
    const count = countInWeek(completedDates, monday)
    if (goal === 0) {
      next.closedWeeks.push(monday)
      continue
    }
    if (count >= goal) {
      if (!next.countedWeeks.includes(monday)) {
        next.streak += 1
        next.countedWeeks.push(monday)
      }
    } else {
      next.streak = 0
    }
    next.closedWeeks.push(monday)
  }
  const goal = next.weekGoals[thisMonday]
  if (goal != null && goal > 0 && !next.countedWeeks.includes(thisMonday)) {
    const count = countInWeek(completedDates, thisMonday)
    if (count >= goal) {
      next.streak += 1
      next.countedWeeks.push(thisMonday)
    }
  }
  return next
}
