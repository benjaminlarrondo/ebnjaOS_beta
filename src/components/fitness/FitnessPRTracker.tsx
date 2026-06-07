import { FitnessPRDashboard } from "./FitnessPRDashboard";
import { useFitnessExecution } from "../../hooks/useFitnessExecution";

export function FitnessPRTracker() {
  const { executionState } = useFitnessExecution();

  return <FitnessPRDashboard executionState={executionState} />;
}
