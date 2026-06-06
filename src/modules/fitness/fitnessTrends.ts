import { db } from "../../lib/store";
import { toDateKey } from "../../lib/health/healthMetrics";
import type { HealthFoundationState } from "../../lib/health/healthTypes";
import { loadFitnessPRState } from "../../lib/repositories/fitnessPRRepository";

type FitnessState = ReturnType<typeof db.getFitnessState>;

type TrendKey = "weight" | "sleep" | "protein" | "water" | "strength";

export type FitnessTrendCardModel = {
  key: TrendKey;
  label: string;
  unit: string;
  currentValue: number | null;
  currentLabel: string;
  trendLabel: string;
  variationLabel: string;
  sparkline: number[];
  sourceLabel: string;
  tone: "primary" | "text" | "accent";
};

function getDateRange(days: number, today = new Date()) {
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() - (days - 1 - index));
    return date.toISOString().slice(0, 10);
  });
}

function toSeries(values: Array<number | null>) {
  let lastKnown = 0;
  return values.map((value) => {
    if (typeof value === "number" && Number.isFinite(value)) {
      lastKnown = value;
      return value;
    }
    return lastKnown;
  });
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function lastValue(values: Array<number | null>) {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

function formatDelta(value: number, unit: string, decimals = 1) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)} ${unit}`;
}

function formatTrend(delta: number, decimals = 0) {
  if (Math.abs(delta) < 0.01) return "→ estable";
  return `${delta > 0 ? "↗" : "↘"} ${Math.abs(delta).toFixed(decimals)}`;
}

function getWindowDelta(values: number[]) {
  if (values.length < 14) return { delta: 0, percent: 0 };
  const recent = average(values.slice(-7));
  const previous = average(values.slice(-14, -7));
  const delta = recent - previous;
  const percent = previous === 0 ? 0 : (delta / previous) * 100;
  return { delta, percent };
}

function getHealthSeries(healthState: HealthFoundationState, key: "weight_kg" | "sleep_hours" | "protein_g" | "water_ml", dates: string[]) {
  return dates.map((date) => {
    const day = healthState.daily?.[date];
    return day ? day[key] : null;
  });
}

function buildPrSeries(today = new Date()) {
  const prState = loadFitnessPRState();
  const dates = getDateRange(30, today);
  const movementAverages = dates.map((date) => {
    const latestValues = Object.values(prState).map((entries) => {
      if (!entries) return null;
      const validEntries = entries.filter((entry) => entry.date <= date);
      return validEntries[validEntries.length - 1]?.value ?? null;
    }).filter((value): value is number => typeof value === "number" && Number.isFinite(value));

    if (!latestValues.length) return null;
    return average(latestValues);
  });
  return movementAverages;
}

function buildWorkoutLoadSeries(fitnessState: FitnessState, dates: string[]) {
  return dates.map((date) => {
    const sameDay = fitnessState.exerciseWeightLogs.filter((log) => log.date === date);
    if (!sameDay.length) return null;
    const sessionLoads = sameDay.map((log) => log.exercises.reduce((sum, exercise) => sum + exercise.weightKg, 0));
    return average(sessionLoads);
  });
}

function buildStrengthSeries(fitnessState: FitnessState, dates: string[]) {
  const prSeries = buildPrSeries();
  const prValues = prSeries.some((value) => typeof value === "number" && value > 0) ? prSeries : null;
  if (prValues) return prValues;
  return buildWorkoutLoadSeries(fitnessState, dates);
}

function buildMetricCard(options: {
  key: TrendKey;
  label: string;
  unit: string;
  sourceLabel: string;
  rawSeries: Array<number | null>;
  precision?: number;
  tone?: "primary" | "text" | "accent";
  currentFormatter?: (value: number) => string;
}) : FitnessTrendCardModel {
  const filledSeries = toSeries(options.rawSeries);
  const currentValue = lastValue(options.rawSeries);
  const { delta, percent } = getWindowDelta(filledSeries);
  const currentLabel = currentValue === null
    ? "Sin datos"
    : options.currentFormatter
      ? options.currentFormatter(currentValue)
      : `${Math.round(currentValue)} ${options.unit}`;

  return {
    key: options.key,
    label: options.label,
    unit: options.unit,
    currentValue,
    currentLabel,
    trendLabel: currentValue === null ? "Sin historial" : formatTrend(percent, 0),
    variationLabel: currentValue === null ? "Sin variación" : formatDelta(delta, options.unit, options.precision ?? 1),
    sparkline: filledSeries.length ? filledSeries : [0],
    sourceLabel: options.sourceLabel,
    tone: options.tone ?? "text",
  };
}

export function buildFitnessTrendCards(healthState: HealthFoundationState, fitnessState: FitnessState, today = toDateKey()) {
  const dates = getDateRange(30, new Date(`${today}T12:00:00`));
  const weightSeries = getHealthSeries(healthState, "weight_kg", dates);
  const sleepSeries = getHealthSeries(healthState, "sleep_hours", dates);
  const proteinSeries = getHealthSeries(healthState, "protein_g", dates);
  const waterSeries = getHealthSeries(healthState, "water_ml", dates);
  const strengthSeries = buildStrengthSeries(fitnessState, dates);

  const latestWeight = lastValue(weightSeries) ?? fitnessState.weeklyTracking.weight ?? fitnessState.bodyWeightKg ?? null;
  const latestStrength = lastValue(strengthSeries);

  const weightCard = buildMetricCard({
    key: "weight",
    label: "Peso",
    unit: "kg",
    sourceLabel: "health_states · fitness_body_metrics",
    rawSeries: weightSeries,
    precision: 1,
    tone: "primary",
    currentFormatter: (value) => `${value.toFixed(1)} kg`,
  });

  const sleepCard = buildMetricCard({
    key: "sleep",
    label: "Sueño",
    unit: "h",
    sourceLabel: "health_states",
    rawSeries: sleepSeries,
    precision: 1,
    tone: "accent",
    currentFormatter: (value) => `${value.toFixed(1)} h`,
  });

  const proteinCard = buildMetricCard({
    key: "protein",
    label: "Proteína",
    unit: "g",
    sourceLabel: "health_states",
    rawSeries: proteinSeries,
    precision: 0,
    tone: "primary",
    currentFormatter: (value) => `${Math.round(value)} g`,
  });

  const waterCard = buildMetricCard({
    key: "water",
    label: "Agua",
    unit: "ml",
    sourceLabel: "health_states",
    rawSeries: waterSeries,
    precision: 0,
    tone: "accent",
    currentFormatter: (value) => `${Math.round(value)} ml`,
  });

  const strengthCard = buildMetricCard({
    key: "strength",
    label: "Fuerza",
    unit: "kg",
    sourceLabel: "fitness_prs · fitness_progress_logs",
    rawSeries: strengthSeries,
    precision: 1,
    tone: "text",
    currentFormatter: (value) => `${value.toFixed(1)} kg`,
  });

  return [
    {
      ...weightCard,
      currentValue: latestWeight,
      currentLabel: latestWeight === null ? "Sin datos" : `${latestWeight.toFixed(1)} kg`,
      sparkline:
        latestWeight !== null && weightSeries.every((value) => value === null || value === 0)
          ? [...weightCard.sparkline.slice(0, -1), latestWeight]
          : weightCard.sparkline,
    },
    sleepCard,
    proteinCard,
    waterCard,
    {
      ...strengthCard,
      currentValue: latestStrength,
    },
  ];
}

export function normalizeTrendCards(cards: FitnessTrendCardModel[]) {
  return cards.map((card) => ({
    ...card,
    sparkline: card.sparkline.length ? card.sparkline : [0],
  }));
}
