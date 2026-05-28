import { Settings2 } from "lucide-react";
import { IS_MOCK } from "../../lib/constants";

export function Header() {
  return (
    <header className="mb-5 flex items-center justify-between lg:mb-7">
      <div>
        <p className="text-sm text-texts">Buen día</p>
        <h2 className="text-xl font-semibold leading-tight lg:text-2xl">benjaOS</h2>
      </div>
      <div className="flex items-center gap-2">
        {IS_MOCK && <span className="rounded-full border border-borderc bg-white px-2 py-1 text-xs text-texts">Mock mode</span>}
        <button aria-label="Ajustes visuales" className="grid h-9 w-9 place-items-center rounded-full border border-borderc bg-white text-texts shadow-sm">
          <Settings2 className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
