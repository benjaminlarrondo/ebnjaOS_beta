import { TrackingHeatmap } from "../tracking/TrackingHeatmap";
import { TrackingStreakStats } from "../tracking/TrackingStreakStats";
import { TrackingTrendChart } from "../tracking/TrackingTrendChart";
import { TrackingWeeklyProgress } from "../tracking/TrackingWeeklyProgress";
import type { FitnessConsistencySummary } from "../../modules/fitness/fitnessConsistency";

export function FitnessConsistencyLayer({
  summary,
  compactHeatmap = false,
}: {
  summary: FitnessConsistencySummary;
  compactHeatmap?: boolean;
}) {
  return (
    <section className="space-y-2.5">
      <TrackingHeatmap days={summary.days} compact={compactHeatmap} />
      <div className="grid gap-2.5 lg:grid-cols-2">
        <TrackingStreakStats
          currentStreak={summary.currentStreak}
          bestStreak={summary.bestStreak}
          consistency30d={summary.consistency30d}
        />
        <TrackingWeeklyProgress weeklyPct={summary.weeklyPct} />
      </div>
      <TrackingTrendChart days={summary.days} />
    </section>
  );
}
