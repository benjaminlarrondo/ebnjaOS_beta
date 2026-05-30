export type TrackingCategoryId = "health" | "growth";

export type TrackingHabitId =
  | "water"
  | "meals"
  | "protein"
  | "workout"
  | "sleep"
  | "pmp"
  | "pymo"
  | "music";

export type TrackingUnit = "ml" | "count" | "g" | "boolean" | "hours" | "minutes";

export type TrackingHabitDefinition = {
  id: TrackingHabitId;
  category: TrackingCategoryId;
  label: string;
  unit: TrackingUnit;
  defaultTarget: number;
  weight: number;
  active: boolean;
  order: number;
};

export type TrackingState = {
  version: "v1";
  habits: TrackingHabitDefinition[];
  logs: Record<string, Partial<Record<TrackingHabitId, number | boolean>>>;
  updatedAt: string | null;
};

export type TrackingDailyScore = {
  date: string;
  healthScore: number;
  growthScore: number;
  globalScore: number;
  completions: Record<TrackingHabitId, number>;
};

export const TRACKING_KEY = "ebnjaos-tracking-v1";

export const trackingHabits: TrackingHabitDefinition[] = [
  { id: "water", category: "health", label: "Agua", unit: "ml", defaultTarget: 2500, weight: 1, active: true, order: 1 },
  { id: "meals", category: "health", label: "Comidas", unit: "count", defaultTarget: 3, weight: 1, active: true, order: 2 },
  { id: "protein", category: "health", label: "Proteína", unit: "g", defaultTarget: 140, weight: 1, active: true, order: 3 },
  { id: "workout", category: "health", label: "Entreno", unit: "boolean", defaultTarget: 1, weight: 1.2, active: true, order: 4 },
  { id: "sleep", category: "health", label: "Sueño", unit: "hours", defaultTarget: 8, weight: 1, active: true, order: 5 },
  { id: "pmp", category: "growth", label: "PMP", unit: "minutes", defaultTarget: 60, weight: 1, active: true, order: 6 },
  { id: "pymo", category: "growth", label: "PyMO", unit: "minutes", defaultTarget: 60, weight: 1, active: true, order: 7 },
  { id: "music", category: "growth", label: "Music", unit: "minutes", defaultTarget: 30, weight: 1, active: true, order: 8 },
];

export function toLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function defaultTrackingState(): TrackingState {
  const week = weekDatesFrom();
  const mockLogs: TrackingState["logs"] = {
    [week[0]]: { water: 2100, meals: 3, protein: 115, workout: true, sleep: 7.5, pmp: 45, pymo: 60, music: 20 },
    [week[1]]: { water: 1800, meals: 2, protein: 100, workout: false, sleep: 6.5, pmp: 30, pymo: 25, music: 15 },
    [week[2]]: { water: 2500, meals: 3, protein: 140, workout: true, sleep: 8, pmp: 60, pymo: 50, music: 30 },
    [week[3]]: { water: 2300, meals: 3, protein: 130, workout: true, sleep: 7.2, pmp: 55, pymo: 35, music: 25 },
  };
  return {
    version: "v1",
    habits: trackingHabits,
    logs: mockLogs,
    updatedAt: null,
  };
}

export function loadTrackingState(): TrackingState {
  const raw = localStorage.getItem(TRACKING_KEY);
  if (!raw) return defaultTrackingState();
  try {
    const parsed = JSON.parse(raw) as Partial<TrackingState>;
    return {
      version: "v1",
      habits: parsed.habits?.length ? parsed.habits : trackingHabits,
      logs: parsed.logs && Object.keys(parsed.logs).length > 0 ? parsed.logs : defaultTrackingState().logs,
      updatedAt: parsed.updatedAt || null,
    };
  } catch {
    return defaultTrackingState();
  }
}

export function saveTrackingState(state: TrackingState) {
  localStorage.setItem(TRACKING_KEY, JSON.stringify(state));
}

function clampCompletion(habit: TrackingHabitDefinition, value: number | boolean | undefined): number {
  if (habit.unit === "boolean") return value === true ? 1 : 0;
  const numeric = typeof value === "number" ? Math.max(0, value) : 0;
  if (habit.defaultTarget <= 0) return 0;
  return Math.min(1, numeric / habit.defaultTarget);
}

function scoreByCategory(habits: TrackingHabitDefinition[], completions: Record<TrackingHabitId, number>, category: TrackingCategoryId) {
  const inCategory = habits.filter((habit) => habit.active && habit.category === category);
  const weightSum = inCategory.reduce((sum, habit) => sum + habit.weight, 0);
  if (weightSum === 0) return 0;
  const weighted = inCategory.reduce((sum, habit) => sum + completions[habit.id] * habit.weight, 0);
  return Math.round((weighted / weightSum) * 100);
}

export function computeDailyScore(state: TrackingState, date: string): TrackingDailyScore {
  const dayLog = state.logs[date] || {};
  const completions = {} as Record<TrackingHabitId, number>;
  for (const habit of state.habits) {
    completions[habit.id] = clampCompletion(habit, dayLog[habit.id]);
  }

  const healthScore = scoreByCategory(state.habits, completions, "health");
  const growthScore = scoreByCategory(state.habits, completions, "growth");
  const globalScore = Math.round(healthScore * 0.6 + growthScore * 0.4);

  return { date, healthScore, growthScore, globalScore, completions };
}

export function weekDatesFrom(date = new Date()) {
  const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = current.getDay() || 7;
  const monday = new Date(current);
  monday.setDate(current.getDate() - day + 1);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return toLocalDateKey(d);
  });
}
