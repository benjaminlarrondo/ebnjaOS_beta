import { getHealthDay } from "../../lib/health/healthStore";
import { clampPct, toDateKey } from "../../lib/health/healthMetrics";
import type { HealthFoundationState } from "../../lib/health/healthTypes";

export type FitnessHealthMetrics = {
  waterMl: number;
  proteinG: number;
  sleepHours: number;
  workouts: number;
  workoutScore: number;
  nutritionScore: number;
  sleepScore: number;
  fitnessScore: number;
  recoveryScore: number;
};

export function computeFitnessHealthMetrics(
  healthState: HealthFoundationState,
  date = toDateKey(),
  workoutsCount = 0,
  fatigueManual = 0,
  recentWorkouts = 0,
): FitnessHealthMetrics {
  const day = getHealthDay(healthState, date);
  const workouts = Math.max(day.workouts_count, workoutsCount);
  const waterScore = clampPct((day.water_ml / 3000) * 100);
  const proteinScore = clampPct((day.protein_g / 135) * 100);
  const sleepScore = clampPct((day.sleep_hours / 8) * 100);
  const workoutScore = workouts > 0 ? 100 : 0;
  const nutritionScore = clampPct((waterScore * 0.45) + (proteinScore * 0.55));
  const fatiguePenalty = clampPct((Math.max(0, Math.min(10, fatigueManual)) / 10) * 100);
  const recentTrainingBonus = clampPct((Math.max(0, Math.min(3, recentWorkouts)) / 3) * 100);
  const fitnessScore = clampPct((workoutScore * 0.35) + (sleepScore * 0.25) + (proteinScore * 0.2) + (nutritionScore * 0.2));
  const recoveryScore = clampPct((sleepScore * 0.55) + ((100 - fatiguePenalty) * 0.25) + (recentTrainingBonus * 0.2));

  return {
    waterMl: day.water_ml,
    proteinG: day.protein_g,
    sleepHours: day.sleep_hours,
    workouts,
    workoutScore,
    nutritionScore,
    sleepScore,
    fitnessScore,
    recoveryScore,
  };
}
