import { useEffect, useMemo, useRef, useState } from "react";
import { pushHealthState, syncHealthState } from "../lib/repositories/healthRepository";
import { pushTrackingState, syncTrackingState } from "../lib/repositories/trackingRepository";
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
  const healthMutationChainRef = useRef<Promise<void>>(Promise.resolve());
  const trackingMutationChainRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    const bootSync = async () => {
      try {
        const [trackingRemote, healthRemote] = await Promise.all([
          syncTrackingState(loadTrackingState()),
          syncHealthState(loadHealthState()),
        ]);
        if (cancelled) return;
        setState(trackingRemote);
        setHealthState(healthRemote);
      } catch {
        // offline/local fallback
      }
    };
    void bootSync();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const enqueueHealthMutation = (run: () => Promise<void>) => {
    healthMutationChainRef.current = healthMutationChainRef.current.then(run).catch(() => {});
    return healthMutationChainRef.current;
  };

  const enqueueTrackingMutation = (run: () => Promise<void>) => {
    trackingMutationChainRef.current = trackingMutationChainRef.current.then(run).catch(() => {});
    return trackingMutationChainRef.current;
  };

  const setValue = async (habitId: TrackingHabitId, value: number | boolean, date = today) => {
    if (habitId === "water" || habitId === "protein" || habitId === "sleep") {
      const metric = healthHabitMap[habitId];
      await enqueueHealthMutation(async () => {
        try {
          const base = await syncHealthState(loadHealthState());
          const nextHealth = upsertHealthDay(base, date, { [metric]: Number(value) || 0 });
          await pushHealthState(nextHealth);
          const remote = await syncHealthState(nextHealth);
          setHealthState(remote);
        } catch {
          const nextHealth = upsertHealthDay(loadHealthState(), date, { [metric]: Number(value) || 0 });
          setHealthState(nextHealth);
        }
      });
      return;
    }
    await enqueueTrackingMutation(async () => {
      const base = loadTrackingState();
      const nextTracking: TrackingState = {
        ...base,
        logs: {
          ...base.logs,
          [date]: {
            ...base.logs[date],
            [habitId]: value,
          },
        },
        updatedAt: new Date().toISOString(),
      };
      try {
        await pushTrackingState(nextTracking);
        const remote = await syncTrackingState(nextTracking);
        setState(remote);
      } catch {
        setState(nextTracking);
      }
    });
  };

  const setValueLocal = (habitId: TrackingHabitId, value: number | boolean, date = today) => {
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
      void setValue(habit.id, !boolOrDefault(current), date);
      return;
    }
    const completion = todayScore.completions[habit.id];
    if (habit.id === "water" || habit.id === "protein" || habit.id === "sleep") {
      void setValue(habit.id, completion >= 1 ? 0 : habit.defaultTarget, date);
      return;
    }
    setValueLocal(habit.id, completion >= 1 ? 0 : habit.defaultTarget, date);
    void setValue(habit.id, completion >= 1 ? 0 : habit.defaultTarget, date);
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
