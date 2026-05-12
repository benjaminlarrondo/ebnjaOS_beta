import type { Task } from "../types/task";
import type { CalendarEvent } from "../types/calendar";
import type { FitnessWorkout } from "../types/fitness";
import type { Note } from "../types/note";
import type { Prompt } from "../types/prompt";
import type { Resource } from "../types/resource";
import type { DailyLog } from "../types/daily-log";

export const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
export const mockUser = { id: "mock-user", email: "mock@ebnjaos.local", name: "Mock User" };

export const makeBase = () => ({ id: uid(), user_id: mockUser.id, created_at: now(), updated_at: now() });

export const seed = {
  focus: "Cerrar 3 decisiones clave hoy.",
  tasks: [{ ...makeBase(), title: "Revisar roadmap", description: "", status: "today", priority: "high", due_date: "", tags: [] }] as Task[],
  events: [{ ...makeBase(), title: "Sync semanal", description: "", start_time: new Date().toISOString(), end_time: new Date(Date.now()+3600000).toISOString(), source: "internal" }] as CalendarEvent[],
  workouts: [{ ...makeBase(), title: "Fuerza upper", date: new Date().toISOString().slice(0,10), type: "strength", duration_minutes: 50, intensity: 7, notes: "" }] as FitnessWorkout[],
  notes: [{ ...makeBase(), title: "Nota rápida", content: "Bloquear 30 min para planificar.", type: "quick", tags: [], pinned: false }] as Note[],
  prompts: [{ ...makeBase(), title: "Plan semanal", description: "", content: "Ayúdame a planificar", category: "productividad", tags: [], favorite: false }] as Prompt[],
  resources: [{ ...makeBase(), title: "Linear", description: "Referencia UX", url: "https://linear.app", type: "reference", tags: [], source: "web" }] as Resource[],
  logs: [{ ...makeBase(), date: new Date().toISOString().slice(0,10), focus: "Enfoque", wins: "", pending: "", energy_level: 7, workout_done: true, notes: "" }] as DailyLog[],
};
