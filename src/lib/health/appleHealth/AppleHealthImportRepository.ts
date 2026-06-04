import { loadHealthFoundationState, saveHealthFoundationState, applyHealthImportPayload } from "../../healthFoundation";
import type { HealthFoundationState, HealthImportPayload } from "../../healthFoundation";
import { getSingleUserId } from "../../supabaseSync";
import { pullRows, upsertRows } from "../../repositories/syncRepository";
import { pushHealthState, pullHealthState } from "../../repositories/healthRepository";
import type {
  AppleHealthDailyImport,
  AppleHealthImportBatch,
  AppleHealthRawDay,
} from "./AppleHealthImportPayload";
import { normalizeAppleHealthBatch, normalizeAppleHealthDailyImport } from "./HealthMetricsNormalizer";

const KEY = "ebnjaos-apple-health-import-v1";

export type AppleHealthImportCache = {
  version: "v1";
  importedAt: string;
  days: AppleHealthDailyImport[];
};

export type AppleHealthRemoteSnapshot = {
  healthState: HealthFoundationState | null;
  bodyMetrics: FitnessBodyMetricRow[];
  workouts: FitnessWorkoutRow[];
};

type FitnessBodyMetricRow = {
  user_id: string;
  date: string;
  body_weight?: number | null;
  sleep_hours?: number | null;
  steps_count?: number | null;
  hrv_ms?: number | null;
  resting_hr?: number | null;
  source: string;
  external_id: string;
  external_updated_at?: string | null;
  metadata: Record<string, unknown>;
};

type FitnessWorkoutRow = {
  user_id: string;
  title: string;
  date: string;
  type: "strength" | "crossfit" | "cardio" | "mobility" | "recovery";
  duration_minutes: number;
  intensity: number;
  notes: string;
  source: string;
  external_id: string;
  external_updated_at?: string | null;
  metadata: Record<string, unknown>;
};

function toFoundationPayload(day: AppleHealthDailyImport): HealthImportPayload {
  return {
    date: day.date,
    waterMl: day.waterMl,
    proteinG: day.proteinG,
    sleepHours: day.sleepHours,
    weightKg: day.weightKg,
    workoutsCount: day.workoutsCount,
    stepsCount: day.stepsCount,
    hrvMs: day.hrvMs,
    restingHr: day.restingHr,
  };
}

function loadCache(): AppleHealthImportCache {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    return { version: "v1", importedAt: "", days: [] };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppleHealthImportCache>;
    return {
      version: "v1",
      importedAt: parsed.importedAt ?? "",
      days: parsed.days ?? [],
    };
  } catch {
    return { version: "v1", importedAt: "", days: [] };
  }
}

function saveCache(cache: AppleHealthImportCache) {
  localStorage.setItem(KEY, JSON.stringify(cache));
}

function safeTimestamp(value: unknown) {
  return typeof value === "string" && value.length ? value : "1970-01-01T00:00:00.000Z";
}

function toText(value: unknown) {
  return typeof value === "string" && value.length ? value : null;
}

function getTimestamp(day: AppleHealthDailyImport) {
  return new Date(safeTimestamp(day.externalUpdatedAt || day.metadata?.updatedAt)).getTime();
}

function pickString(existing: string | undefined, incoming: string | undefined, incomingWins: boolean) {
  if (incomingWins) return incoming ?? existing;
  return existing ?? incoming;
}

function pickNumber(existing: number | undefined, incoming: number | undefined, incomingWins: boolean) {
  if (incomingWins) return typeof incoming === "number" ? incoming : existing;
  return typeof existing === "number" ? existing : incoming;
}

function mergeDailyImport(existing: AppleHealthDailyImport, incoming: AppleHealthDailyImport): AppleHealthDailyImport {
  const incomingWins = getTimestamp(incoming) >= getTimestamp(existing);
  const mergedMetadata = incomingWins
    ? { ...(existing.metadata ?? {}), ...(incoming.metadata ?? {}) }
    : { ...(incoming.metadata ?? {}), ...(existing.metadata ?? {}) };

  return {
    date: incoming.date,
    waterMl: pickNumber(existing.waterMl, incoming.waterMl, incomingWins),
    proteinG: pickNumber(existing.proteinG, incoming.proteinG, incomingWins),
    sleepHours: pickNumber(existing.sleepHours, incoming.sleepHours, incomingWins),
    weightKg: pickNumber(existing.weightKg, incoming.weightKg, incomingWins),
    stepsCount: pickNumber(existing.stepsCount, incoming.stepsCount, incomingWins),
    hrvMs: pickNumber(existing.hrvMs, incoming.hrvMs, incomingWins),
    restingHr: pickNumber(existing.restingHr, incoming.restingHr, incomingWins),
    workoutsCount: pickNumber(existing.workoutsCount, incoming.workoutsCount, incomingWins),
    source: "apple_health",
    sourceId: pickString(existing.sourceId, incoming.sourceId, incomingWins),
    externalId: pickString(existing.externalId, incoming.externalId, incomingWins),
    externalUpdatedAt: pickString(existing.externalUpdatedAt, incoming.externalUpdatedAt, incomingWins),
    metadata: mergedMetadata,
  };
}

