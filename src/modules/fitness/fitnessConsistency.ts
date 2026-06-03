import { getHealthDay } from "../../lib/health/healthStore";
import { clampPct, toDateKey } from "../../lib/health/healthMetrics";
import type { HealthFoundationState } from "../../lib/health/healthTypes";
import type { FitnessWorkout } from "../../types/fitness";

export type FitnessConsistencyDay = {
  date: string;
  overall: number;
  workoutCount: number;
};

export type FitnessConsistencySummary = {
  days: FitnessConsistencyDay[];
  currentStreak: number;
  bestStreak: number;
  consistency30d: number;
  weeklyPct: number;
};

function buildDateRange(days = 30, endDate = new Date()) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - (days - 1 - index));
    return toDateKey(date);
  });
}

function scoreDay(
  healthState: HealthFoundationState,
  workouts: FitnessWorkout[],
  date: string,
) {
  const healthDay = getHealthDay(healthState, date);
  const workoutCount = workouts.filter((workout) => workout.date === date).length;
  const waterScore = clampPct((healthDay.water_ml / 3000) * 100);
  const proteinScore = clampPct((healthDay.protein_g / 135) * 100);
  const sleepScore = clampPct((healthDay.sleep_hours / 8) * 100);
  const workoutScore = workoutCount > 0 ? 100 : 0;
  const overall = clampPct(Math.round((workoutScore * 0.45) + (sleepScore * 0.2) + (waterScore * 0.2) + (proteinScore * 0.15)));

  return {
    date,
    overall,
    workoutCount,
  };
}

function countStreak(days: FitnessConsistencyDay[]) {
  let streak = 0;
  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (days[index].overall < 70) break;
    streak += 1;
  }
  return streak;
}

function bestStreak(days: FitnessConsistencyDay[]) {
  let best = 0;
  let current = 0;
  for (const day of days) {
    if (day.overall >= 70) {
      current += 1;
      best = Math.max(best, current);
      continue;
    }
    current = 0;
  }
  return best;
}

export function computeFitnessConsistencySummary(
  healthState: HealthFoundationState,
  workouts: FitnessWorkout[],
  days = 30,
): FitnessConsistencySummary {
  const range = buildDateRange(days);
  const summaryDays = range.map((date) => scoreDay(healthState, workouts, date));
  const currentStreak = countStreak(summaryDays);
  const best = bestStreak(summaryDays);
  const consistency30d = Math.round((summaryDays.filter((day) => day.overall >= 70).length / Math.max(1, summaryDays.length)) * 100);
  const weeklyWindow = summaryDays.slice(-7);
  const weeklyPct = Math.round(weeklyWindow.reduce((sum, day) => sum + day.overall, 0) / Math.max(1, weeklyWindow.length));

  return {
    days: summaryDays,
    currentStreak,
    bestStreak: best,
    consistency30d,
    weeklyPct,
  };
}
