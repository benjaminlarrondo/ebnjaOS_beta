import { useEffect, useMemo, useState } from "react";
import {
  computeDailyScore,
  loadTrackingState,
  saveTrackingState,
  toLocalDateKey,
  type TrackingCategoryId,
  type TrackingHabitDefinition,
  type TrackingHabitId,
  type TrackingState,
  weekDatesFrom,
} from "../lib/tracking";
import { getHealthDay, loadHealthState, saveHealthState, upsertHealthDay } from "../lib/health/healthStore";

const healthHabitMap = {
  water: "water_ml",
  protein: "protein_g",
  sleep: "sleep_hours",
} as const;

function withHealthMetrics(state: TrackingState, dates: string[], getHealthValue: (date: string, habitId: "water" | "protein" | "sleep") => number): TrackingState {
  const nextLogs = { ...state.logs };
  for (const date of dates) {
    const log = nextLogs[date] ?? {};
    nextLogs[date] = {
      ...log,
      water: getHealthValue(date, "water"),
      protein: getHealthValue(date, "protein"),
      sleep: getHealthValue(date, "sleep"),
    };
  }
  return {
    ...state,
    logs: nextLogs,
  };
}

function boolOrDefault(value: number | boolean | undefined) {
  return value === true;
}

export function useTrackingEngine() {
  const [state, setState] = useState<TrackingState>(loadTrackingState);
  const [healthState, setHealthState] = useState(loadHealthState);

  useEffect(() => {
    saveTrackingState(state);
  }, [state]);

  useEffect(() => {
    saveHealthState(healthState);
  }, [healthState]);

  const today = toLocalDateKey();
  const weekDates = useMemo(() => weekDatesFrom(), []);
  const trackedDates = useMemo(
    () => Array.from(new Set([...Object.keys(state.logs), ...weekDates, today])),
    [state.logs, today, weekDates],
  );
  const stateWithHealth = useMemo(
    () =>
      withHealthMetrics(state, trackedDates, (date, habitId) => {
        const day = getHealthDay(healthState, date);
        const metric = healthHabitMap[habitId];
        return Number(day[metric]) || 0;
      }),
    [healthState, state, trackedDates],
  );
  const todayScore = useMemo(() => computeDailyScore(stateWithHealth, today), [stateWithHealth, today]);
  const weekScores = useMemo(
    () => weekDates.map((date) => computeDailyScore(stateWithHealth, date)),
    [stateWithHealth, weekDates],
  );

  const setValue = (habitId: TrackingHabitId, value: number | boolean, date = today) => {
    if (habitId === "water" || habitId === "protein" || habitId === "sleep") {
      const metric = healthHabitMap[habitId];
      setHealthState((prev) => upsertHealthDay(prev, date, { [metric]: Number(value) || 0 }));
      return;
    }
    setState((prev) => ({
      ...prev,
      logs: {
        ...prev.logs,
        [date]: {
          ...prev.logs[date],
          [habitId]: value,
        },
      },
      updatedAt: new Date().toISOString(),
    }));
  };

  const toggleChecklist = (habit: TrackingHabitDefinition, date = today) => {
    const current = stateWithHealth.logs[date]?.[habit.id];
    if (habit.unit === "boolean") {
      setValue(habit.id, !boolOrDefault(current), date);
      return;
    }
    const completion = todayScore.completions[habit.id];
    setValue(habit.id, completion >= 1 ? 0 : habit.defaultTarget, date);
  };

  const getLogValue = (habitId: TrackingHabitId, date = today) => {
    if (habitId === "water" || habitId === "protein" || habitId === "sleep") {
      const metric = healthHabitMap[habitId];
      return getHealthDay(healthState, date)[metric];
    }
    return state.logs[date]?.[habitId];
  };

  const healthHabits = state.habits.filter((habit) => habit.category === "health" && habit.active);
  const growthHabits = state.habits.filter((habit) => habit.category === "growth" && habit.active);

  const categoryScore = (category: TrackingCategoryId) =>
    category === "health" ? todayScore.healthScore : todayScore.growthScore;

  return {
    state: stateWithHealth,
    today,
    todayScore,
    weekScores,
    weekDates,
    setValue,
    toggleChecklist,
    getLogValue,
    healthHabits,
    growthHabits,
    categoryScore,
  };
}
