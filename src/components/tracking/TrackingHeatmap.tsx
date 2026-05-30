const labels = ["L", "M", "X", "J", "V", "S", "D"];

function cellTone(score: number) {
  if (score >= 85) return "bg-primary";
  if (score >= 65) return "bg-primary/70";
  if (score >= 40) return "bg-primary/40";
  if (score > 0) return "bg-primary/20";
  return "bg-surface2";
}

export function TrackingHeatmap({
  week,
}: {
  week: Array<{ date: string; globalScore: number }>;
}) {
  return (
    <section className="card space-y-2">
      <h3 className="text-sm font-semibold text-textp">Semana (heatmap)</h3>
      <p className="text-sm text-texts">Vista estilo GitHub de la semana actual.</p>
      <div className="grid grid-cols-7 gap-1">
        {week.map((day, index) => (
          <div key={day.date} className="space-y-1 text-center">
            <p className="text-[10px] text-textm">{labels[index]}</p>
            <div className={`h-6 rounded ${cellTone(day.globalScore)}`} title={`${day.date}: ${day.globalScore}`} />
          </div>
        ))}
      </div>
    </section>
  );
}
