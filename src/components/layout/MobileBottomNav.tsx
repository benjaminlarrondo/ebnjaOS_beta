import { NavLink } from "react-router-dom";
import { mobileNavModules } from "../../lib/navigation";

export function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.35rem)] z-30 flex items-center justify-between gap-1 rounded-[18px] border border-borderc bg-surface px-2 py-1.5 md:hidden">
      {mobileNavModules.map((module) => {
        const Icon = module.icon;
        return (
          <NavLink
            key={module.id}
            to={module.path}
            className={({ isActive }) =>
              `min-w-0 flex-1 rounded-xl border px-2 py-2 text-center text-[10px] transition ${
                isActive
                  ? "border-primary/35 bg-primary/15 font-medium text-primary"
                  : "border-transparent text-textp hover:border-primary/20 hover:bg-primary/10 hover:text-primary"
              }`
            }
          >
            <span className="flex flex-col items-center gap-1.5 leading-none">
              <Icon className="h-4 w-4" />
              <span className="truncate">{module.mobileLabel ?? module.label}</span>
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
