import { NavLink } from "react-router-dom";
import { mobileNavModules } from "../../lib/navigation";

export function MobileBottomNav() {
  return (
    <nav className="sticky top-0 z-20 mb-3 flex gap-2 overflow-x-auto rounded-xl border border-borderc bg-white/95 p-2 backdrop-blur lg:hidden">
      {mobileNavModules.map((module) => (
        <NavLink
          key={module.id}
          to={module.path}
          className={({ isActive }) =>
            `shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-center text-xs ${isActive ? "bg-[#eef1f6] text-primary" : "text-texts"}`
          }
        >
          {module.mobileLabel ?? module.label}
        </NavLink>
      ))}
    </nav>
  );
}
