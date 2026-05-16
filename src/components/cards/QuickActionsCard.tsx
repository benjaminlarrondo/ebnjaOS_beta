import { Link } from "react-router-dom";

const items = [
  ["/search", "Buscar"],
  ["/review", "Review"],
  ["/goals", "Goals"],
  ["/qa", "QA"],
  ["/tasks", "Tareas"],
  ["/calendar", "Calendario"],
  ["/fitness", "Fitness"],
  ["/notes", "Notas"],
] as const;

export function QuickActionsCard() {
  return (
    <section className="card">
      <h3 className="mb-3 text-sm font-semibold">Accesos rápidos</h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map(([to, label]) => (
          <Link key={to} to={to} className="btn-ghost text-center">{label}</Link>
        ))}
      </div>
    </section>
  );
}
