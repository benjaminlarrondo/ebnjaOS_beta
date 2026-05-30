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

function boolOrDefault(value: number | boolean | undefined) {
  return value === true;
}

export function useTrackingEngine() {
  const [state, setState] = useState<TrackingState>(loadTrackingState);

  useEffect(() => {
    saveTrackingState(state);
  }, [state]);

  const today = toLocalDateKey();
  const todayScore = useMemo(() => computeDailyScore(state, today), [state, today]);

  const weekDates = useMemo(() => weekDatesFrom(), []);
  const weekScores = useMemo(
    () => weekDates.map((date) => computeDailyScore(state, date)),
    [state, weekDates],
  );

  const setValue = (habitId: TrackingHabitId, value: number | boolean, date = today) => {
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
    const current = state.logs[date]?.[habit.id];
    if (habit.unit === "boolean") {
      setValue(habit.id, !boolOrDefault(current), date);
      return;
    }
    const completion = todayScore.completions[habit.id];
    setValue(habit.id, completion >= 1 ? 0 : habit.defaultTarget, date);
  };

  const getLogValue = (habitId: TrackingHabitId, date = today) => state.logs[date]?.[habitId];

  const healthHabits = state.habits.filter((habit) => habit.category === "health" && habit.active);
  const growthHabits = state.habits.filter((habit) => habit.category === "growth" && habit.active);

  const categoryScore = (category: TrackingCategoryId) =>
    category === "health" ? todayScore.healthScore : todayScore.growthScore;

  return {
    state,
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
