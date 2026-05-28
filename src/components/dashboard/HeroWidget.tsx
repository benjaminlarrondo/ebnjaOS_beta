import { WidgetAction } from "./WidgetAction";
import { WidgetCard } from "./WidgetCard";
import { WidgetMetric } from "./WidgetMetric";

function clampPct(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function ScoreRing({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="grid h-28 w-28 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(var(--color-primary) ${clampPct(value) * 3.6}deg, var(--color-surface-2) 0deg)` }}
    >
      <div className="grid h-[88px] w-[88px] place-items-center rounded-full bg-white text-center shadow-sm">
        <p className="text-2xl font-semibold leading-none text-textp">{clampPct(value)}%</p>
        <p className="mt-1 text-[10px] font-medium text-texts">{label}</p>
      </div>
    </div>
  );
}

export function HeroWidget({
  todayLabel,
  focusPreview,
  dayScore,
  todayTasksCount,
  todayEventsCount,
  fitnessSessionsCompleted,
  topPriority,
  nextEventTitle,
  todaySessionName,
}: {
  todayLabel: string;
  focusPreview: string;
  dayScore: number;
  todayTasksCount: number;
  todayEventsCount: number;
  fitnessSessionsCompleted: number;
  topPriority: string;
  nextEventTitle?: string;
  todaySessionName: string;
}) {
  return (
    <WidgetCard className="overflow-hidden sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="eyebrow">{todayLabel}</p>
            <span className="rounded-full bg-surface2 px-2.5 py-1 text-[11px] font-medium text-texts">Centro operativo</span>
          </div>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-none text-textp sm:text-5xl">Cockpit del dia</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-texts">{focusPreview}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <WidgetAction to="/tasks" variant="primary">Abrir foco</WidgetAction>
            <WidgetAction to="/calendar">Agenda</WidgetAction>
            <WidgetAction to="/fitness">Entreno</WidgetAction>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-[24px] bg-surface2 p-4 lg:w-72">
          <ScoreRing value={dayScore} label="dia" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-texts">Estado</p>
            <p className="mt-2 text-xl font-semibold leading-tight text-textp">{dayScore >= 70 ? "En control" : "Priorizar energia"}</p>
            <p className="mt-2 text-xs leading-5 text-texts">{todayTasksCount} focos · {todayEventsCount} eventos · {fitnessSessionsCompleted}/6 fitness</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
        <WidgetMetric label="Foco" value={todayTasksCount} hint={topPriority} boxed size="lg" />
        <WidgetMetric label="Agenda" value={todayEventsCount} hint={nextEventTitle || "Libre"} boxed size="lg" />
        <WidgetMetric label="Fitness" value={`${fitnessSessionsCompleted}/6`} hint={todaySessionName} boxed size="lg" />
      </div>
    </WidgetCard>
  );
}
