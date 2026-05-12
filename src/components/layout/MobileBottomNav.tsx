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
    <nav className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-5 border-t border-borderc bg-white/95 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)] backdrop-blur lg:hidden">
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
