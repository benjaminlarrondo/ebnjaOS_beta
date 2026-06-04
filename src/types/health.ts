export type HealthMetricKey =
  | "water_ml"
  | "protein_g"
  | "sleep_hours"
  | "weight_kg"
  | "workouts_count"
  | "steps_count"
  | "hrv_ms"
  | "resting_hr";

export type HealthMetricUnit = "ml" | "g" | "hours" | "kg" | "count" | "steps" | "ms" | "bpm";

export type HealthMetricDefinition = {
  key: HealthMetricKey;
  label: string;
  unit: HealthMetricUnit;
  dailyTarget: number;
};

export type HealthDailyRecord = {
  date: string;
  water_ml: number;
  protein_g: number;
  sleep_hours: number;
  weight_kg: number;
  workouts_count: number;
  steps_count: number;
  hrv_ms: number;
  resting_hr: number;
  source: "manual" | "derived" | "mixed";
  updatedAt: string;
};

export type HealthFoundationState = {
  version: "v1";
  metrics: HealthMetricDefinition[];
  daily: Record<string, HealthDailyRecord>;
  lastSyncAt: string | null;
  integration: {
    appleHealthPrepared: boolean;
    provider: "none" | "apple_health";
  };
};

export type HealthImportPayload = {
  date: string;
  waterMl?: number;
  proteinG?: number;
  sleepHours?: number;
  weightKg?: number;
  workoutsCount?: number;
  stepsCount?: number;
  hrvMs?: number;
  restingHr?: number;
};

export type AppleHealthPort = {
  provider: "apple_health";
  isAvailable: () => Promise<boolean>;
  requestPermissions: () => Promise<boolean>;
  importDay: (date: string) => Promise<HealthImportPayload | null>;
};
