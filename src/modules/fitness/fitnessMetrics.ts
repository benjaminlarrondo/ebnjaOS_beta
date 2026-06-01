import { getHealthDay } from "../../lib/health/healthStore";
import { clampPct, toDateKey } from "../../lib/health/healthMetrics";
import type { HealthFoundationState } from "../../lib/health/healthTypes";

export type FitnessHealthMetrics = {
  waterMl: number;
  proteinG: number;
  sleepHours: number;
  workouts: number;
  fitnessScore: number;
  recoveryScore: number;
};

export function computeFitnessHealthMetrics(
  healthState: HealthFoundationState,
  date = toDateKey(),
  workoutsCount = 0,
): FitnessHealthMetrics {
  const day = getHealthDay(healthState, date);
  const workouts = Math.max(day.workouts_count, workoutsCount);
  const waterScore = clampPct((day.water_ml / 3000) * 100);
  const proteinScore = clampPct((day.protein_g / 135) * 100);
  const sleepScore = clampPct((day.sleep_hours / 8) * 100);
  const workoutScore = workouts > 0 ? 100 : 0;
  const fitnessScore = clampPct((waterScore * 0.2) + (proteinScore * 0.3) + (sleepScore * 0.2) + (workoutScore * 0.3));
  const recoveryScore = clampPct((sleepScore * 0.7) + (proteinScore * 0.3));

  return {
    waterMl: day.water_ml,
    proteinG: day.protein_g,
    sleepHours: day.sleep_hours,
    workouts,
    fitnessScore,
    recoveryScore,
  };
}
