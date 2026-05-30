import { useState } from "react";
import { CalendarWidget } from "../../components/dashboard/CalendarWidget";
import { DayStatusWidget } from "../../components/dashboard/DayStatusWidget";
import { FitnessWidget } from "../../components/dashboard/FitnessWidget";
import { FocusWidget } from "../../components/dashboard/FocusWidget";
import { HeroWidget } from "../../components/dashboard/HeroWidget";
import { InsightsWidget } from "../../components/dashboard/InsightsWidget";
import { QuickActionsWidget } from "../../components/dashboard/QuickActionsWidget";
import { todaySession } from "../../data/fitnessPlan";
import { listGoals } from "../../lib/goals";
import { dashboardModules, quickActionModules } from "../../lib/navigation";
import { db } from "../../lib/store";
import { getLastCalendarSyncAt } from "../../services/githubCalendarSync";

function clampPct(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export default function DashboardPage() {
  const [, setTick] = useState(0);

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
  const focusScore = clampPct(todayTasks.length === 0 ? 100 : Math.max(20, 100 - todayTasks.length * 18));
  const dayScore = clampPct((fitnessPct + recoveryScore + focusScore) / 3);
  const focusPreview = data.focus || "Define el foco central del dia";
  const topPriority = todayTasks[0]?.title || activeGoals[0]?.title || "Dia despejado";
  const lastSyncAt = getLastCalendarSyncAt();
  const primaryActions = quickActionModules.slice(0, 4);
  const secondaryModules = dashboardModules.filter((module) => !primaryActions.some((action) => action.id === module.id)).slice(0, 6);

  return (
    <div className="page-shell">
      <HeroWidget
        dayScore={dayScore}
        todayTasksCount={todayTasks.length}
        todayEventsCount={todayEvents.length}
        fitnessSessionsCompleted={fitness.sessionsCompleted}
        topPriority={topPriority}
        nextEventTitle={nextEvent?.title}
        todaySessionName={todaySession.name}
        recommendation={{
          priority: topPriority,
          nextEvent: nextEvent?.title || "Sin evento",
          nextWorkout: todaySession.name,
        }}
      />

      <section className="card">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-primary">Tete</p>
          <span className="text-[11px] text-texts">Widget compacto</span>
        </div>
        <h3 className="truncate text-base font-semibold text-textp">{nextTeteEvent ? nextTeteEvent.title : "Sin bloque con Tete"}</h3>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <p className="rounded-xl border border-borderc bg-surface px-2 py-1.5 text-texts">
            Inicio: <span className="text-textp">{nextTeteEvent ? new Date(nextTeteEvent.start_time).toLocaleString("es-CL") : "—"}</span>
          </p>
          <p className="rounded-xl border border-borderc bg-surface px-2 py-1.5 text-texts">
            Término: <span className="text-textp">{nextTeteEvent ? new Date(nextTeteEvent.end_time).toLocaleString("es-CL") : "—"}</span>
          </p>
        </div>
      </section>

      <DayStatusWidget
        doneTasks={doneTasks}
        topPriority={topPriority}
        nextEventStart={nextEvent?.start_time}
        nextEventTitle={nextEvent?.title}
        recoveryScore={recoveryScore}
      />

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

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <FocusWidget
          focus={focusPreview}
          tasks={todayTasks}
          onSave={(nextFocus) => {
            db.upsertFocus(nextFocus);
            setTick((x) => x + 1);
          }}
        />
        <InsightsWidget
          fitnessPct={fitnessPct}
          recoveryScore={recoveryScore}
          activeGoalsCount={activeGoals.length}
        />
      </div>

      <QuickActionsWidget primaryActions={primaryActions} secondaryModules={secondaryModules} />
    </div>
  );
}
