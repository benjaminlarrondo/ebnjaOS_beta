import { CalendarDays, Moon, Target } from "lucide-react";

function compactTime(iso?: string) {
  if (!iso) return "Libre";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function DayStatusWidget({
  doneTasks,
  topPriority,
  nextEventStart,
  nextEventTitle,
  recoveryScore,
}: {
  doneTasks: number;
  topPriority: string;
  nextEventStart?: string;
  nextEventTitle?: string;
  recoveryScore: number;
}) {
  return (
    <section className="grid gap-3 sm:grid-cols-3">
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-surface2 p-2 text-primary"><Target className="h-4 w-4" /></span>
          <span className="text-xs text-texts">{doneTasks} done</span>
        </div>
        <p className="text-xs font-medium text-texts">Prioridad</p>
        <p className="mt-2 text-lg font-semibold leading-snug text-textp">{topPriority}</p>
      </div>
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-surface2 p-2 text-primary"><CalendarDays className="h-4 w-4" /></span>
          <span className="text-xs text-texts">{compactTime(nextEventStart)}</span>
        </div>
        <p className="text-xs font-medium text-texts">Proximo bloque</p>
        <p className="mt-2 text-lg font-semibold leading-snug text-textp">{nextEventTitle || "Sin eventos"}</p>
      </div>
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-surface2 p-2 text-primary"><Moon className="h-4 w-4" /></span>
          <span className="text-xs text-texts">{recoveryScore}%</span>
        </div>
        <p className="text-xs font-medium text-texts">Recovery</p>
        <p className="mt-2 text-lg font-semibold leading-snug text-textp">{recoveryScore >= 70 ? "Listo para empujar" : "Cuidar energia"}</p>
      </div>
    </section>
  );
}
