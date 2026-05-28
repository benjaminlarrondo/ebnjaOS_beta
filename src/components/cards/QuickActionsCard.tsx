import { Link } from "react-router-dom";
import { quickActionModules } from "../../lib/navigation";

export function QuickActionsCard() {
  return (
    <section className="card">
      <h3 className="mb-3 text-sm font-semibold">Accesos rapidos</h3>
      <div className="grid grid-cols-2 gap-2">
        {quickActionModules.map((module) => (
          <Link key={module.id} to={module.path} className="btn-ghost text-center">{module.label}</Link>
        ))}
      </div>
    </section>
  );
}
