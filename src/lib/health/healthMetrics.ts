import type { HealthDailyRecord, HealthMetricDefinition } from "./healthTypes";

export const HEALTH_LAYER_KEY = "ebnjaos-health-foundation-v1";

export const healthMetricDefinitions: HealthMetricDefinition[] = [
  { entity: "Water", key: "water_ml", label: "Agua", unit: "ml", dailyTarget: 3000 },
  { entity: "Protein", key: "protein_g", label: "Proteína", unit: "g", dailyTarget: 135 },
  { entity: "Sleep", key: "sleep_hours", label: "Sueño", unit: "hours", dailyTarget: 8 },
  { entity: "Weight", key: "weight_kg", label: "Peso", unit: "kg", dailyTarget: 0 },
  { entity: "Workout", key: "workouts_count", label: "Entrenamientos", unit: "count", dailyTarget: 1 },
  { entity: "Activity", key: "steps_count", label: "Pasos", unit: "steps", dailyTarget: 8000 },
  { entity: "HRV", key: "hrv_ms", label: "HRV", unit: "ms", dailyTarget: 60 },
  { entity: "RestingHR", key: "resting_hr", label: "FC Reposo", unit: "bpm", dailyTarget: 55 },
];

export function nowIso() {
  return new Date().toISOString();
}

export function toDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function makeEmptyHealthDay(date: string): HealthDailyRecord {
  return {
    date,
    water_ml: 0,
    protein_g: 0,
    sleep_hours: 0,
    weight_kg: 0,
    workouts_count: 0,
    steps_count: 0,
    hrv_ms: 0,
    resting_hr: 0,
    source: "manual",
    updatedAt: nowIso(),
  };
}

export function clampPct(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
