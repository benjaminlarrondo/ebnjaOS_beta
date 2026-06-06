import { db } from "../store";
import { loadTrackingState } from "../tracking";
import {
  clampPct,
  HEALTH_LAYER_KEY,
  healthMetricDefinitions,
  makeEmptyHealthDay,
  nowIso,
} from "./healthMetrics";
import type {
  AppleHealthPort,
  HealthDailyRecord,
  HealthFoundationState,
  HealthImportPayload,
  HealthMetricDefinition,
  HealthMetricKey,
} from "./healthTypes";

function mergeMetricDefinitions(metricDefinitions?: HealthMetricDefinition[]) {
  const merged = new Map<string, HealthMetricDefinition>();
  for (const definition of healthMetricDefinitions) {
    merged.set(definition.key, definition);
  }
  for (const definition of metricDefinitions ?? []) {
    merged.set(definition.key, definition);
  }
  return Array.from(merged.values());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeDailyRecord(date: string, record?: Partial<HealthDailyRecord>): HealthDailyRecord {
  const empty = makeEmptyHealthDay(date);
  return {
    ...empty,
    ...record,
    date,
    water_ml: typeof record?.water_ml === "number" ? record.water_ml : empty.water_ml,
    protein_g: typeof record?.protein_g === "number" ? record.protein_g : empty.protein_g,
    sleep_hours: typeof record?.sleep_hours === "number" ? record.sleep_hours : empty.sleep_hours,
    weight_kg: typeof record?.weight_kg === "number" ? record.weight_kg : empty.weight_kg,
    workouts_count: typeof record?.workouts_count === "number" ? record.workouts_count : empty.workouts_count,
    steps_count: typeof record?.steps_count === "number" ? record.steps_count : empty.steps_count,
    hrv_ms: typeof record?.hrv_ms === "number" ? record.hrv_ms : empty.hrv_ms,
    resting_hr: typeof record?.resting_hr === "number" ? record.resting_hr : empty.resting_hr,
    source: record?.source === "derived" || record?.source === "mixed" ? record.source : "manual",
    updatedAt: typeof record?.updatedAt === "string" && record.updatedAt.length ? record.updatedAt : empty.updatedAt,
  };
}

export function normalizeHealthState(input?: unknown): HealthFoundationState {
  const base = defaultState();
  if (!isRecord(input)) return base;

  const parsed = input as Record<string, unknown>;
  const parsedDaily = isRecord(parsed.daily) ? parsed.daily : {};
  const normalizedDaily = Object.fromEntries(
    Object.entries(parsedDaily).map(([date, record]) => [date, normalizeDailyRecord(date, isRecord(record) ? (record as Partial<HealthDailyRecord>) : undefined)]),
  );

  const snapshotMetrics = isRecord(parsed.metrics) ? (parsed.metrics as Record<string, unknown>) : null;
  const snapshotSyncedAt = typeof parsed.syncedAt === "string" ? parsed.syncedAt : typeof parsed.updated_at === "string" ? parsed.updated_at : null;
  const snapshotDate = snapshotSyncedAt ? snapshotSyncedAt.slice(0, 10) : null;

  const fallbackDaily =
    Object.keys(normalizedDaily).length > 0 || !snapshotMetrics || !snapshotDate
      ? normalizedDaily
      : {
          [snapshotDate]: normalizeDailyRecord(snapshotDate, {
            water_ml: toNumber(snapshotMetrics.waterMl),
            protein_g: toNumber(snapshotMetrics.proteinG),
            sleep_hours: toNumber(snapshotMetrics.sleepHours),
            weight_kg: toNumber(snapshotMetrics.weightKg),
            workouts_count: toNumber(snapshotMetrics.workoutsLast7Days),
            steps_count: toNumber(snapshotMetrics.stepsLast7Days),
            hrv_ms: toNumber(snapshotMetrics.hrvMs),
            resting_hr: toNumber(snapshotMetrics.restingHr),
            source: "mixed",
            updatedAt: snapshotSyncedAt ?? base.lastSyncAt ?? nowIso(),
          }),
        };

  const metrics = mergeMetricDefinitions(Array.isArray(parsed.metrics) ? (parsed.metrics as HealthMetricDefinition[]) : undefined);
  const lastSyncAt = typeof parsed.lastSyncAt === "string" ? parsed.lastSyncAt : snapshotSyncedAt ?? null;
  const dashboardModels = isRecord(parsed.dashboardModels)
    ? {
        sleepScore: toNumber(parsed.dashboardModels.sleepScore) ?? base.dashboardModels.sleepScore,
        proteinProgress: toNumber(parsed.dashboardModels.proteinProgress) ?? base.dashboardModels.proteinProgress,
        workoutLoad: toNumber(parsed.dashboardModels.workoutLoad) ?? base.dashboardModels.workoutLoad,
        recoveryScore: toNumber(parsed.dashboardModels.recoveryScore) ?? base.dashboardModels.recoveryScore,
      }
    : buildDashboardModels({
        ...base,
        daily: fallbackDaily,
        metrics,
        lastSyncAt,
      });

  const provider = parsed.integration && isRecord(parsed.integration) && parsed.integration.provider === "apple_health"
    ? "apple_health"
    : snapshotMetrics
      ? "apple_health"
      : "none";

  return {
    version: "v1",
    metrics,
    daily: fallbackDaily,
    dashboardModels,
    lastSyncAt,
    integration: {
      appleHealthPrepared: true,
      provider,
    },
  };
}

function defaultState(): HealthFoundationState {
  return {
    version: "v1",
    metrics: healthMetricDefinitions,
    daily: {},
    dashboardModels: {
      sleepScore: 0,
      proteinProgress: 0,
      workoutLoad: 0,
      recoveryScore: 0,
    },
    lastSyncAt: null,
    integration: {
      appleHealthPrepared: true,
      provider: "none",
    },
  };
}

export function loadHealthState(): HealthFoundationState {
  const raw = localStorage.getItem(HEALTH_LAYER_KEY);
  if (!raw) return defaultState();
  try {
    const parsed = JSON.parse(raw) as unknown;
    return normalizeHealthState(parsed);
  } catch {
    return defaultState();
  }
}

export function saveHealthState(state: HealthFoundationState) {
  localStorage.setItem(HEALTH_LAYER_KEY, JSON.stringify(normalizeHealthState(state)));
}

export function getHealthDay(state: HealthFoundationState, date: string): HealthDailyRecord {
  return state.daily?.[date] ?? makeEmptyHealthDay(date);
}

export function upsertHealthDay(
  state: HealthFoundationState,
  date: string,
  patch: Partial<Omit<HealthDailyRecord, "date" | "updatedAt">>,
): HealthFoundationState {
  const current = getHealthDay(state, date);
  const next: HealthDailyRecord = {
    ...current,
    ...patch,
    date,
    updatedAt: nowIso(),
  };

  return {
    ...state,
    daily: {
      ...state.daily,
      [date]: next,
    },
    dashboardModels: buildDashboardModels({
      ...state,
      daily: {
        ...state.daily,
        [date]: next,
      },
    }),
    lastSyncAt: nowIso(),
  };
}

export function addHealthValue(
  state: HealthFoundationState,
  date: string,
  metric: HealthMetricKey,
  delta: number,
): HealthFoundationState {
  const current = getHealthDay(state, date);
  const nextValue = Math.max(0, Number(current[metric]) + delta);
  return upsertHealthDay(state, date, { [metric]: nextValue } as Partial<HealthDailyRecord>);
}

export function hydrateFromCurrentModules(state?: HealthFoundationState): HealthFoundationState {
  const base = state ?? loadHealthState();
  const tracking = loadTrackingState();
  const currentDb = db.load();
  const next: HealthFoundationState = {
    ...base,
    daily: { ...base.daily },
  };

  const dates = new Set<string>([
    ...Object.keys(tracking.logs ?? {}),
    ...currentDb.workouts.map((item) => item.date),
  ]);

  for (const date of dates) {
    const existing = getHealthDay(next, date);
    const trackingLog = tracking.logs[date] ?? {};
    const workoutsCount = currentDb.workouts.filter((item) => item.date === date).length;

    next.daily[date] = {
      ...existing,
      date,
      water_ml: typeof trackingLog.water === "number" ? trackingLog.water : existing.water_ml,
      protein_g: typeof trackingLog.protein === "number" ? trackingLog.protein : existing.protein_g,
      sleep_hours: typeof trackingLog.sleep === "number" ? trackingLog.sleep : existing.sleep_hours,
      workouts_count: workoutsCount,
      source: "mixed",
      updatedAt: nowIso(),
    };
  }

  next.dashboardModels = buildDashboardModels(next);
  next.lastSyncAt = nowIso();
  return next;
}

export function applyHealthImportPayload(state: HealthFoundationState, payload: HealthImportPayload): HealthFoundationState {
  return upsertHealthDay(state, payload.date, {
    water_ml: payload.waterMl,
    protein_g: payload.proteinG,
    sleep_hours: payload.sleepHours,
    weight_kg: payload.weightKg,
    workouts_count: payload.workoutsCount,
    steps_count: payload.stepsCount,
    hrv_ms: payload.hrvMs,
    resting_hr: payload.restingHr,
    source: "mixed",
  });
}

export function buildDashboardModels(state: HealthFoundationState) {
  const days = Object.values(state.daily ?? {}).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  if (!days.length) {
    return {
      sleepScore: 0,
      proteinProgress: 0,
      workoutLoad: 0,
      recoveryScore: 0,
    };
  }

  const sleepAvg = days.reduce((sum, day) => sum + day.sleep_hours, 0) / days.length;
  const proteinAvg = days.reduce((sum, day) => sum + day.protein_g, 0) / days.length;
  const workoutLoad = days.reduce((sum, day) => sum + day.workouts_count, 0);

  const sleepScore = clampPct((sleepAvg / 8) * 100);
  const proteinProgress = clampPct((proteinAvg / 135) * 100);
  const recoveryScore = clampPct((sleepScore * 0.7) + (proteinProgress * 0.3));

  return {
    sleepScore,
    proteinProgress,
    workoutLoad,
    recoveryScore,
  };
}

export const appleHealthPortPlaceholder: AppleHealthPort = {
  provider: "apple_health",
  async isAvailable() {
    return false;
  },
  async requestPermissions() {
    return false;
  },
  async importDay() {
    return null;
  },
};
