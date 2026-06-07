import { clampPct, toDateKey } from "../health/healthMetrics";
import type { HealthFoundationState } from "../health/healthTypes";
import type {
  AdaptiveTrainingRecommendation,
  FitnessSessionLogRow,
  FitnessSetLogRow,
  PRDashboardRow,
  PRLiftKey,
  FitnessWorkoutDayRow,
} from "./fitnessExecutionTypes";

const PR_LABELS: Record<PRLiftKey, string> = {
  back_squat: "Back Squat",
  front_squat: "Front Squat",
  deadlift: "Deadlift",
  bench_press: "Bench Press",
  military_press: "Military Press",
  power_clean: "Power Clean",
};

const LIFT_SYNONYMS: Record<PRLiftKey, string[]> = {
  back_squat: ["back squat", "squat"],
  front_squat: ["front squat"],
  deadlift: ["deadlift"],
  bench_press: ["bench press", "db bench press", "barbell bench press"],
  military_press: ["military press", "overhead press", "strict press", "push press"],
  power_clean: ["power clean", "clean", "hang clean", "db hang clean", "db clean"],
};

function average(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value) && value > 0);
  if (!valid.length) return 0;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function lastDays(state: HealthFoundationState, count = 30) {
  const dates = Object.keys(state.daily ?? {})
    .sort((a, b) => b.localeCompare(a))
    .slice(0, count);
  return dates.map((date) => state.daily[date]).sort((a, b) => a.date.localeCompare(b.date));
}

function selectLiftKey(name: string): PRLiftKey | null {
  const normalized = name.toLowerCase();
  for (const [key, variants] of Object.entries(LIFT_SYNONYMS) as Array<[PRLiftKey, string[]]>) {
    if (variants.some((variant) => normalized.includes(variant))) return key;
  }
  return null;
}

export function computeAdaptiveTrainingRecommendation(
  healthState: HealthFoundationState,
  date = toDateKey(),
  recoveryScore = healthState.dashboardModels.recoveryScore,
): AdaptiveTrainingRecommendation {
  const day = healthState.daily[date] ?? null;
  const days30 = lastDays(healthState, 30);
  const sleepBaseline = average(days30.map((item) => item.sleep_hours)) || 8;
  const hrvBaseline = average(days30.map((item) => item.hrv_ms)) || day?.hrv_ms || 0;
  const restingHrBaseline = average(days30.map((item) => item.resting_hr)) || day?.resting_hr || 0;

  const currentSleep = day?.sleep_hours ?? 0;
  const currentHrv = day?.hrv_ms ?? 0;
  const currentRestingHr = day?.resting_hr ?? 0;

  const hrvDeltaPct = hrvBaseline > 0 ? ((currentHrv - hrvBaseline) / hrvBaseline) * 100 : 0;
  const restingHrDeltaPct = restingHrBaseline > 0 ? ((currentRestingHr - restingHrBaseline) / restingHrBaseline) * 100 : 0;
  const sleepScore = clampPct((currentSleep / (sleepBaseline || 8)) * 100);
  const hrvScore = clampPct(100 + hrvDeltaPct);
  const restingHrScore = clampPct(100 - restingHrDeltaPct);
  const readiness = clampPct((recoveryScore * 0.45) + (sleepScore * 0.2) + (hrvScore * 0.2) + (restingHrScore * 0.15));

  const explanation: string[] = [];
  const riskFactors: string[] = [];

  explanation.push(`Recovery score ${recoveryScore}% con baselines de 30 días.`);
  explanation.push(`Sueño actual ${currentSleep.toFixed(1)}h vs baseline ${sleepBaseline.toFixed(1)}h.`);
  explanation.push(`HRV ${currentHrv.toFixed(0)} ms · FC reposo ${currentRestingHr.toFixed(0)} bpm.`);

  if (currentSleep > 0 && currentSleep < sleepBaseline * 0.9) riskFactors.push("Sueño bajo vs tu baseline reciente");
  if (currentHrv > 0 && hrvDeltaPct < -10) riskFactors.push("HRV por debajo de la línea base");
  if (currentRestingHr > 0 && restingHrDeltaPct > 5) riskFactors.push("FC en reposo elevada");
  if (healthState.dashboardModels.workoutLoad >= 5) riskFactors.push("Carga semanal alta");

  if (readiness < 60) {
    return {
      readiness,
      level: readiness < 40 ? "fatigued" : "moderate",
      recommendation: "Reducir volumen 20% y accesorios",
      volumeAdjustmentPct: -20,
      explanation,
      riskFactors: riskFactors.length ? riskFactors : ["Prioriza recuperación hoy"],
      sleepBaseline,
      hrvBaseline,
      restingHrBaseline,
      currentSleep,
      currentHrv,
      currentRestingHr,
      hrvDeltaPct,
      restingHrDeltaPct,
    };
  }

  if (readiness <= 80) {
    return {
      readiness,
      level: "good",
      recommendation: "Mantener carga",
      volumeAdjustmentPct: 0,
      explanation,
      riskFactors,
      sleepBaseline,
      hrvBaseline,
      restingHrBaseline,
      currentSleep,
      currentHrv,
      currentRestingHr,
      hrvDeltaPct,
      restingHrDeltaPct,
    };
  }

  return {
    readiness,
    level: "optimal",
    recommendation: "Intensidad normal",
    volumeAdjustmentPct: 0,
    explanation,
    riskFactors,
    sleepBaseline,
    hrvBaseline,
    restingHrBaseline,
    currentSleep,
    currentHrv,
    currentRestingHr,
    hrvDeltaPct,
    restingHrDeltaPct,
  };
}