function mergeDays(existing: AppleHealthDailyImport[], incoming: AppleHealthDailyImport[]) {
  const byDate = new Map<string, AppleHealthDailyImport>();
  for (const day of [...existing, ...incoming]) {
    const current = byDate.get(day.date);
    if (!current) {
      byDate.set(day.date, day);
      continue;
    }

    byDate.set(day.date, mergeDailyImport(current, day));
  }
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function buildBodyMetricRow(day: AppleHealthDailyImport): FitnessBodyMetricRow {
  const externalId = day.externalId || `apple-health-body:${day.date}`;
  const externalUpdatedAt = toText(day.externalUpdatedAt ?? day.metadata?.externalUpdatedAt ?? day.metadata?.updatedAt);
  return {
    user_id: getSingleUserId(),
    date: day.date,
    body_weight: day.weightKg ?? null,
    sleep_hours: day.sleepHours ?? null,
    steps_count: day.stepsCount ?? null,
    hrv_ms: day.hrvMs ?? null,
    resting_hr: day.restingHr ?? null,
    source: "apple_health",
    external_id: externalId,
    external_updated_at: externalUpdatedAt,
    metadata: {
      ...(day.metadata ?? {}),
      source: "apple_health",
      date: day.date,
      importedAt: day.metadata?.importedAt ?? null,
      waterMl: day.waterMl ?? null,
      proteinG: day.proteinG ?? null,
      workoutsCount: day.workoutsCount ?? 0,
      externalId,
    },
  };
}

function buildWorkoutRows(day: AppleHealthDailyImport): FitnessWorkoutRow[] {
  const workoutsCount = Math.max(0, Math.round(day.workoutsCount ?? 0));
  const externalUpdatedAt = toText(day.externalUpdatedAt ?? day.metadata?.externalUpdatedAt ?? day.metadata?.updatedAt);
  const baseExternalId = day.externalId || `apple-health-workout:${day.date}`;
  return Array.from({ length: workoutsCount }, (_, index) => {
    const externalId = `${baseExternalId}:${index + 1}`;
    return {
      user_id: getSingleUserId(),
      title: `Apple Health Workout ${index + 1}`,
      date: day.date,
      type: "recovery",
      duration_minutes: 0,
      intensity: 0,
      notes: "Imported from Apple Health",
      source: "apple_health",
      external_id: externalId,
      external_updated_at: externalUpdatedAt,
      metadata: {
        ...(day.metadata ?? {}),
        source: "apple_health",
        date: day.date,
        importedAt: day.metadata?.importedAt ?? null,
        workoutsCount,
        workoutIndex: index + 1,
        externalId,
      },
    };
  });
}

async function persistRemoteAppleHealthImport(batch: AppleHealthImportBatch, state: HealthFoundationState) {
  const bodyRows = batch.days.map(buildBodyMetricRow);
  const workoutRows = batch.days.flatMap(buildWorkoutRows);

  await Promise.allSettled([
    pushHealthState(state),
    upsertRows("fitness_body_metrics", bodyRows, "user_id,external_id"),
    workoutRows.length ? upsertRows("fitness_workouts", workoutRows, "user_id,external_id") : Promise.resolve(),
  ]);
}

export function loadAppleHealthImportCache() {
  return loadCache();
}

export function normalizeAppleHealthImport(input: AppleHealthRawDay | AppleHealthDailyImport | AppleHealthImportBatch) {
  if ("provider" in input) return normalizeAppleHealthBatch(input);
  if ("source" in input && input.source === "apple_health") {
    return normalizeAppleHealthBatch({
      provider: "apple_health",
      importedAt: input.externalUpdatedAt || new Date().toISOString(),
      days: [input],
    });
  }
  return normalizeAppleHealthBatch([normalizeAppleHealthDailyImport(input as AppleHealthRawDay)]);
}

export function cacheAppleHealthImport(input: AppleHealthRawDay | AppleHealthDailyImport | AppleHealthImportBatch) {
  const batch = normalizeAppleHealthImport(input);
  const current = loadCache();
  const next: AppleHealthImportCache = {
    version: "v1",
    importedAt: batch.importedAt,
    days: mergeDays(current.days, batch.days),
  };
  saveCache(next);
  return next;
}

export async function applyAppleHealthImportToFoundation(
  input: AppleHealthRawDay | AppleHealthDailyImport | AppleHealthImportBatch,
): Promise<HealthFoundationState> {
  const batch = cacheAppleHealthImport(input);
  let next = loadHealthFoundationState();

  for (const day of batch.days) {
    next = applyHealthImportPayload(next, toFoundationPayload(day));
  }

  saveHealthFoundationState(next);
  await persistRemoteAppleHealthImport(
    {
      provider: "apple_health",
      importedAt: batch.importedAt,
      days: batch.days,
    },
    next,
  );
  return next;
}

export function hydrateAppleHealthFromCache(): HealthFoundationState {
  const cache = loadCache();
  let next = loadHealthFoundationState();

  for (const day of cache.days) {
    next = applyHealthImportPayload(next, toFoundationPayload(day));
  }

  return next;
}

export async function hydrateAppleHealthFromRemote(): Promise<HealthFoundationState> {
  const remote = await pullHealthState();
  return remote ?? hydrateAppleHealthFromCache();
}

export async function pullAppleHealthRemoteSnapshot(): Promise<AppleHealthRemoteSnapshot> {
  const [healthState, bodyMetrics, workouts] = await Promise.all([
    pullHealthState(),
    pullRows<FitnessBodyMetricRow>("fitness_body_metrics", getSingleUserId(), "*"),
    pullRows<FitnessWorkoutRow>("fitness_workouts", getSingleUserId(), "*"),
  ]);

  return {
    healthState,
    bodyMetrics,
    workouts,
  };
}
