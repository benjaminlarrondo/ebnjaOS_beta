import { ExecutiveHomeHero } from "../../components/dashboard/ExecutiveHomeHero";
import { HealthTodayWidget } from "../../components/dashboard/HealthTodayWidget";
import { QuickActionsWidget } from "../../components/dashboard/QuickActionsWidget";
import { TrackingTodayWidget } from "../../components/dashboard/TrackingTodayWidget";
import { todaySession } from "../../data/fitnessPlan";
import {
  getCalendarDomainState,
  getNextOwnerEvent,
  isOwnerAtDate,
  getTodayOwner,
  mergeDomainWithManualEvents,
  listEventsByOwner,
} from "../../lib/calendarDomain/calendarDomainSelectors";
import { getHealthDay } from "../../lib/health/healthStore";
import { toDateKey } from "../../lib/health/healthMetrics";
import { computeExecutiveLifeScore, computeDailyCoach } from "../../lib/executive/executiveEngines";
import { listGoals } from "../../lib/goals";
import { dashboardModules, quickActionModules } from "../../lib/navigation";
import { db } from "../../lib/store";
import { computeDailyScore, computeObjectiveDailyScore, loadTrackingState, toLocalDateKey } from "../../lib/tracking";
import { useHealthState } from "../../hooks/useHealthState";
import { computeFitnessHealthMetrics } from "../fitness/fitnessMetrics";
import { computeAdaptiveTrainingRecommendation } from "../../lib/fitness/fitnessExecutionEngine";

export default function DashboardPage() {
  const { healthState } = useHealthState();
  const data = db.load();
  const calendarState = getCalendarDomainState();
  const mergedEvents = mergeDomainWithManualEvents(data.events.filter((event) => event.source !== "github"));
  const now = new Date();
  const todayKey = now.toDateString();
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
  const nextTeteEvent = getNextOwnerEvent("hers", calendarState);
  const fitness = data.fitnessState;
  const todayDateKey = toDateKey();
  const workoutsToday = data.workouts.filter((workout) => workout.date === todayDateKey).length;
  const recentWorkouts = data.workouts.filter((workout) => {
    const day = new Date(`${workout.date}T12:00:00`);
    const diff = Math.round((+now - +day) / 86400000);
    return diff >= 0 && diff < 7;
  }).length;
  const recentProgressLogs = fitness.exerciseWeightLogs.filter((log) => {
    const day = new Date(`${log.date}T12:00:00`);
    const diff = Math.round((+now - +day) / 86400000);
    return diff >= 0 && diff < 30;
  }).length;
  const fitnessMetrics = computeFitnessHealthMetrics(
    healthState,
    todayDateKey,
    workoutsToday,
    recentWorkouts,
    recentProgressLogs,
  );
  const adaptiveRecommendation = computeAdaptiveTrainingRecommendation(healthState, todayDateKey, fitnessMetrics.recoveryScore);
  const trackingState = loadTrackingState();
  const trackingToday = computeDailyScore(trackingState, toLocalDateKey());
  const trackingHabits = trackingState.habits.filter((habit) => habit.active);
  const trackingCompleted = trackingHabits.filter((habit) => trackingToday.completions[habit.id] >= 1).length;
  const todayIso = toLocalDateKey();
  const isFamilyDone = isOwnerAtDate("hers", todayIso);
  const todayOwner = getTodayOwner(calendarState);
  const objectiveToday = computeObjectiveDailyScore({
    date: todayIso,
    dailyScore: trackingToday,
    isFamilyDone,
  });
  const healthToday = getHealthDay(healthState, todayIso);
  const primaryActions = quickActionModules.slice(0, 4);
  const secondaryModules = dashboardModules.filter((module) => !primaryActions.some((action) => action.id === module.id)).slice(0, 6);
  const lifeScore = computeExecutiveLifeScore({
    fitnessScore: fitnessMetrics.fitnessScore,
    trackingState,
    calendarState,
    projects: data.projects,
    goals: listGoals(),
    date: todayIso,
  });
  const agendaLoad = todayEvents.length + nextWeekEvents.length;
  const nextEventSoon = Boolean(nextEvent) && new Date(nextEvent.start_time).getTime() - now.getTime() < 1000 * 60 * 60 * 24;
  const dailyCoach = computeDailyCoach({
    recoveryScore: fitnessMetrics.recoveryScore,
    readinessScore: adaptiveRecommendation.readiness,
    nextEventSoon,
    hasTeteToday: todayOwner === "hers" || Boolean(listEventsByOwner("hers", calendarState).find((event) => new Date(event.start_time).toDateString() === todayKey)),
    agendaLoad,
  });
  const executiveInsight =
    dailyCoach.headline === "Entrena fuerte"
      ? "Tu base física está lista para empujar."
      : dailyCoach.headline === "Mantén carga"
        ? "Buen momento para sostener el ritmo sin forzar."
        : dailyCoach.headline === "Planifica tiempo con Sofía"
          ? "Conviene reservar tiempo y ordenar agenda con Tete."
          : "Hoy conviene proteger energía y priorizar recuperación.";
  const executiveAction = dailyCoach.headline;

  return (
    <div className="page-shell">
      <ExecutiveHomeHero
        lifeScore={lifeScore}
        recoveryScore={fitnessMetrics.recoveryScore}
        readinessScore={adaptiveRecommendation.readiness}
        workoutLabel={todaySession.name}
        coachHeadline={dailyCoach.headline}
        coachReason={dailyCoach.reason}
        nextTeteLabel={nextTeteEvent ? new Date(nextTeteEvent.start_time).toLocaleString("es-CL", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Sin bloque con Tete"}
        nextAgendaLabel={nextEvent ? nextEvent.title : "Agenda despejada"}
        insight={executiveInsight}
        action={executiveAction}
      />

      <div className="adaptive-grid">
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
      </div>

      <QuickActionsWidget primaryActions={primaryActions} secondaryModules={secondaryModules} />
    </div>
  );
}
