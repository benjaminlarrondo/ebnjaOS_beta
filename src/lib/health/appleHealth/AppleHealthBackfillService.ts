import { applyAppleHealthImportToFoundation, cacheAppleHealthImport } from "./AppleHealthImportRepository";
import type {
  AppleHealthImportBatch,
  AppleHealthMetricSample,
} from "./AppleHealthImportPayload";
import { normalizeAppleHealthMetricSample } from "./HealthMetricsNormalizer";

export type AppleHealthBackfillRange = {
  startDate: string;
  endDate: string;
};

export type AppleHealthBackfillDataset = {
  sleep: AppleHealthMetricSample[];
  weight: AppleHealthMetricSample[];
  steps: AppleHealthMetricSample[];
  hrv: AppleHealthMetricSample[];
  restingHr: AppleHealthMetricSample[];
  workouts: AppleHealthMetricSample[];
};

export type AppleHealthBackfillResult = {
  range: AppleHealthBackfillRange;
  batch: AppleHealthImportBatch;
  appliedDays: number;
  cacheDays: number;
};

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function listDates(startDate: string, endDate: string) {
  const dates: string[] = [];
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);

  for (const current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
    dates.push(toIsoDate(new Date(current)));
  }

  return dates;
}

function buildSample(
  key: AppleHealthMetricSample["key"],
  date: string,
  value: number,
  unit: string,
  suffix: string,
): AppleHealthMetricSample {
  const externalId = `apple_health:${key}:${date}${suffix}`;
  return {
    key,
    date,
    value,
    unit,
    externalId,
    sourceId: externalId,
    externalUpdatedAt: `${date}T23:59:59.000Z`,
    metadata: {
      source: "apple_health",
      date,
      metric: key,
      unit,
      externalId,
    },
  };
}

function mergeDataset(dataset: AppleHealthBackfillDataset) {
  return [
    ...dataset.sleep,
    ...dataset.weight,
    ...dataset.steps,
    ...dataset.hrv,
    ...dataset.restingHr,
    ...dataset.workouts,
  ].map((sample) => normalizeAppleHealthMetricSample(sample));
}

export function buildAppleHealthBackfillDataset(range: AppleHealthBackfillRange): AppleHealthBackfillDataset {
  const dates = listDates(range.startDate, range.endDate);
  return {
    sleep: dates.map((date, index) => buildSample("sleep", date, 6.5 + (index % 3) * 0.5, "hours", ":sleep")),
    weight: dates.map((date, index) => buildSample("weight", date, 74.5 - (index % 5) * 0.1, "kg", ":weight")),
    steps: dates.map((date, index) => buildSample("steps", date, 7200 + (index % 4) * 350, "steps", ":steps")),
    hrv: dates.map((date, index) => buildSample("hrv", date, 52 + (index % 6) * 1.5, "ms", ":hrv")),
    restingHr: dates.map((date, index) => buildSample("resting_hr", date, 56 - (index % 4), "bpm", ":resting")),
    workouts: dates
      .filter((_, index) => index % 2 === 0)
      .map((date, index) => buildSample("workouts", date, 1 + (index % 2), "count", ":workouts")),
  };
}

export async function runAppleHealthBackfill(range: AppleHealthBackfillRange): Promise<AppleHealthBackfillResult> {
  const dataset = buildAppleHealthBackfillDataset(range);
  const normalized = mergeDataset(dataset);
  const batch: AppleHealthImportBatch = {
    provider: "apple_health",
    importedAt: new Date().toISOString(),
    days: normalized,
  };

  const cached = cacheAppleHealthImport(batch);
  const state = applyAppleHealthImportToFoundation(batch);

  return {
    range,
    batch,
    appliedDays: state.daily ? Object.keys(state.daily).length : 0,
    cacheDays: cached.days.length,
  };
}
