export function TrackingWeeklyScore({
  daily,
  completed,
  total,
}: {
  daily: number;
  completed: number;
  total: number;
}) {
  return (
    <section className="card space-y-2 py-3">
      <h3 className="text-sm font-semibold text-textp">Score hoy</h3>
      <p className="text-xs text-texts">Hábitos completados: {completed} / {total}</p>
      <div className="flex items-end justify-between rounded-xl border border-borderc bg-surface px-3 py-2">
        <p className="text-3xl font-semibold leading-none text-textp">{daily}%</p>
        <p className="text-sm text-texts">
          {completed}/{total} hábitos
        </p>
      </div>
    </section>
  );
}
