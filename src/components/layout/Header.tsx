import { Settings2 } from "lucide-react";
import { IS_MOCK } from "../../lib/constants";

export function Header() {
  return (
    <header className="mb-4 flex items-center justify-between lg:mb-6">
      <div>
        <p className="text-sm text-texts">Buen día</p>
        <h2 className="text-lg font-semibold lg:text-xl">ebnjaOS</h2>
      </div>
      <div className="flex items-center gap-2">
        {IS_MOCK && <span className="rounded-full border border-borderc px-2 py-1 text-xs text-texts">Mock mode</span>}
        <button aria-label="Ajustes visuales" className="grid h-9 w-9 place-items-center rounded-full border border-borderc bg-white text-texts">
          <Settings2 className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
