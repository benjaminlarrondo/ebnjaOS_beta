export function QuickLogCard({ onAction }: { onAction: (type: "workout" | "weight" | "pr" | "recovery") => void }) {
  return (
    <section className="card">
      <h3 className="mb-3 text-sm font-semibold">Quick log</h3>
      <div className="grid grid-cols-2 gap-2">
        <button className="btn-ghost" onClick={() => onAction("workout")}>Registrar entrenamiento</button>
        <button className="btn-ghost" onClick={() => onAction("weight")}>Registrar peso</button>
        <button className="btn-ghost" onClick={() => onAction("pr")}>Registrar PR</button>
        <button className="btn-ghost" onClick={() => onAction("recovery")}>Registrar recovery</button>
      </div>
    </section>
  );
}
