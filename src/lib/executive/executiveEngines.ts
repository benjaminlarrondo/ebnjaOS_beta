import { clampPct, toDateKey } from "../health/healthMetrics";
import type { TrackingState } from "../tracking";
import type { CalendarDomainState } from "../calendarDomain/calendarDomainTypes";
import { getNextOwnerEvent, getTodayOwner, listEventsByOwner } from "../calendarDomain/calendarDomainSelectors";
import type { Project } from "../../types/project";
import type { Goal } from "../goals";

export type DailyCoachRecommendation =
  | "Entrena fuerte"
  | "Mantén carga"
  | "Recupera"
  | "Prioriza descanso"
  | "Planifica tiempo con Sofía";

export type ExecutiveDailyCoach = {
  headline: DailyCoachRecommendation;
  reason: string;
  readiness: number;
  lifeScore: number;
};

export type LifeScoreInput = {
  fitnessScore: number;
  habitsScore: number;
  agendaScore: number;
  teteScore: number;
  projectsScore: number;
};

export function computeLifeScore(input: LifeScoreInput) {
  return clampPct(
    (input.fitnessScore * 0.4) +
    (input.habitsScore * 0.2) +
    (input.agendaScore * 0.2) +
    (input.teteScore * 0.1) +
    (input.projectsScore * 0.1),
  );
}

function computeHabitsScore(trackingState: TrackingState, date = toDateKey()) {
  const activeHabits = trackingState.habits.filter((habit) => habit.active);
  if (!activeHabits.length) return 0;
  const log = trackingState.logs[date] || {};
  const completed = activeHabits.reduce((sum, habit) => {
    const value = log[habit.id];
    if (habit.unit === "boolean") return sum + (value === true ? 1 : 0);
    const numeric = typeof value === "number" ? value : 0;
    return sum + Math.min(1, numeric / Math.max(1, habit.defaultTarget));
  }, 0);
  return clampPct((completed / activeHabits.length) * 100);
}

function computeAgendaScore(state: CalendarDomainState, date = toDateKey()) {
  const todayOwner = getTodayOwner(state);
  const hasTodayEvents = Object.values(state.daysByDate).some((day) => day.date === date && day.owner !== "neutral");
  const nextEvent = listEventsByOwner("hers", state)[0] ?? null;
  const nextEventSoon = nextEvent ? new Date(nextEvent.start_time).getTime() - Date.now() < 1000 * 60 * 60 * 24 : false;
  if (todayOwner === "hers" || hasTodayEvents) return nextEventSoon ? 100 : 88;
  return nextEvent ? 72 : 55;
}

function computeTeteScore(state: CalendarDomainState) {
  const nextTeteEvent = getNextOwnerEvent("hers", state);
  if (!nextTeteEvent) return 50;
  const start = new Date(nextTeteEvent.start_time).getTime();
  const diffHours = (start - Date.now()) / 36e5;
  if (diffHours < 12) return 100;
  if (diffHours < 48) return 88;
  return 74;
}

function computeProjectsScore(projects: Project[], goals: Goal[]) {
  const activeProjects = projects.filter((project) => project.status === "active").length;
  const activeGoals = goals.filter((goal) => goal.status === "active").length;
  const score = 50 + Math.min(50, activeProjects * 8 + activeGoals * 5);
  return clampPct(score);
}

export function computeExecutiveLifeScore(input: {
  fitnessScore: number;
  trackingState: TrackingState;
  calendarState: CalendarDomainState;
  projects: Project[];
  goals: Goal[];
  date?: string;
}) {
  return computeLifeScore({
    fitnessScore: input.fitnessScore,
    habitsScore: computeHabitsScore(input.trackingState, input.date),
    agendaScore: computeAgendaScore(input.calendarState, input.date),
    teteScore: computeTeteScore(input.calendarState),
    projectsScore: computeProjectsScore(input.projects, input.goals),
  });
}

export function computeDailyCoach(input: {
  recoveryScore: number;
  readinessScore: number;
  nextEventSoon: boolean;
  hasTeteToday: boolean;
  agendaLoad: number;
}): ExecutiveDailyCoach {
  const { readinessScore, recoveryScore, nextEventSoon, hasTeteToday, agendaLoad } = input;

  let headline: DailyCoachRecommendation = "Prioriza descanso";
  if (readinessScore > 80) headline = "Entrena fuerte";
  else if (readinessScore >= 60) headline = "Mantén carga";
  else if (recoveryScore < 60) headline = "Recupera";

  if (hasTeteToday && nextEventSoon) {
    headline = "Planifica tiempo con Sofía";
  } else if (readinessScore < 50) {
    headline = "Prioriza descanso";
  }

  const reason =
    headline === "Entrena fuerte"
      ? "Tu recuperación y readiness están altos."
      : headline === "Mantén carga"
        ? "El cuerpo está listo para sostener la sesión sin subir volumen."
        : headline === "Recupera"
          ? "Conviene bajar intensidad y proteger energía."
          : headline === "Planifica tiempo con Sofía"
            ? "Hay un bloque cercano con Tete; ordena agenda y entrenamiento."
            : "El contexto sugiere una pausa intencional.";

  return {
    headline,
    reason: `${reason} Agenda cargada: ${agendaLoad} eventos próximos.`,
    readiness: readinessScore,
    lifeScore: recoveryScore,
  };
}
