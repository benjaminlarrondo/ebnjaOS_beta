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
  HealthMetricKey,
} from "./healthTypes";

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
    const parsed = JSON.parse(raw) as Partial<HealthFoundationState>;
    return {
      version: "v1",
      metrics: parsed.metrics?.length ? parsed.metrics : healthMetricDefinitions,
      daily: parsed.daily ?? {},
      dashboardModels: {
        sleepScore: parsed.dashboardModels?.sleepScore ?? 0,
        proteinProgress: parsed.dashboardModels?.proteinProgress ?? 0,
        workoutLoad: parsed.dashboardModels?.workoutLoad ?? 0,
        recoveryScore: parsed.dashboardModels?.recoveryScore ?? 0,
      },
      lastSyncAt: parsed.lastSyncAt ?? null,
      integration: {
        appleHealthPrepared: true,
        provider: parsed.integration?.provider === "apple_health" ? "apple_health" : "none",
      },
    };
  } catch {
    return defaultState();
  }
}

export function saveHealthState(state: HealthFoundationState) {
  localStorage.setItem(HEALTH_LAYER_KEY, JSON.stringify(state));
}

export function getHealthDay(state: HealthFoundationState, date: string): HealthDailyRecord {
  return state.daily[date] ?? makeEmptyHealthDay(date);
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
    ...Object.keys(tracking.logs),
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
    source: "mixed",
  });
}

export function buildDashboardModels(state: HealthFoundationState) {
  const days = Object.values(state.daily).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
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
