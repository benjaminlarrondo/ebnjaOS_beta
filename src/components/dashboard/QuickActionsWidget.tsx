import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { AppModule } from "../../lib/navigation";

export function QuickActionsWidget({
  primaryActions,
  secondaryModules,
}: {
  primaryActions: AppModule[];
  secondaryModules: AppModule[];
}) {
  return (
    <>
      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="eyebrow">Acciones</p>
            <h2 className="mt-1 text-xl font-semibold text-textp">Movimiento rapido</h2>
          </div>
          <CheckCircle2 className="h-5 w-5 text-primary" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {primaryActions.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.id} to={module.path} className="rounded-2xl border border-borderc bg-white p-3 text-sm font-medium text-textp shadow-sm transition active:scale-[0.99]">
                <Icon className="mb-3 h-4 w-4 text-primary" />
                {module.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-textp">Sistema</h2>
          <Link to="/settings" className="flex items-center gap-1 text-xs font-medium text-primary">
            Mas <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {secondaryModules.map((module) => (
            <Link key={module.id} to={module.path} className="btn-ghost text-center">
              {module.label}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
