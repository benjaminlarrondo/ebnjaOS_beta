import { CalendarDays, Moon, Target } from "lucide-react";
import { WidgetCard } from "./WidgetCard";
import { WidgetMetric } from "./WidgetMetric";

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
      <WidgetCard>
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-surface2 p-2 text-primary"><Target className="h-4 w-4" /></span>
          <span className="text-xs text-texts">{doneTasks} done</span>
        </div>
        <WidgetMetric label="Prioridad" value={topPriority} size="sm" />
      </WidgetCard>
      <WidgetCard>
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-surface2 p-2 text-primary"><CalendarDays className="h-4 w-4" /></span>
          <span className="text-xs text-texts">{compactTime(nextEventStart)}</span>
        </div>
        <WidgetMetric label="Proximo bloque" value={nextEventTitle || "Sin eventos"} size="sm" />
      </WidgetCard>
      <WidgetCard>
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-surface2 p-2 text-primary"><Moon className="h-4 w-4" /></span>
          <span className="text-xs text-texts">{recoveryScore}%</span>
        </div>
        <WidgetMetric label="Recovery" value={recoveryScore >= 70 ? "Listo para empujar" : "Cuidar energia"} size="sm" />
      </WidgetCard>
    </section>
  );
}
