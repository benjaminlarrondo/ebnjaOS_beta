import { CalendarWidget } from "../../components/dashboard/CalendarWidget";
import { DayStatusWidget } from "../../components/dashboard/DayStatusWidget";
import { FitnessWidget } from "../../components/dashboard/FitnessWidget";
import { QuickActionsWidget } from "../../components/dashboard/QuickActionsWidget";
import { TetePremiumWidget } from "../../components/dashboard/TetePremiumWidget";
import { todaySession } from "../../data/fitnessPlan";
import { listGoals } from "../../lib/goals";
import { dashboardModules, quickActionModules } from "../../lib/navigation";
import { db } from "../../lib/store";
import { getLastCalendarSyncAt } from "../../services/githubCalendarSync";

function clampPct(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export default function DashboardPage() {
  const data = db.load();
  const now = new Date();
  const todayKey = now.toDateString();
  const todayTasks = data.tasks.filter((task) => task.status === "today");
  const doneTasks = data.tasks.filter((task) => task.status === "done").length;
  const nextEvent = [...data.events].sort((a, b) => +new Date(a.start_time) - +new Date(b.start_time))[0];
  const todayEvents = data.events
    .filter((event) => new Date(event.start_time).toDateString() === todayKey)
    .sort((a, b) => +new Date(a.start_time) - +new Date(b.start_time));
  const nextWeekEvents = data.events.filter((event) => {
    const date = new Date(event.start_time);
    const end = new Date();
    end.setDate(now.getDate() + 7);
    return date >= now && date <= end;
  });
  const nextTeteEvent = [...data.events]
    .filter((event) => {
      const owner = String(event.metadata?.owner || "").toLowerCase();
      return owner === "mine" && new Date(event.start_time) >= now;
    })
    .sort((a, b) => +new Date(a.start_time) - +new Date(b.start_time))[0];
  const activeGoals = listGoals().filter((goal) => goal.status === "active");
  const fitness = data.fitnessState;
  const fitnessPct = clampPct(fitness.adherencePct || (fitness.sessionsCompleted / 6) * 100);
  const sleepPct = clampPct(((fitness.recovery.sleep || fitness.sleepAvg || 0) / 10) * 100);
  const energyPct = clampPct(((fitness.recovery.energy || 0) / 10) * 100);
  const recoveryScore = clampPct((sleepPct + energyPct) / 2);
  const topPriority = todayTasks[0]?.title || activeGoals[0]?.title || "Dia despejado";
  const lastSyncAt = getLastCalendarSyncAt();
  const primaryActions = quickActionModules.slice(0, 4);
  const secondaryModules = dashboardModules.filter((module) => !primaryActions.some((action) => action.id === module.id)).slice(0, 6);

  return (
    <div className="page-shell">
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <DayStatusWidget
          doneTasks={doneTasks}
          topPriority={topPriority}
          nextEventStart={nextEvent?.start_time}
          nextEventTitle={nextEvent?.title}
          recoveryScore={recoveryScore}
        />
        <TetePremiumWidget
          title={nextTeteEvent ? nextTeteEvent.title : "Sin bloque con Tete"}
          start={nextTeteEvent ? new Date(nextTeteEvent.start_time).toLocaleString("es-CL") : "—"}
          end={nextTeteEvent ? new Date(nextTeteEvent.end_time).toLocaleString("es-CL") : "—"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <FitnessWidget
          sessionName={todaySession.name}
          sessionFocus={todaySession.focus}
          sessionsCompleted={fitness.sessionsCompleted}
          gymCompleted={fitness.gymCompleted}
          homeCompleted={fitness.homeCompleted}
          fitnessPct={fitnessPct}
        />
        <CalendarWidget
          todayEvents={todayEvents}
          nextEvent={nextEvent}
          nextWeekEventsCount={nextWeekEvents.length}
          lastSyncAt={lastSyncAt}
        />
      </div>

      <QuickActionsWidget primaryActions={primaryActions} secondaryModules={secondaryModules} />
    </div>
  );
}
