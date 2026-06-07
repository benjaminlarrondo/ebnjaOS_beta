import { useCallback, useEffect, useState } from "react";
import {
  completeFitnessSession,
  createFitnessSession,
  hydrateFitnessExecutionStateFromRemote,
  loadFitnessExecutionCache,
  updateFitnessSetLog,
} from "../lib/repositories/fitnessExecutionRepository";
import type { FitnessExecutionCache } from "../lib/fitness/fitnessExecutionTypes";

export function useFitnessExecution() {
  const [executionState, setExecutionState] = useState<FitnessExecutionCache>(() => loadFitnessExecutionCache());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await hydrateFitnessExecutionStateFromRemote();
      setExecutionState(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la librería de entrenamiento.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      setLoading(true);
      setError(null);
      try {
        const next = await hydrateFitnessExecutionStateFromRemote();
        if (!cancelled) {
          setExecutionState(next);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudo cargar la librería de entrenamiento.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void boot();

    return () => {
      cancelled = true;
    };
  }, []);

  const startSession = useCallback(async (workoutDayId: string, date: string, notes = "") => {
    const session = await createFitnessSession(workoutDayId, date, notes);
    setExecutionState(loadFitnessExecutionCache());
    return session;
  }, []);

  const saveSet = useCallback(
    async (params: { sessionId: string; exerciseName: string; setNumber: number; weight: number; reps: number; completed: boolean }) => {
      const row = await updateFitnessSetLog(params);
      setExecutionState(loadFitnessExecutionCache());
      return row;
    },
    [],
  );

  const finishSession = useCallback(async (sessionId: string, durationMinutes: number, notes = "") => {
    const session = await completeFitnessSession(sessionId, durationMinutes, notes);
    setExecutionState(loadFitnessExecutionCache());
    return session;
  }, []);

  return {
    executionState,
    loading,
    error,
    refresh,
    startSession,
    saveSet,
    finishSession,
  };
}
