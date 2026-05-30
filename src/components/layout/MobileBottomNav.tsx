import { NavLink } from "react-router-dom";
import { mobileNavModules } from "../../lib/navigation";

export function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.35rem)] z-30 flex items-center justify-between gap-1 rounded-[18px] border border-borderc bg-surface px-2 py-1.5 md:hidden">
      {mobileNavModules.map((module) => (
        <NavLink
          key={module.id}
          to={module.path}
          className={({ isActive }) =>
            `min-w-0 flex-1 truncate rounded-xl border px-2 py-2 text-center text-[11px] transition ${
              isActive
                ? "border-primary/35 bg-primary/15 font-medium text-primary"
                : "border-transparent text-textp hover:border-primary/20 hover:bg-primary/10 hover:text-primary"
            }`
          }
        >
          {module.mobileLabel ?? module.label}
        </NavLink>
      ))}
    </nav>
  );
}
