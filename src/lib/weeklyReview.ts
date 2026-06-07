import type { Task } from "../types/task";
import type { CalendarEvent } from "../types/calendar";
import type { FitnessWorkout } from "../types/fitness";
import type { Note } from "../types/note";
import type { Project } from "../types/project";
import type { DailyLog } from "../types/daily-log";

export type WeeklyChecklistState = Record<string, boolean>;

export type WeeklyReviewDataset = {
  tasks: Task[];
  events: CalendarEvent[];
  workouts: FitnessWorkout[];
  notes: Note[];
  projects: Project[];
  logs: DailyLog[];
};

export type WeeklyUsageAnalytics = {
  weekStart: string;
  weekEnd: string;
  tasksDone: number;
  tasksCreated: number;
  events: number;
  workouts: number;
  notes: number;
  projectsUpdated: number;
  logsCreated: number;
  checklistCompleted: number;
  checklistTotal: number;
};

export type WeeklyFeedback = {
  score: number;
  headline: string;
  strengths: string[];
  focusAreas: string[];
  nextStep: string;
  context: string;
};

function mondayOfWeek(date = new Date()) {
  const out = new Date(date);
  out.setDate(out.getDate() - ((out.getDay() + 6) % 7));
  out.setHours(0, 0, 0, 0);
  return out;
}

