import { PanelLeft, Search, Settings2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { appModules } from "../../lib/navigation";

export function AppHeader({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const location = useLocation();
  const current = appModules.find((module) => module.path === location.pathname);
  const now = new Date();
  const fullDate = now.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const currentTime = now.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });

  return (
    <header className="sticky top-[calc(env(safe-area-inset-top)+0px)] z-20 mb-3 flex items-center justify-between bg-bg/95 py-1 backdrop-blur-sm lg:mb-4">
      <div className="min-w-0">
        <p className="text-xs font-medium capitalize tracking-[0.02em] text-texts">
          {fullDate} · {currentTime}
        </p>
        <h2 className="text-lg font-semibold leading-tight text-textp lg:text-xl">benjaOS</h2>
        <p className="truncate text-xs text-textm">Vista actual: {current?.label ?? "Inicio"}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden h-8 w-8 place-items-center rounded-full border border-borderc bg-surface text-textp lg:grid xl:hidden"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("ebnja:open-command-palette"))}
          className="hidden h-8 items-center gap-1 rounded-full border border-borderc px-2 text-xs text-texts md:flex"
          aria-label="Abrir command palette"
        >
          <Search className="h-3.5 w-3.5" />
          ⌘K
        </button>
        <Link
          to="/settings"
          aria-label="Ajustes visuales"
          className="grid h-8 w-8 place-items-center rounded-full border border-borderc bg-surface text-textp shadow-sm"
        >
          <Settings2 className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
