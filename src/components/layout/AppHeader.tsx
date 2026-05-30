import { PanelLeft, Search, Settings2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { IS_MOCK } from "../../lib/constants";
import { appModules } from "../../lib/navigation";
import { PlatformStatusBadge } from "../system/PlatformStatusBadge";
import { StatusPill } from "../system/StatusPill";

export function AppHeader({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const location = useLocation();
  const current = appModules.find((module) => module.path === location.pathname);
  const now = new Date();
  const fullDate = now.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <header className="sticky top-[calc(env(safe-area-inset-top)+0px)] z-20 mb-4 flex items-center justify-between bg-bg/95 py-1 backdrop-blur-sm lg:mb-5">
      <div className="min-w-0">
        <p className="text-xs font-medium capitalize tracking-[0.02em] text-texts">{fullDate}</p>
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
        <button aria-label="Ajustes visuales" className="grid h-8 w-8 place-items-center rounded-full border border-borderc bg-surface text-textp shadow-sm">
          <Settings2 className="h-4 w-4" />
        </button>
        <PlatformStatusBadge />
        {IS_MOCK && <StatusPill tone="accent">Mock</StatusPill>}
      </div>
    </header>
  );
}
