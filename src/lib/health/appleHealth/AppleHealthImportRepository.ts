import { loadHealthFoundationState, saveHealthFoundationState, applyHealthImportPayload } from "../../healthFoundation";
import type { HealthFoundationState, HealthImportPayload } from "../../healthFoundation";
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

function toFoundationPayload(day: AppleHealthDailyImport): HealthImportPayload {
  return {
    date: day.date,
    waterMl: day.waterMl,
    proteinG: day.proteinG,
    sleepHours: day.sleepHours,
    weightKg: day.weightKg,
    workoutsCount: day.workoutsCount,
    stepsCount: day.stepsCount,
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

export function applyAppleHealthImportToFoundation(
  input: AppleHealthRawDay | AppleHealthDailyImport | AppleHealthImportBatch,
): HealthFoundationState {
  const batch = cacheAppleHealthImport(input);
  let next = loadHealthFoundationState();

  for (const day of batch.days) {
    next = applyHealthImportPayload(next, toFoundationPayload(day));
  }

  saveHealthFoundationState(next);
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
