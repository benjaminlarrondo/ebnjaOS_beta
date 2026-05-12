import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { WorkoutSession } from "../../data/fitnessPlan";
import { WorkoutSessionCard } from "./WorkoutSessionCard";

const STORAGE_KEY = "ebnjaos-fitness-plan-open";

function getInitialOpenState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === "1";
  } catch {
    return false;
  }
}

export function WorkoutPlanList({ sessions }: { sessions: WorkoutSession[] }) {
  const [open, setOpen] = useState(getInitialOpenState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, open ? "1" : "0");
    } catch {
      // noop
    }
  }, [open]);

  return (
    <section className="card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl text-left"
        aria-expanded={open}
        aria-controls="workout-plan-panel"
      >
        <div>
          <h3 className="text-sm font-semibold">Plan base de entrenamiento</h3>
          <p className="mt-1 text-xs text-texts">{sessions.length} sesiones cargadas</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-texts transition-transform ${open ? "rotate-180" : "rotate-0"}`} />
      </button>

      {open && (
        <div id="workout-plan-panel" className="mt-3 space-y-3">
          {sessions.map((session) => (
            <WorkoutSessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </section>
  );
}
