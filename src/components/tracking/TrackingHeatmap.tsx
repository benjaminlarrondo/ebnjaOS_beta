function cellTone(score: number) {
  if (score >= 100) return "bg-primary";
  if (score >= 75) return "bg-primary/80";
  if (score >= 50) return "bg-primary/55";
  if (score >= 25) return "bg-primary/30";
  return "bg-surface2";
}

export function TrackingHeatmap({
  days,
}: {
  days: Array<{ date: string; overall: number }>;
}) {
  return (
    <section className="card space-y-2">
      <h3 className="text-sm font-semibold text-textp">Heatmap 30 días</h3>
      <p className="text-sm text-texts">Escala: 0, 25, 50, 75, 100.</p>
      <div className="grid grid-cols-6 gap-1 sm:grid-cols-10">
        {days.map((day) => (
          <div
            key={day.date}
            className={`h-5 rounded ${cellTone(day.overall)}`}
            title={`${day.date}: ${day.overall}%`}
          />
        ))}
      </div>
      <div className="flex items-center gap-1 text-[10px] text-textm">
        <span>0</span>
        <span className="h-2.5 w-2.5 rounded bg-surface2" />
        <span className="h-2.5 w-2.5 rounded bg-primary/30" />
        <span className="h-2.5 w-2.5 rounded bg-primary/55" />
        <span className="h-2.5 w-2.5 rounded bg-primary/80" />
        <span className="h-2.5 w-2.5 rounded bg-primary" />
        <span>100</span>
      </div>
    </section>
  );
}
