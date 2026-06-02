import { CalendarWidget } from "../../components/dashboard/CalendarWidget";
import { DayStatusWidget } from "../../components/dashboard/DayStatusWidget";
import { FitnessWidget } from "../../components/dashboard/FitnessWidget";
import { HealthTodayWidget } from "../../components/dashboard/HealthTodayWidget";
import { QuickActionsWidget } from "../../components/dashboard/QuickActionsWidget";
import { TrackingTodayWidget } from "../../components/dashboard/TrackingTodayWidget";
import { TetePremiumWidget } from "../../components/dashboard/TetePremiumWidget";
import { todaySession } from "../../data/fitnessPlan";
import {
  getNextOwnerEvent,
  isOwnerAtDate,
  mergeDomainWithManualEvents,
} from "../../lib/calendarDomain/calendarDomainSelectors";
import { getHealthDay, loadHealthState } from "../../lib/health/healthStore";
import { toDateKey } from "../../lib/health/healthMetrics";
import { listGoals } from "../../lib/goals";
import { dashboardModules, quickActionModules } from "../../lib/navigation";
import { db } from "../../lib/store";
import { computeDailyScore, computeObjectiveDailyScore, loadTrackingState, toLocalDateKey } from "../../lib/tracking";
import { computeFitnessHealthMetrics } from "../fitness/fitnessMetrics";
import { getLastCalendarSyncAt } from "../../services/githubCalendarSync";

export default function DashboardPage() {
  const data = db.load();
  const mergedEvents = mergeDomainWithManualEvents(data.events.filter((event) => event.source !== "github"));
  const now = new Date();
  const todayKey = now.toDateString();
  const todayTasks = data.tasks.filter((task) => task.status === "today");
  const doneTasks = data.tasks.filter((task) => task.status === "done").length;
  const nextEvent = [...mergedEvents].sort((a, b) => +new Date(a.start_time) - +new Date(b.start_time))[0];
  const todayEvents = mergedEvents
    .filter((event) => new Date(event.start_time).toDateString() === todayKey)
    .sort((a, b) => +new Date(a.start_time) - +new Date(b.start_time));
  const nextWeekEvents = mergedEvents.filter((event) => {
    const date = new Date(event.start_time);
    const end = new Date();
    end.setDate(now.getDate() + 7);
    return date >= now && date <= end;
  });
  const nextTeteEvent = getNextOwnerEvent("hers");
  const activeGoals = listGoals().filter((goal) => goal.status === "active");
  const fitness = data.fitnessState;
  const todayDateKey = toDateKey();
  const workoutsToday = data.workouts.filter((workout) => workout.date === todayDateKey).length;
  const fitnessMetrics = computeFitnessHealthMetrics(
    loadHealthState(),
    todayDateKey,
    workoutsToday,
    fitness.recovery.fatigue || 0,
    Math.min(3, fitness.sessionsCompleted),
  );
  const topPriority = todayTasks[0]?.title || activeGoals[0]?.title || "Dia despejado";
  const lastSyncAt = getLastCalendarSyncAt();
  const trackingState = loadTrackingState();
  const trackingToday = computeDailyScore(trackingState, toLocalDateKey());
  const trackingHabits = trackingState.habits.filter((habit) => habit.active);
  const trackingCompleted = trackingHabits.filter((habit) => trackingToday.completions[habit.id] >= 1).length;
  const todayIso = toLocalDateKey();
  const isFamilyDone = isOwnerAtDate("hers", todayIso);
  const objectiveToday = computeObjectiveDailyScore({
    date: todayIso,
    dailyScore: trackingToday,
    isFamilyDone,
  });
  const healthToday = getHealthDay(loadHealthState(), todayIso);
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
          recoveryScore={fitnessMetrics.recoveryScore}
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
          fitnessScore={fitnessMetrics.fitnessScore}
          recoveryScore={fitnessMetrics.recoveryScore}
          routineLabel={todaySession.focus}
        />
        <CalendarWidget
          todayEvents={todayEvents}
          nextEvent={nextEvent}
          nextWeekEventsCount={nextWeekEvents.length}
          lastSyncAt={lastSyncAt}
        />
      </div>
      <TrackingTodayWidget
        score={objectiveToday.overall}
        completed={trackingCompleted}
        total={trackingHabits.length}
        health={objectiveToday.health}
      />
      <HealthTodayWidget
        waterMl={healthToday.water_ml}
        proteinG={healthToday.protein_g}
        sleepHours={healthToday.sleep_hours}
        workouts={healthToday.workouts_count}
      />

      <QuickActionsWidget primaryActions={primaryActions} secondaryModules={secondaryModules} />
    </div>
  );
}
