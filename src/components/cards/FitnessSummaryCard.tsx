import type { FitnessWorkout } from "../../types/fitness";
export function FitnessSummaryCard({ workout }: { workout: FitnessWorkout }) {
  return <div className="rounded-xl border border-borderc p-3"><p className="text-sm font-medium">{workout.title}</p><p className="text-xs text-texts">{workout.type} · {workout.duration_minutes} min</p></div>;
}
