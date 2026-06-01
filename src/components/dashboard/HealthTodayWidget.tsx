import { Activity } from "lucide-react";
import { WidgetCard } from "./WidgetCard";
import { WidgetHeader } from "./WidgetHeader";

export function HealthTodayWidget({
  waterMl,
  proteinG,
  sleepHours,
  workouts,
}: {
  waterMl: number;
  proteinG: number;
  sleepHours: number;
  workouts: number;
}) {
  return (
    <WidgetCard to="/fitness">
      <WidgetHeader
        eyebrow="Health Today"
        title="Métricas de hoy"
        subtitle="Base unificada de salud"
        size="sm"
        className="mb-3"
        icon={<span className="rounded-full bg-surface2 p-2 text-primary"><Activity className="h-4 w-4" /></span>}
      />
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="inner-card">
          <p className="text-xs text-texts">Agua</p>
          <p className="mt-1 font-semibold text-textp">{waterMl} ml</p>
        </div>
        <div className="inner-card">
          <p className="text-xs text-texts">Proteína</p>
          <p className="mt-1 font-semibold text-textp">{proteinG} g</p>
        </div>
        <div className="inner-card">
          <p className="text-xs text-texts">Sueño</p>
          <p className="mt-1 font-semibold text-textp">{sleepHours} h</p>
        </div>
        <div className="inner-card">
          <p className="text-xs text-texts">Entrenamiento</p>
          <p className="mt-1 font-semibold text-textp">{workouts}</p>
        </div>
      </div>
    </WidgetCard>
  );
}
