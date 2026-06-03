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

export type RecoveryIntelligence = {
  score: number;
  status: "Recuperado" | "Moderado" | "Fatigado";
  recommendation: string;
  badge: "good" | "mid" | "low";
  breakdown: {
    sleep: number;
    load: number;
    nutrition: number;
    consistency: number;
  };
};

function buildRecoveryModel(input: {
  sleepHours: number;
  recentWorkouts: number;
  workoutsToday: number;
  waterMl: number;
  proteinG: number;
  progressLogsCount: number;
}): RecoveryIntelligence {
  const sleep = clampPct((input.sleepHours / 8) * 100);
  const loadPenalty = Math.min(100, (Math.max(0, input.recentWorkouts) * 18) + (Math.max(0, input.workoutsToday) * 12));
  const load = clampPct(100 - loadPenalty);
  const waterScore = clampPct((input.waterMl / 3000) * 100);
  const proteinScore = clampPct((input.proteinG / 135) * 100);
  const nutrition = clampPct((waterScore * 0.4) + (proteinScore * 0.6));
  const consistency = clampPct((Math.min(12, Math.max(0, input.progressLogsCount)) / 12) * 100);
  const score = clampPct((sleep * 0.4) + (load * 0.3) + (nutrition * 0.15) + (consistency * 0.15));

  if (score >= 80) {
    return {
      score,
      status: "Recuperado",
      recommendation: "Entrena fuerza",
      badge: "good",
      breakdown: { sleep, load, nutrition, consistency },
    };
  }

  if (score >= 60) {
    return {
      score,
      status: "Moderado",
      recommendation: "Entrena normal",
      badge: "mid",
      breakdown: { sleep, load, nutrition, consistency },
    };
  }

  return {
    score,
    status: "Fatigado",
    recommendation: "Prioriza recuperación",
    badge: "low",
    breakdown: { sleep, load, nutrition, consistency },
  };
}

export function computeFitnessHealthMetrics(
  healthState: HealthFoundationState,
  date = toDateKey(),
  workoutsCount = 0,
  recentWorkouts = 0,
  progressLogsCount = 0,
): FitnessHealthMetrics {
  const day = getHealthDay(healthState, date);
  const workouts = Math.max(day.workouts_count, workoutsCount);
  const waterScore = clampPct((day.water_ml / 3000) * 100);
  const proteinScore = clampPct((day.protein_g / 135) * 100);
  const sleepScore = clampPct((day.sleep_hours / 8) * 100);
  const workoutScore = workouts > 0 ? 100 : 0;
  const nutritionScore = clampPct((waterScore * 0.45) + (proteinScore * 0.55));
  const fitnessScore = clampPct((workoutScore * 0.35) + (sleepScore * 0.25) + (proteinScore * 0.2) + (nutritionScore * 0.2));
  const recovery = buildRecoveryModel({
    sleepHours: day.sleep_hours,
    recentWorkouts,
    workoutsToday: workoutsCount,
    waterMl: day.water_ml,
    proteinG: day.protein_g,
    progressLogsCount,
  });
  const recoveryScore = recovery.score;

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

export function computeRecoveryIntelligence(input: {
  sleepHours: number;
  recentWorkouts: number;
  workoutsToday: number;
  waterMl: number;
  proteinG: number;
  progressLogsCount: number;
}): RecoveryIntelligence {
  return buildRecoveryModel(input);
}
