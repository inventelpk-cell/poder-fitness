import { addDays } from './dates';
import { retoCompleto, type HeroLogInput } from './hero';

export interface WeekPlanRef {
  weekStart: string;
  planned: number;
}

export interface WeekStreak {
  weeks: number;
  done: number;
  planned: number;
  restart: boolean;
}

export function weekStreak(input: {
  plans: WeekPlanRef[];
  completedDates: string[];
  thisMonday: string;
}): WeekStreak {
  const current = input.plans.find((plan) => plan.weekStart === input.thisMonday);
  const done = input.completedDates.filter(
    (date) => date >= input.thisMonday && date < addDays(input.thisMonday, 7),
  ).length;
  const closed = input.plans
    .filter((plan) => plan.weekStart < input.thisMonday)
    .sort((a, b) => (a.weekStart < b.weekStart ? 1 : -1));
  let weeks = 0;
  let restart = false;
  for (const [index, plan] of closed.entries()) {
    const end = addDays(plan.weekStart, 7);
    const count = input.completedDates.filter((date) => date >= plan.weekStart && date < end).length;
    const met = plan.planned > 0 && count >= plan.planned;
    if (met) weeks += 1;
    else {
      if (index === 0) restart = true;
      break;
    }
  }
  return { weeks, done, planned: current?.planned ?? 0, restart };
}

export function heroStreak(logs: { date: string; log: HeroLogInput }[], today: string): { days: number; lost: boolean } {
  const map = new Map(logs.map((item) => [item.date, item.log]));
  const yesterday = addDays(today, -1);
  const yesterdayDone = map.has(yesterday) && retoCompleto(map.get(yesterday)!);
  const todayDone = map.has(today) && retoCompleto(map.get(today)!);
  const hadHistory = logs.some((item) => item.date < today);
  if (!todayDone && !yesterdayDone) return { days: 0, lost: hadHistory && !yesterdayDone };
  let cursor = todayDone ? today : yesterday;
  let days = 0;
  while (map.has(cursor) && retoCompleto(map.get(cursor)!)) {
    days += 1;
    cursor = addDays(cursor, -1);
  }
  return { days, lost: false };
}
