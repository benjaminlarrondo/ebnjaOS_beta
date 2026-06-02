import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { buildRouter } from "./router";
import { loadHealthState, saveHealthState } from "../lib/health/healthStore";
import { syncHealthState } from "../lib/repositories/healthRepository";
import { syncTrackingState } from "../lib/repositories/trackingRepository";
import { loadTrackingState, saveTrackingState } from "../lib/tracking";
import { startBackgroundSync } from "../services/sync/syncManager";

export default function App() {
  useEffect(() => {
    const bootPersistence = async () => {
      try {
        const [tracking, health] = await Promise.all([
          syncTrackingState(loadTrackingState()),
          syncHealthState(loadHealthState()),
        ]);
        saveTrackingState(tracking);
        saveHealthState(health);
      } catch {
        // fallback local only
      }
    };
    void bootPersistence();

    window.setTimeout(() => {
      void startBackgroundSync();
    }, 0);
  }, []);

  return <RouterProvider router={buildRouter()} />;
}
