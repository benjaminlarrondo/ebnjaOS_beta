export function TrackingStreakStats({
  currentStreak,
  bestStreak,
  consistency30d,
}: {
  currentStreak: number;
  bestStreak: number;
  consistency30d: number;
}) {
  return (
    <section className="card space-y-2">
      <h3 className="text-sm font-semibold text-textp">Streak Engine</h3>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="inner-card">
          <p className="text-xs text-texts">🔥 Streak actual</p>
          <p className="mt-1 text-lg font-semibold text-textp">{currentStreak}</p>
        </div>
        <div className="inner-card">
          <p className="text-xs text-texts">🏆 Mejor histórico</p>
          <p className="mt-1 text-lg font-semibold text-textp">{bestStreak}</p>
        </div>
        <div className="inner-card">
          <p className="text-xs text-texts">📈 Consistencia 30 días</p>
          <p className="mt-1 text-lg font-semibold text-textp">{consistency30d}%</p>
        </div>
      </div>
    </section>
  );
}
