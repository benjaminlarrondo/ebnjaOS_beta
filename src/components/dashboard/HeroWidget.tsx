import { WidgetCard } from "./WidgetCard";
import { WidgetMetric } from "./WidgetMetric";

function clampPct(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function ScoreRing({ value, label }: { value: number; label: string }) {
  const pct = clampPct(value);
  return (
    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-borderc bg-surface">
      <div className="text-center">
        <p className="text-sm font-semibold leading-none text-textp">{pct}%</p>
        <p className="mt-1 text-[9px] font-medium uppercase text-textm">{label}</p>
      </div>
    </div>
  )
}

export function HeroWidget({
  dayScore,
  todayTasksCount,
  todayEventsCount,
  fitnessSessionsCompleted,
  topPriority,
  nextEventTitle,
  todaySessionName,
  recommendation,
}: {
  dayScore: number;
  todayTasksCount: number;
  todayEventsCount: number;
  fitnessSessionsCompleted: number;
  topPriority: string;
  nextEventTitle?: string;
  todaySessionName: string;
  recommendation: {
    priority: string;
    nextEvent: string;
    nextWorkout: string;
  };
}) {
  const now = new Date();
  const fullDate = now.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const time = now.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });

  return (
    <WidgetCard>
      <div className="grid gap-1.5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-xs text-textm">{fullDate}</p>
          <p className="text-xs text-texts">{time}</p>
          <h1 className="mt-1 text-base font-semibold text-textp sm:text-lg">Cockpit del día</h1>
        </div>
        <div className="grid min-w-0 grid-cols-[auto_1fr] items-center gap-2 rounded-2xl border border-borderc bg-surface p-2 lg:w-52">
          <ScoreRing value={dayScore} label="dia" />
          <div className="min-w-0 overflow-hidden">
            <p className="text-xs font-medium text-texts">Estado</p>
            <p className="text-sm font-semibold leading-tight text-textp">{dayScore >= 70 ? "En control" : "Priorizar energia"}</p>
            <p className="text-[11px] leading-5 text-texts">{todayTasksCount} focos · {todayEventsCount} eventos · {fitnessSessionsCompleted}/6 fitness</p>
          </div>
        </div>
      </div>

      <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
        <WidgetMetric label="Foco" value={todayTasksCount} hint={topPriority} boxed size="lg" />
        <WidgetMetric label="Agenda" value={todayEventsCount} hint={nextEventTitle || "Libre"} boxed size="lg" />
        <WidgetMetric label="Fitness" value={`${fitnessSessionsCompleted}/6`} hint={todaySessionName} boxed size="lg" />
      </div>

      <article className="mt-1.5 rounded-2xl border border-borderc bg-surface p-2">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.06em] text-primary">Recomendacion del sistema</p>
        <div className="grid gap-1 text-sm sm:grid-cols-3">
          <p className="text-texts">Prioridad: <span className="text-textp">{recommendation.priority}</span></p>
          <p className="text-texts">Proximo evento: <span className="text-textp">{recommendation.nextEvent}</span></p>
          <p className="text-texts">Proximo entrenamiento: <span className="text-textp">{recommendation.nextWorkout}</span></p>
        </div>
      </article>
    </WidgetCard>
  );
}
