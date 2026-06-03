import { NavLink } from "react-router-dom";
import { sidebarModules } from "../../lib/navigation";

const groups = [
  { title: "OPERATION", ids: ["home", "calendar", "tracking", "fitness", "workspace", "settings"] },
];

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 self-start overflow-y-auto border-r border-borderc bg-surface p-4 lg:block ${collapsed ? "w-[72px]" : "w-[220px]"}`}
    >
      <p className={`mb-4 text-lg font-semibold text-textp ${collapsed ? "text-center" : ""}`}>{collapsed ? "OS" : "benjaOS"}</p>
      <nav className="space-y-4">
        {groups.map((group) => {
          const modules = group.ids
            .map((id) => sidebarModules.find((module) => module.id === id))
            .filter((module): module is (typeof sidebarModules)[number] => Boolean(module));
          if (!modules.length) return null;
          return (
            <div key={group.title}>
              {!collapsed && <p className="mb-1 px-2 text-[10px] font-semibold tracking-[0.08em] text-textm">{group.title}</p>}
              <div className="space-y-1">
                {modules.map((module) => {
                  const Icon = module.icon;
                  return (
                    <NavLink
                      key={module.id}
                      to={module.path}
                      className={({ isActive }) =>
                        `flex items-center rounded-xl border px-2.5 py-2 text-sm transition ${
                          collapsed ? "justify-center" : "gap-2"
                        } ${
                          isActive
                            ? "border-primary/35 bg-primary/15 text-primary"
                            : "border-transparent text-textp hover:border-primary/20 hover:bg-primary/10 hover:text-primary"
                        }`
                      }
                      title={module.label}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{module.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
