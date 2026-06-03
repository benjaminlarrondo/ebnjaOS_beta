import { TrackingHeatmap } from "../tracking/TrackingHeatmap";
import { TrackingStreakStats } from "../tracking/TrackingStreakStats";
import { TrackingTrendChart } from "../tracking/TrackingTrendChart";
import { TrackingWeeklyProgress } from "../tracking/TrackingWeeklyProgress";
import type { FitnessConsistencySummary } from "../../modules/fitness/fitnessConsistency";

export function FitnessConsistencyLayer({ summary }: { summary: FitnessConsistencySummary }) {
  return (
    <section className="space-y-2.5">
      <div className="grid gap-2.5 lg:grid-cols-2">
        <TrackingHeatmap days={summary.days} />
        <TrackingStreakStats
          currentStreak={summary.currentStreak}
          bestStreak={summary.bestStreak}
          consistency30d={summary.consistency30d}
        />
      </div>
      <div className="grid gap-2.5 lg:grid-cols-[1fr_1.2fr]">
        <TrackingWeeklyProgress weeklyPct={summary.weeklyPct} />
        <TrackingTrendChart days={summary.days} />
      </div>
    </section>
  );
}
