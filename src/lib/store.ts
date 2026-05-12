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
  sessionsPending: 7,
  weeklyStreak: 0,
  bodyWeightKg: 0,
  prsThisCycle: 0,
  weeklyVolume: 0,
  sleepAvg: 0,
  adherencePct: 0,
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
    fitnessState: parsed.fitnessState ?? defaultFitnessState,
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
    d.fitnessState = { ...d.fitnessState, ...next };
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
