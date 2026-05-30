function statusClasses(status: "good" | "mid" | "low") {
  if (status === "good") return "border-[#2a4730] text-[#9ed6a8]";
  if (status === "mid") return "border-primary/35 text-primary";
  return "border-borderc text-textm";
}

export function RecoveryCard({ metrics }: { metrics: Record<string, { label: string; value: number; status: "good" | "mid" | "low" }> }) {
  return (
    <section className="card">
      <h3 className="mb-3 text-sm font-semibold">Recovery</h3>
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
