export function TrackingTrendChart({
  week,
}: {
  week: Array<{ date: string; globalScore: number }>;
}) {
  const avg = Math.round(week.reduce((sum, day) => sum + day.globalScore, 0) / Math.max(1, week.length));
  return (
    <section className="card space-y-2">
      <h3 className="text-sm font-semibold text-textp">Tendencia semanal</h3>
      <p className="text-sm text-texts">Promedio semanal: {avg}</p>
      <div className="flex h-24 items-end gap-1">
        {week.map((day) => (
          <span key={day.date} className="w-full rounded-t bg-primary/45" style={{ height: `${Math.max(8, day.globalScore)}%` }} />
        ))}
      </div>
    </section>
  );
}
