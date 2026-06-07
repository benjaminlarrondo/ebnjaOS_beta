export type FitnessProgramRow = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type FitnessWorkoutDayRow = {
  id: string;
  user_id: string;
  program_id: string;
  day_number: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
};

export type FitnessExerciseRow = {
  id: string;
  user_id: string;
  workout_day_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  target_weight: number | null;
  rest_seconds: number | null;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type FitnessSessionLogRow = {
  id: string;
  user_id: string;
  workout_day_id: string;
  date: string;
  duration: number;
  notes: string;
  status: "active" | "completed";
  started_at?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type FitnessSetLogRow = {
  id: string;
  user_id: string;
  session_id: string;
  exercise_name: string;
  set_number: number;
  weight: number;
  reps: number;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
};

export type FitnessProgressRow = {
  id: string;
  user_id: string;
  date: string;
  workout_day_id: string | null;
  workout_name: string;
  readiness: number | null;
  planned_volume: number;
  actual_volume: number;
  status: "planned" | "completed" | "deload" | "recovery";
  notes: string;
  created_at?: string;
  updated_at?: string;
};

export type FitnessWorkoutLibrary = {
  programs: FitnessProgramRow[];
  workoutDays: FitnessWorkoutDayRow[];
  exercises: FitnessExerciseRow[];
};

export type PRLiftKey =
  | "back_squat"
  | "front_squat"
  | "deadlift"
  | "bench_press"
  | "military_press"
  | "power_clean";

export type PRDashboardRow = {
  key: PRLiftKey;
  label: string;
  lastPr: number;
  bestPr: number;
  monthlyImprovement: number;
  estimated1rm: number;
  totalVolume: number;
  trendLabel: string;
  sourceLabel: string;
  lastDate: string;
};

export type FitnessExecutionCache = {
  version: "v1";
  lastSyncedAt: string;
  library: FitnessWorkoutLibrary;
  sessionLogs: FitnessSessionLogRow[];
  setLogs: FitnessSetLogRow[];
};

export type ProgramProgressionWeek = {
  week: 1 | 2 | 3 | 4;
  label: string;
  weightLabel: string;
  tone: "primary" | "accent" | "text";
};

export type ProgramProgressionExercise = {
  name: string;
  baseWeight: number | null;
  prescription: string;
  weekTargets: ProgramProgressionWeek[];
  note: string;
};

export type ProgramProgressionModel = {
  programName: string;
  workoutDayName: string;
  workoutDayDescription: string;
  readiness: number;
  weekNumber: number;
  mesocycleLabel: string;
  deload: boolean;
  recommendation: string;
  volumeMultiplier: number;
  exercises: ProgramProgressionExercise[];
};

export type ProgressAnalyticsModel = {
  strength: Array<{
    key: PRLiftKey;
    label: string;
    lastPr: number;
    bestPr: number;
    monthlyImprovement: number;
    estimated1rm: number;
    totalVolume: number;
    trendLabel: string;
    sourceLabel: string;
    lastDate: string;
  }>;
  physical: {
    currentWeight: number;
    trend30d: number;
    trend90d: number;
  };
  adherence: {
    completedWorkouts: number;
    streak: number;
    consistency: number;
    fulfillmentPct: number;
    weeklyWorkouts: number;
  };
};

export type AdaptiveTrainingRecommendation = {
  readiness: number;
  level: "optimal" | "good" | "moderate" | "fatigued";
  recommendation: string;
  volumeAdjustmentPct: number;
  explanation: string[];
  riskFactors: string[];
  sleepBaseline: number;
  hrvBaseline: number;
  restingHrBaseline: number;
  currentSleep: number;
  currentHrv: number;
  currentRestingHr: number;
  hrvDeltaPct: number;
  restingHrDeltaPct: number;
};
