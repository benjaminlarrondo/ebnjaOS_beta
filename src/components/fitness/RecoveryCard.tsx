function statusClasses(status: "good" | "mid" | "low") {
  if (status === "good") return "bg-[#eaf5ea] text-[#3f6f3f]";
  if (status === "mid") return "bg-[#fff7e0] text-[#8b6a1b]";
  return "bg-[#fdeaea] text-[#9a3f3f]";
}

export function RecoveryCard({ metrics }: { metrics: Record<string, { label: string; value: number; status: "good" | "mid" | "low" }> }) {
  return (
    <section className="card">
      <h3 className="mb-3 text-sm font-semibold">Recovery</h3>
      <div className="grid grid-cols-2 gap-2">
        {Object.values(metrics).map((metric) => (
          <div key={metric.label} className="rounded-xl border border-borderc p-2.5">
            <p className="text-xs text-texts">{metric.label}</p>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-sm font-semibold">{metric.value}</p>
              <span className={`rounded-full px-2 py-1 text-[10px] ${statusClasses(metric.status)}`}>{metric.status === "good" ? "Bien" : metric.status === "mid" ? "Medio" : "Bajo"}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