function addDays(date: Date, days: number) {
  const out = new Date(date);
  out.setDate(out.getDate() + days);
  return out;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function ratio(numerator: number, denominator: number) {
  if (denominator <= 0) return numerator > 0 ? 1 : 0;
  return numerator / denominator;
}

function formatISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getWeekWindow(weekOffset = 0) {
  const start = addDays(mondayOfWeek(), weekOffset * 7);
  const end = addDays(start, 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function summarizeWeeklyUsage(
  data: WeeklyReviewDataset,
  checklist: WeeklyChecklistState,
  weekOffset = 0,
  checklistTotal = 5,
): WeeklyUsageAnalytics {
  const { start, end } = getWeekWindow(weekOffset);
  const inRange = (dateLike: string | undefined) => {
    if (!dateLike) return false;
    const date = new Date(dateLike);
    return date >= start && date <= end;
  };

  const tasks = data.tasks.filter((task) => inRange(task.created_at) || inRange(task.updated_at));
  const events = data.events.filter((event) => inRange(event.start_time));
  const workouts = data.workouts.filter((workout) => inRange(workout.date));
  const notes = data.notes.filter((note) => inRange(note.created_at));
  const projects = data.projects.filter((project) => inRange(project.created_at) || inRange(project.updated_at));
  const logs = data.logs.filter((log) => inRange(log.created_at) || inRange(log.date));

  const checklistCompleted = Object.values(checklist).filter(Boolean).length;

  return {
    weekStart: formatISODate(start),
    weekEnd: formatISODate(end),
    tasksDone: tasks.filter((task) => task.status === "done").length,
    tasksCreated: tasks.filter((task) => inRange(task.created_at)).length,
    events: events.length,
    workouts: workouts.length,
    notes: notes.length,
    projectsUpdated: projects.length,
    logsCreated: logs.length,
    checklistCompleted,
    checklistTotal,
  };
}

export function buildWeeklyFeedback(current: WeeklyUsageAnalytics, previous: WeeklyUsageAnalytics): WeeklyFeedback {
  const completionRate = ratio(current.tasksDone, current.tasksCreated);
  const workoutRate = Math.min(current.workouts / 4, 1);
  const captureRate = Math.min((current.notes + current.logsCreated) / 6, 1);
  const planningRate = Math.min((current.events + current.projectsUpdated) / 8, 1);
  const checklistRate = ratio(current.checklistCompleted, current.checklistTotal);

  const score = Math.round(
    clamp(
      completionRate * 30 +
        workoutRate * 20 +
        captureRate * 15 +
        planningRate * 20 +
        checklistRate * 15,
    ),
  );

  const strengths: string[] = [];
  if (completionRate >= 0.7) strengths.push("Buen cierre de tareas");
  if (current.workouts >= 3) strengths.push("Consistencia fitness sólida");
  if (current.notes >= 3 || current.logsCreated >= 2) strengths.push("Buen nivel de captura");
  if (current.projectsUpdated > 0) strengths.push("Movimiento en proyectos");
  if (checklistRate >= 0.6) strengths.push("Buen cumplimiento del ritual semanal");
  if (strengths.length === 0) strengths.push("Semana estable y sin fricción mayor");

  const focusAreas: string[] = [];
  if (completionRate < 0.6) focusAreas.push("Cerrar más tareas pendientes");
  if (current.workouts < 2) focusAreas.push("Proteger al menos 2 sesiones de entrenamiento");
  if (current.notes + current.logsCreated < 3) focusAreas.push("Capturar más contexto e ideas");
  if (current.events < previous.events) focusAreas.push("Revisar agenda y próximos bloques");
  if (current.projectsUpdated < previous.projectsUpdated) focusAreas.push("Actualizar proyectos críticos");
  if (focusAreas.length === 0) focusAreas.push("Mantener el ritmo actual");

  const deltaTasks = current.tasksDone - previous.tasksDone;
  const deltaWorkouts = current.workouts - previous.workouts;
  const deltaNotes = current.notes - previous.notes;

  const context =
    current.workouts >= previous.workouts && current.tasksDone >= previous.tasksDone
      ? "La semana muestra buena tracción entre ejecución y energía."
      : "La semana pide más foco en ejecución y protección de energía.";

  let headline = score >= 80
    ? "Semana sobresaliente"
    : score >= 65
      ? "Semana sólida"
      : score >= 45
        ? "Semana con margen de mejora"
        : "Semana débil";

  const nextStep =
    deltaWorkouts < 0 || completionRate < 0.6
      ? "Prioriza energía: reduce fricción, protege entrenamientos y cierra tareas clave."
      : "Mantén el ritmo y sigue empujando ejecución y consistencia.";

  if (deltaTasks > 0 && deltaNotes > 0) {
    headline = `${headline} · mejor captura y más cierres`;
  }

  return { score, headline, strengths, focusAreas, nextStep, context };
}

export function buildWeeklyReviewMarkdown(
  current: WeeklyUsageAnalytics,
  previous: WeeklyUsageAnalytics,
  feedback: WeeklyFeedback,
  checklist: Array<{ label: string; done: boolean }>,
) {
  const completed = checklist.filter((item) => item.done).length;
  return [
    "# Week Review",
    "",
    `- Semana: ${current.weekStart} → ${current.weekEnd}`,
    `- Score: ${feedback.score}/100`,
    `- Headline: ${feedback.headline}`,
    "",
    "## Feedback",
    `- Contexto: ${feedback.context}`,
    `- Siguiente paso: ${feedback.nextStep}`,
    "",
    "## Strengths",
    ...feedback.strengths.map((item) => `- ${item}`),
    "",
    "## Focus areas",
    ...feedback.focusAreas.map((item) => `- ${item}`),
    "",
    "## Weekly usage",
    `- Tasks done: ${current.tasksDone} (prev ${previous.tasksDone})`,
    `- Tasks created: ${current.tasksCreated} (prev ${previous.tasksCreated})`,
    `- Events: ${current.events} (prev ${previous.events})`,
    `- Workouts: ${current.workouts} (prev ${previous.workouts})`,
    `- Notes: ${current.notes} (prev ${previous.notes})`,
    `- Projects updated: ${current.projectsUpdated} (prev ${previous.projectsUpdated})`,
    `- Logs created: ${current.logsCreated} (prev ${previous.logsCreated})`,
    `- Checklist: ${completed}/${checklist.length}`,
    "",
    "## Checklist",
    ...checklist.map((item) => `- [${item.done ? "x" : " "}] ${item.label}`),
    "",
  ].join("\n");
}
