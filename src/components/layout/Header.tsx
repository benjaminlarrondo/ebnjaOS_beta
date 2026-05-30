import { PanelLeft, Search, Settings2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { IS_MOCK } from "../../lib/constants";
import { appModules } from "../../lib/navigation";
import { StatusPill } from "../system/StatusPill";

export function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const location = useLocation();
  const current = appModules.find((module) => module.path === location.pathname);

  return (
    <header className="mb-4 flex items-center justify-between lg:mb-5">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.04em] text-texts">Buenos dias</p>
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
        {IS_MOCK && <StatusPill tone="accent">Mock mode</StatusPill>}
        <button aria-label="Ajustes visuales" className="grid h-8 w-8 place-items-center rounded-full border border-borderc bg-surface text-textp shadow-sm">
          <Settings2 className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
