import { Activity, CalendarDays, Dumbbell, Sparkles, Target } from "lucide-react";
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
  nextWorkoutTitle,
  recommendation,
  recoveryScore,
}: {
  doneTasks: number;
  topPriority: string;
  nextEventStart?: string;
  nextEventTitle?: string;
  nextWorkoutTitle?: string;
  recommendation: string;
  recoveryScore: number;
}) {
  const stateLabel = recoveryScore >= 75 ? "Listo para empujar" : recoveryScore >= 55 ? "Mantener ritmo" : "Recuperar energía";
  return (
    <WidgetCard className="card-equal">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-borderc bg-surface p-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="rounded-full bg-surface2 p-1.5 text-primary"><Target className="h-3.5 w-3.5" /></span>
            <span className="text-[11px] text-texts">{doneTasks} done</span>
          </div>
          <WidgetMetric label="Prioridad" value={topPriority} size="sm" />
        </div>
        <div className="rounded-xl border border-borderc bg-surface p-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="rounded-full bg-surface2 p-1.5 text-primary"><CalendarDays className="h-3.5 w-3.5" /></span>
            <span className="text-[11px] text-texts">{compactTime(nextEventStart)}</span>
          </div>
          <WidgetMetric label="Próximo bloque" value={nextEventTitle || "Sin eventos"} size="sm" />
        </div>
        <div className="rounded-xl border border-borderc bg-surface p-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="rounded-full bg-surface2 p-1.5 text-primary"><Dumbbell className="h-3.5 w-3.5" /></span>
            <span className="text-[11px] text-texts">Hoy</span>
          </div>
          <WidgetMetric label="Próximo entreno" value={nextWorkoutTitle || "Sin rutina"} size="sm" />
        </div>
        <div className="rounded-xl border border-borderc bg-surface p-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="rounded-full bg-surface2 p-1.5 text-primary"><Activity className="h-3.5 w-3.5" /></span>
            <span className="text-[11px] text-texts">{stateLabel}</span>
          </div>
          <WidgetMetric label="Estado del día" value={recoveryScore >= 70 ? "Listo para empujar" : "Cuidar energía"} size="sm" />
        </div>
        <div className="rounded-xl border border-borderc bg-surface p-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="rounded-full bg-surface2 p-1.5 text-primary"><Sparkles className="h-3.5 w-3.5" /></span>
            <span className="text-[11px] text-texts">{recoveryScore}%</span>
          </div>
          <WidgetMetric label="Recomendación" value={recommendation} size="sm" />
        </div>
      </div>
    </WidgetCard>
  );
}
