export function TrackingTrendChart({
  days,
}: {
  days: Array<{ date: string; overall: number }>;
}) {
  const avg = Math.round(days.reduce((sum, day) => sum + day.overall, 0) / Math.max(1, days.length));
  const maxPoints = Math.max(1, days.length - 1);
  const points = days
    .map((day, index) => {
      const x = (index / maxPoints) * 100;
      const y = 100 - day.overall;
      return `${x},${Math.max(0, Math.min(100, y))}`;
    })
    .join(" ");

  return (
    <section className="card space-y-2">
      <h3 className="text-sm font-semibold text-textp">Trend 30 días</h3>
      <p className="text-sm text-texts">Promedio: {avg}%</p>
      <svg viewBox="0 0 100 100" className="h-24 w-full rounded-xl border border-borderc bg-surface p-1">
        <polyline fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" points={points} />
      </svg>
    </section>
  );
}
