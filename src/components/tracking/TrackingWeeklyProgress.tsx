export function TrackingWeeklyProgress({ weeklyPct }: { weeklyPct: number }) {
  return (
    <section className="card space-y-2">
      <h3 className="text-sm font-semibold text-textp">Weekly Progress</h3>
      <p className="text-xs text-texts">{weeklyPct}% semanal</p>
      <div className="h-2.5 w-full rounded-full bg-surface2">
        <div className="h-2.5 rounded-full bg-primary transition-all" style={{ width: `${Math.max(0, Math.min(100, weeklyPct))}%` }} />
      </div>
    </section>
  );
}