function trendLabel(delta: number) {
  if (delta > 0) return `↗ +${delta.toFixed(1)}`;
  if (delta < 0) return `↘ ${delta.toFixed(1)}`;
  return "→ 0";
}

function recentDateBoundary(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

export function buildPRDashboard(
  sessionLogs: FitnessSessionLogRow[],
  setLogs: FitnessSetLogRow[],
  legacyRows: Array<{ movement: string; value: number; date: string }>,
) {
  const rows: PRDashboardRow[] = [];
  const range30 = recentDateBoundary(30);
  const range60 = recentDateBoundary(60);

  for (const [key, label] of Object.entries(PR_LABELS) as Array<[PRLiftKey, string]>) {
    const fromSets = setLogs
      .filter((set) => set.completed && selectLiftKey(set.exercise_name) === key)
      .map((set) => {
        const session = sessionLogs.find((item) => item.id === set.session_id);
        return {
          date: session?.date ?? "",
          weight: Math.max(0, Number(set.weight) || 0),
          reps: Math.max(0, Number(set.reps) || 0),
        };
      })
      .filter((entry) => entry.weight > 0);

    const fromLegacy = legacyRows
      .filter((row) => selectLiftKey(row.movement) === key)
      .map((row) => ({
        date: row.date,
        weight: Math.max(0, Number(row.value) || 0),
        reps: 1,
      }));

    const entries = [...fromSets, ...fromLegacy].sort((a, b) => a.date.localeCompare(b.date));
    const totalVolume = entries.reduce((sum, entry) => sum + entry.weight * (entry.reps || 1), 0);
    const bestPr = entries.reduce((max, entry) => Math.max(max, entry.weight), 0);
    const lastEntry = entries[entries.length - 1] ?? { date: "", weight: 0, reps: 0 };
    const lastPr = lastEntry.weight;
    const currentWindow = entries.filter((entry) => entry.date >= range30);
    const previousWindow = entries.filter((entry) => entry.date >= range60 && entry.date < range30);
    const currentBest = currentWindow.reduce((max, entry) => Math.max(max, entry.weight), 0);
    const previousBest = previousWindow.reduce((max, entry) => Math.max(max, entry.weight), 0);
    const monthlyImprovement = currentBest - previousBest;
    const estimated1rm = entries.reduce((max, entry) => Math.max(max, entry.weight * (1 + entry.reps / 30)), 0);

    rows.push({
      key,
      label,
      lastPr,
      bestPr,
      monthlyImprovement,
      estimated1rm,
      totalVolume,
      trendLabel: trendLabel(monthlyImprovement),
      sourceLabel: `${fromSets.length ? "sets" : "legacy"} · ${entries.length} registros`,
      lastDate: lastEntry.date || "—",
    });
  }

  return rows;
}

export function selectTodayWorkoutDay(
  workoutDays: FitnessWorkoutDayRow[],
  recommendation: AdaptiveTrainingRecommendation,
  now = new Date(),
) {
  const sorted = [...workoutDays].sort((a, b) => a.day_number - b.day_number);
  if (!sorted.length) return null;

  const recoveryDay = sorted.find((day) => day.name.toLowerCase().includes("recovery"));
  if (recommendation.readiness < 60 && recoveryDay) return recoveryDay;

  const weekdayMap: Record<number, number> = {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    0: 7,
  };

  const targetDayNumber = weekdayMap[now.getDay()] ?? 1;
  return sorted.find((day) => day.day_number === targetDayNumber) ?? sorted[0];
}
