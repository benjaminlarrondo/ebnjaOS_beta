export function TrackingWeeklyScore({
  daily,
  health,
  growth,
}: {
  daily: number;
  health: number;
  growth: number;
}) {
  return (
    <section className="card space-y-2">
      <h3 className="text-sm font-semibold text-textp">Score diario</h3>
      <p className="text-xs text-texts">Tracking de hoy</p>
      <div className="metric-card">
        <p className="text-xs text-texts">Global</p>
        <p className="metric-value mt-2">{daily}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="inner-card">
          <p className="text-xs text-texts">Salud</p>
          <p className="mt-1 font-semibold text-textp">{health}</p>
        </div>
        <div className="inner-card">
          <p className="text-xs text-texts">Focus</p>
          <p className="mt-1 font-semibold text-textp">{growth}</p>
        </div>
      </div>
    </section>
  );
}
