import { seed, mockUser, makeBase } from "./mock";
import { getSingleUserId, pushDeleteCollectionItem, pushUpsertCollectionItem } from "./supabaseSync";
import type { Task } from "../types/task";
import type { CalendarEvent } from "../types/calendar";
import type { FitnessWorkout } from "../types/fitness";
import type { Note } from "../types/note";
import type { Prompt } from "../types/prompt";
import type { Resource } from "../types/resource";
import type { DailyLog } from "../types/daily-log";
import type { Project } from "../types/project";

type FitnessState = {
  sessionsCompleted: number;
  sessionsPending: number;
  weeklyStreak: number;
  bodyWeightKg: number;
  prsThisCycle: number;
  weeklyVolume: number;
  sleepAvg: number;
  adherencePct: number;
  nextGymIndex: number;
  nextHomeIndex: number;
  lastSessionDate: string;
  lastSessionName: string;
  weekKey: string;
  resetMode: "manual" | "auto";
  gymCompleted: number;
  homeCompleted: number;
  weeklySchedule: Array<{
    date: string;
    mode: "Gym" | "Casa" | "Descanso";
    sessionId: string;
    completed: boolean;
  }>;
  exerciseWeightLogs: Array<{
    id: string;
    date: string;
    week: string;
    month: string;
    sessionId: string;
    sessionName: string;
    location: "Gym" | "Casa";
    exercises: Array<{
      name: string;
      prescription: string;
      weightKg: number;
    }>;
  }>;
  weeklyTracking: {
    week: string;
    weight: number;
    waist: number;
    chest: number;
    arm: number;
    leg: number;
    sleepAvg: number;
    energy: number;
    protein: number;
    gymCompleted: number;
    homeCompleted: number;
    totalSessions: number;
    notes: string;
    adherencePct: number;
  };
  recovery: {
    sleep: number;
    energy: number;
    fatigue: number;
    mobility: number;
  };
};

type DB = {
  focus: string;
  tasks: Task[];
  events: CalendarEvent[];
  workouts: FitnessWorkout[];
  notes: Note[];
  prompts: Prompt[];
  resources: Resource[];
  logs: DailyLog[];
  projects: Project[];
  fitnessState: FitnessState;
};

export type CollectionKey = Exclude<keyof DB, "focus" | "fitnessState">;
const KEY = "ebnjaos-db-v1";

const defaultFitnessState: FitnessState = {
  sessionsCompleted: 0,
  sessionsPending: 6,
  weeklyStreak: 0,
  bodyWeightKg: 0,
  prsThisCycle: 0,
  weeklyVolume: 0,
  sleepAvg: 0,
  adherencePct: 0,
  nextGymIndex: 0,
  nextHomeIndex: 0,
  lastSessionDate: "",
  lastSessionName: "",
  weekKey: "",
  resetMode: "manual",
  gymCompleted: 0,
  homeCompleted: 0,
  weeklySchedule: [],
  exerciseWeightLogs: [],
  weeklyTracking: {
    week: "",
    weight: 0,
    waist: 0,
    chest: 0,
    arm: 0,
    leg: 0,
    sleepAvg: 0,
    energy: 0,
    protein: 0,
    gymCompleted: 0,
    homeCompleted: 0,
    totalSessions: 0,
    notes: "",
    adherencePct: 0,
  },
  recovery: {
    sleep: 0,
    energy: 0,
    fatigue: 0,
    mobility: 0,
  },
};

function defaultDb(): DB {
  return { ...seed, projects: [], fitnessState: defaultFitnessState };
}

function load(): DB {
  const raw = localStorage.getItem(KEY);
  if (!raw) return defaultDb();
  const parsed = JSON.parse(raw) as Partial<DB>;
  const fitnessState = {
    ...defaultFitnessState,
    ...parsed.fitnessState,
    recovery: {
      ...defaultFitnessState.recovery,
      ...parsed.fitnessState?.recovery,
    },
    weeklyTracking: {
      ...defaultFitnessState.weeklyTracking,
      ...parsed.fitnessState?.weeklyTracking,
    },
    weeklySchedule: parsed.fitnessState?.weeklySchedule ?? [],
    exerciseWeightLogs: parsed.fitnessState?.exerciseWeightLogs ?? [],
  };

  return {
    focus: parsed.focus ?? seed.focus,
    tasks: parsed.tasks ?? seed.tasks,
    events: parsed.events ?? seed.events,
    workouts: parsed.workouts ?? seed.workouts,
    notes: parsed.notes ?? seed.notes,
    prompts: parsed.prompts ?? seed.prompts,
    resources: parsed.resources ?? seed.resources,
    logs: parsed.logs ?? seed.logs,
    projects: parsed.projects ?? [],
    fitnessState,
  };
}

function save(db: DB) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

export const db = {
  user: () => mockUser,
  load,
  save,
  resetFitnessState: () => {
    const d = load();
    d.fitnessState = { ...defaultFitnessState };
    save(d);
  },
  hydrateCollections: (input: Partial<Record<CollectionKey, Record<string, unknown>[]>>) => {
    const d = load();
    for (const [key, rows] of Object.entries(input)) {
      if (!rows) continue;
      (d[key as CollectionKey] as unknown as Record<string, unknown>[]) = rows;
    }
    save(d);
  },
  upsertFocus: (focus: string) => {
    const d = load();
    d.focus = focus;
    save(d);
    return d.focus;
  },
  getFitnessState: () => load().fitnessState,
  setFitnessState: (next: Partial<FitnessState>) => {
    const d = load();
    d.fitnessState = {
      ...d.fitnessState,
      ...next,
      recovery: next.recovery ? { ...d.fitnessState.recovery, ...next.recovery } : d.fitnessState.recovery,
      weeklyTracking: next.weeklyTracking
        ? { ...d.fitnessState.weeklyTracking, ...next.weeklyTracking }
        : d.fitnessState.weeklyTracking,
    };
    save(d);
    return d.fitnessState;
  },
  list: <K extends CollectionKey>(k: K): DB[K] => load()[k],
  create: <K extends CollectionKey>(k: K, data: Record<string, unknown>) => {
    const d = load();
    const item = { ...makeBase(), user_id: getSingleUserId(), ...data };
    const arr = d[k] as unknown as Array<Record<string, unknown>>;
    arr.unshift(item);
    (d[k] as unknown as Array<Record<string, unknown>>) = arr;
    save(d);
    void pushUpsertCollectionItem(k, item);
    return item;
  },
  update: <K extends CollectionKey>(k: K, id: string, patch: Record<string, unknown>) => {
    const d = load();
    const arr = d[k] as unknown as Array<Record<string, unknown>>;
    const nextArr = arr.map((x) =>
      x.id === id ? { ...x, ...patch, updated_at: new Date().toISOString() } : x,
    );
    (d[k] as unknown as Array<Record<string, unknown>>) = nextArr;
    save(d);
    const updated = nextArr.find((x) => x.id === id);
    if (updated) void pushUpsertCollectionItem(k, updated);
  },
  remove: <K extends CollectionKey>(k: K, id: string) => {
    const d = load();
    const arr = d[k] as unknown as Array<Record<string, unknown>>;
    (d[k] as unknown as Array<Record<string, unknown>>) = arr.filter((x) => x.id !== id);
    save(d);
    void pushDeleteCollectionItem(k, id);
  },
};
