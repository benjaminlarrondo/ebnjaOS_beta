import { useEffect, useState } from "react";
import { syncHealthState } from "../lib/repositories/healthRepository";
import { loadHealthState, saveHealthState } from "../lib/health/healthStore";
import type { HealthFoundationState } from "../lib/health/healthTypes";

export function useHealthState() {
  const [healthState, setHealthState] = useState<HealthFoundationState>(() => loadHealthState());

  useEffect(() => {
    let cancelled = false;
    const bootSync = async () => {
      try {
        const remote = await syncHealthState(loadHealthState());
        if (!cancelled) {
          setHealthState(remote);
        }
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
    saveHealthState(healthState);
  }, [healthState]);

  return { healthState, setHealthState };
}
