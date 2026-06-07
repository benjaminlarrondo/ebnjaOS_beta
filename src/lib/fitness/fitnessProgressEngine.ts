import { buildPRDashboard } from "./fitnessExecutionEngine";
import type { HealthFoundationState } from "../health/healthTypes";
import { clampPct, toDateKey } from "../health/healthMetrics";
import type { FitnessWorkout } from "../../types/fitness";
import type {
  FitnessExecutionCache,
  ProgramProgressionExercise,
  ProgramProgressionModel,
  ProgressAnalyticsModel,
  ProgramProgressionWeek,
  PRLiftKey,
} from "./fitnessExecutionTypes";

type LegacyPRRow = { movement: string; value: number; date: string };

const LIFT_SYNONYMS: Record<PRLiftKey, string[]> = {
  back_squat: ["back squat", "squat"],
  front_squat: ["front squat"],
  deadlift: ["deadlift"],
  bench_press: ["bench press", "db bench press", "barbell bench press"],
  military_press: ["military press", "overhead press", "strict press", "push press"],
  power_clean: ["power clean", "clean", "hang clean", "db hang clean", "db clean"],
};

function currentIsoWeek(date = new Date()) {
  const day = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  day.setUTCDate(day.getUTCDate() + 4 - (day.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((+day - +yearStart) / 86400000 + 1) / 7);
  return weekNo;
}

function isoDateDaysAgo(days: number, end = new Date()) {
  const date = new Date(end);
  date.setDate(date.getDate() - days);
  return toDateKey(date);
}

function average(values: number[]) {
  const filtered = values.filter((value) => Number.isFinite(value));
  if (!filtered.length) return 0;
  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

function formatKg(value: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return "—";
  return `${Math.round(value)} kg`;
}

function getLiftKey(name: string): PRLiftKey | null {
  const normalized = name.toLowerCase();
  for (const [key, variants] of Object.entries(LIFT_SYNONYMS) as Array<[PRLiftKey, string[]]>) {
    if (variants.some((variant) => normalized.includes(variant))) return key;
  }
  return null;
}

export const DeloadManager = {
  apply(baseWeight: number | null, readiness: number) {
    const safeBase = typeof baseWeight === "number" && Number.isFinite(baseWeight) ? baseWeight : 0;
    if (!safeBase) return 0;
    const readinessMultiplier = readiness < 60 ? 0.8 : 0.85;
    return Math.max(0, safeBase * readinessMultiplier);
  },
};

export const MesocycleManager = {
  buildWeekTargets(baseWeight: number | null, readiness: number, weekNumber: number): ProgramProgressionWeek[] {
    const safeBase = typeof baseWeight === "number" && Number.isFinite(baseWeight) ? baseWeight : 0;
    const isDeload = weekNumber === 4 || readiness < 60;
    const week1 = safeBase;
    const week2 = safeBase ? safeBase * 1.025 : 0;
    const week3 = safeBase ? safeBase * 1.05 : 0;
    const deload = DeloadManager.apply(safeBase, readiness);

    return [
      { week: 1, label: "Semana 1", weightLabel: formatKg(week1), tone: "text" },
      { week: 2, label: "Semana 2", weightLabel: formatKg(week2), tone: "primary" },
      { week: 3, label: "Semana 3", weightLabel: formatKg(week3), tone: "accent" },
      { week: 4, label: isDeload ? "Deload" : "Semana 4", weightLabel: formatKg(isDeload ? deload : safeBase), tone: isDeload ? "accent" : "text" },
    ];
  },
};

function estimateBaseWeight({
  exerciseName,
  sessionLogs,
  setLogs,
  targetWeight,
}: {
  exerciseName: string;
  sessionLogs: FitnessExecutionCache["sessionLogs"];
  setLogs: FitnessExecutionCache["setLogs"];
  targetWeight: number | null;
}) {
  const liftKey = getLiftKey(exerciseName);
  const history = setLogs
    .filter((set) => set.completed)
    .map((set) => {
      const session = sessionLogs.find((item) => item.id === set.session_id);
      return {
        date: session?.date ?? "",
        exerciseName: set.exercise_name,
        weight: Number(set.weight) || 0,
      };
    })
    .filter((entry) => {
      if (!liftKey) return entry.exerciseName.toLowerCase().includes(exerciseName.toLowerCase());
      return getLiftKey(entry.exerciseName) === liftKey;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const latestHistorical = history[history.length - 1]?.weight ?? 0;
  return Math.max(0, latestHistorical || targetWeight || 0);
}

function getWeightTrend(values: Array<number | null>) {
  const recent = values.slice(-7).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const previous = values.slice(-14, -7).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const recentAvg = average(recent);
  const previousAvg = average(previous);
  const delta = recentAvg - previousAvg;
  return {
    current: recentAvg || previousAvg || 0,
    trend30d: delta,
    trend90d: recentAvg - average(values.slice(-90).filter((value): value is number => typeof value === "number" && Number.isFinite(value))),
  };
}

export const ProgramProgressionEngine = {
  buildPlan(params: {
    library: FitnessExecutionCache["library"];
    sessionLogs: FitnessExecutionCache["sessionLogs"];
    setLogs: FitnessExecutionCache["setLogs"];
    selectedWorkoutDayId: string | null;
    readiness: number;
    programName?: string;
  }): ProgramProgressionModel | null {
    const selectedDay = params.selectedWorkoutDayId
      ? params.library.workoutDays.find((day) => day.id === params.selectedWorkoutDayId) ?? null
      : params.library.workoutDays[0] ?? null;

    if (!selectedDay) return null;

    const exercises = params.library.exercises
      .filter((exercise) => exercise.workout_day_id === selectedDay.id)
      .sort((a, b) => a.sort_order - b.sort_order);

    const weekNumber = ((currentIsoWeek() - 1) % 4) + 1;
    const deload = weekNumber === 4 || params.readiness < 60;
    const volumeMultiplier = deload ? 0.8 : params.readiness > 80 ? 1 : params.readiness >= 60 ? 0.95 : 0.8;

    const progressionExercises: ProgramProgressionExercise[] = exercises.map((exercise) => {
      const baseWeight = estimateBaseWeight({
        exerciseName: exercise.exercise_name,
        sessionLogs: params.sessionLogs,
        setLogs: params.setLogs,
        targetWeight: exercise.target_weight,
      });
      const adjustedBase = baseWeight ? baseWeight * volumeMultiplier : 0;

      return {
        name: exercise.exercise_name,
        baseWeight: adjustedBase || null,
        prescription: `${exercise.sets}x${exercise.reps}`,
        weekTargets: MesocycleManager.buildWeekTargets(adjustedBase || null, params.readiness, weekNumber),
        note: deload
          ? "Deload activo: reduce 20% el volumen."
          : params.readiness < 60
            ? "Carga reducida por recuperación."
            : "Carga normalizada según readiness.",
      };
    });

    return {
      programName: params.programName ?? params.library.programs.find((program) => program.active)?.name ?? "Programa de entrenamiento",
      workoutDayName: selectedDay.name,
      workoutDayDescription: selectedDay.description,
      readiness: params.readiness,
      weekNumber,
      mesocycleLabel: deload ? "Deload" : `Semana ${weekNumber}`,
      deload,
      recommendation:
        params.readiness > 80 ? "Carga completa" : params.readiness >= 60 ? "Mantener carga" : "Reducir volumen y accesorios",
      volumeMultiplier,
      exercises: progressionExercises,
    };
  },

  buildAnalytics(params: {
    healthState: HealthFoundationState;
    fitnessState: FitnessExecutionCache;
    workouts: FitnessWorkout[];
    legacyRows: LegacyPRRow[];
  }): ProgressAnalyticsModel {
    const strength = buildPRDashboard(params.fitnessState.sessionLogs, params.fitnessState.setLogs, params.legacyRows);
    const dates30 = Array.from({ length: 30 }, (_, index) => isoDateDaysAgo(29 - index));
    const dates90 = Array.from({ length: 90 }, (_, index) => isoDateDaysAgo(89 - index));
    const weightSeries30 = dates30.map((date) => params.healthState.daily?.[date]?.weight_kg ?? null);
    const weightSeries90 = dates90.map((date) => params.healthState.daily?.[date]?.weight_kg ?? null);
    const currentWeight = weightSeries30.filter((value): value is number => typeof value === "number" && Number.isFinite(value)).slice(-1)[0] ?? 0;
    const trend30d = getWeightTrend(weightSeries30).trend30d;
    const trend90d = getWeightTrend(weightSeries90).trend90d;

    const completedWorkouts = params.workouts.length;
    const streakDates = [...new Set(params.workouts.map((workout) => workout.date))].sort((a, b) => b.localeCompare(a));
    let streak = 0;
    let previous: Date | null = null;
    for (const date of streakDates) {
      const current = new Date(`${date}T12:00:00`);
      if (!previous) {
        streak = 1;
      } else {
        const diffDays = Math.round((+previous - +current) / 86400000);
        if (diffDays !== 1) break;
        streak += 1;
      }
      previous = current;
    }

    const consistency = Math.round((params.workouts.length / 30) * 100);
    const weeklyWorkouts = params.workouts.filter((workout) => {
      const day = new Date(`${workout.date}T12:00:00`);
      const now = new Date();
      const diff = Math.round((+now - +day) / 86400000);
      return diff >= 0 && diff < 7;
    }).length;
    const fulfillmentPct = clampPct((weeklyWorkouts / 4) * 100);

    return {
      strength,
      physical: {
        currentWeight,
        trend30d,
        trend90d,
      },
      adherence: {
        completedWorkouts,
        streak,
        consistency,
        fulfillmentPct,
        weeklyWorkouts,
      },
    };
  },
};
