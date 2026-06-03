function statusClasses(status: "good" | "mid" | "low") {
  if (status === "good") return "border-[#2a4730] text-[#9ed6a8]";
  if (status === "mid") return "border-primary/35 text-primary";
  return "border-borderc text-textm";
}

export function RecoveryCard({
  metrics,
  recoveryScore,
  statusLabel,
  recommendation,
  badge,
}: {
  metrics: Record<string, { label: string; value: number; status: "good" | "mid" | "low" }>;
  recoveryScore: number;
  statusLabel: string;
  recommendation: string;
  badge: "good" | "mid" | "low";
}) {
  return (
    <section className="card">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="eyebrow">Recovery Intelligence</p>
          <h3 className="text-sm font-semibold text-textp">Estado y recomendación</h3>
        </div>
        <span className={`rounded-full border px-2 py-1 text-[10px] ${statusClasses(badge)}`}>{statusLabel}</span>
      </div>
      <div className="mb-3 rounded-2xl border border-borderc bg-surface px-3 py-2">
        <p className="text-xs text-texts">Recovery Score</p>
        <p className="metric-value mt-1">{recoveryScore}%</p>
        <p className="mt-1 text-xs text-texts">{recommendation}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Object.values(metrics).map((metric) => (
          <div key={metric.label} className="inner-card">
            <p className="text-xs text-texts">{metric.label}</p>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-sm font-semibold">{metric.value}</p>
              <span className={`rounded-full border px-2 py-1 text-[10px] ${statusClasses(metric.status)}`}>{metric.status === "good" ? "Bien" : metric.status === "mid" ? "Medio" : "Bajo"}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
