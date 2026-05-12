import { NavLink } from "react-router-dom";

const links = [
  ["/", "Inicio"],
  ["/tasks", "Tareas"],
  ["/calendar", "Calendario"],
  ["/fitness", "Fitness"],
  ["/settings", "Más"],
] as const;

export function MobileBottomNav() {
  return (
    <nav className="sticky top-0 z-20 mb-3 grid grid-cols-5 rounded-xl border border-borderc bg-white/95 p-2 backdrop-blur lg:hidden">
      {links.map(([to, label]) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `rounded-lg px-2 py-2 text-center text-xs ${isActive ? "bg-[#eef1f6] text-primary" : "text-texts"}`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
