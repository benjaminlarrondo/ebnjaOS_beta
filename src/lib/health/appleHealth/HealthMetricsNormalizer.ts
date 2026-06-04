import type {
  AppleHealthDailyImport,
  AppleHealthImportBatch,
  AppleHealthMetricSample,
  AppleHealthRawDay,
} from "./AppleHealthImportPayload";

function roundValue(value: unknown, digits = 0) {
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function toText(value: unknown) {
  return typeof value === "string" && value.trim().length ? value : undefined;
}

function normalizeDailyImport(input: AppleHealthRawDay): AppleHealthDailyImport {
  return {
    date: input.date,
    waterMl: roundValue(input.waterMl ?? input.metadata?.waterMl) ?? undefined,
    proteinG: roundValue(input.proteinG ?? input.metadata?.proteinG) ?? undefined,
    sleepHours: roundValue(input.sleepHours ?? input.metadata?.sleepHours, 1) ?? undefined,
    weightKg: roundValue(input.weightKg ?? input.metadata?.weightKg, 1) ?? undefined,
    stepsCount: toNumber(input.stepsCount ?? input.metadata?.stepsCount),
    hrvMs: roundValue(input.hrvMs ?? input.metadata?.hrvMs, 1) ?? undefined,
    restingHr: toNumber(input.restingHr ?? input.metadata?.restingHr),
    workoutsCount: toNumber(input.workoutsCount ?? input.metadata?.workoutsCount),
    source: "apple_health",
    externalId: toText(input.externalId ?? input.sourceId ?? input.metadata?.externalId),
    sourceId: input.sourceId,
    externalUpdatedAt: toText(input.externalUpdatedAt ?? input.metadata?.externalUpdatedAt),
    metadata: input.metadata ?? {},
  };
}

export function normalizeAppleHealthMetricSample(sample: AppleHealthMetricSample): AppleHealthDailyImport {
  const base: AppleHealthDailyImport = {
    date: sample.date,
    source: "apple_health",
    externalId: toText(sample.externalId ?? sample.sourceId ?? sample.metadata?.externalId),
    sourceId: sample.sourceId,
    externalUpdatedAt: toText(sample.externalUpdatedAt ?? sample.metadata?.externalUpdatedAt),
    metadata: sample.metadata ?? {},
  };

  switch (sample.key) {
    case "water":
      return { ...base, waterMl: roundValue(sample.value) };
    case "protein":
      return { ...base, proteinG: roundValue(sample.value) };
    case "sleep":
      return { ...base, sleepHours: roundValue(sample.value, 1) };
    case "weight":
      return { ...base, weightKg: roundValue(sample.value, 1) };
    case "steps":
      return { ...base, stepsCount: Math.max(0, Math.round(sample.value)) };
    case "hrv":
      return { ...base, hrvMs: roundValue(sample.value, 1) };
    case "resting_hr":
      return { ...base, restingHr: Math.max(0, Math.round(sample.value)) };
    case "workouts":
      return { ...base, workoutsCount: Math.max(0, Math.round(sample.value)) };
    default:
      return base;
  }
}

export function normalizeAppleHealthDailyImport(input: AppleHealthRawDay): AppleHealthDailyImport {
  return normalizeDailyImport(input);
}

export function normalizeAppleHealthBatch(
  input: AppleHealthDailyImport[] | AppleHealthRawDay[] | AppleHealthImportBatch,
): AppleHealthImportBatch {
  if (Array.isArray(input)) {
    return {
      provider: "apple_health",
      importedAt: new Date().toISOString(),
      days: input.map((day) => ("source" in day ? day : normalizeDailyImport(day as AppleHealthRawDay))),
    };
  }

  return {
    provider: input.provider,
    importedAt: input.importedAt,
    days: input.days.map((day) => normalizeDailyImport(day)),
  };
}
