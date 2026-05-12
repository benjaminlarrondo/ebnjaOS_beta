export function StrengthProgressCard({ rows }: { rows: Array<{ movement: string; value: string; trend: string }> }) {
  return (
    <section className="card">
      <h3 className="mb-3 text-sm font-semibold">Progreso de fuerza</h3>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.movement} className="flex items-center justify-between rounded-xl border border-borderc p-2.5">
            <p className="text-sm">{row.movement}</p>
            <div className="text-right">
              <p className="text-sm font-medium">{row.value}</p>
              <p className="text-xs text-accent">{row.trend}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
