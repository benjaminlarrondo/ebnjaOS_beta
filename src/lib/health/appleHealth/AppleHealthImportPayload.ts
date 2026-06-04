export type AppleHealthMetricKey =
  | "water"
  | "protein"
  | "sleep"
  | "weight"
  | "steps"
  | "hrv"
  | "resting_hr"
  | "workouts";

export type AppleHealthMetricSample = {
  key: AppleHealthMetricKey;
  value: number;
  unit: string;
  date: string;
  sourceId?: string;
  externalUpdatedAt?: string;
  metadata?: Record<string, unknown>;
};

export type AppleHealthDailyImport = {
  date: string;
  waterMl?: number;
  proteinG?: number;
  sleepHours?: number;
  weightKg?: number;
  stepsCount?: number;
  hrvMs?: number;
  restingHr?: number;
  workoutsCount?: number;
  source: "apple_health";
  sourceId?: string;
  externalUpdatedAt?: string;
  metadata?: Record<string, unknown>;
};

export type AppleHealthImportBatch = {
  provider: "apple_health";
  importedAt: string;
  days: AppleHealthDailyImport[];
};

export type AppleHealthRawDay = Partial<Omit<AppleHealthDailyImport, "source">> & {
  date: string;
};
