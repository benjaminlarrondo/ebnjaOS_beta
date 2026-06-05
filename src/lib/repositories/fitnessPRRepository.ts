import { getSingleUserId } from "../supabaseSync";
import { pullRows, upsertRows } from "./syncRepository";

export type PRKey = "deadlift" | "back_squat" | "front_squat" | "clean" | "bench_press";

export type PREntry = {
  id: string;
  date: string;
  value: number;
};

export type PRState = Record<PRKey, PREntry[]>;

export type FitnessPRRow = {
  id: string;
  user_id: string;
  movement: string;
  value: number;
  unit: string;
  date: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
};

const STORAGE_KEY = "ebnjaos-fitness-pr-v1";

export const fitnessPRLabels: Record<PRKey, string> = {
  deadlift: "Deadlift",
  back_squat: "Back Squat",
  front_squat: "Front Squat",
  clean: "Clean",
  bench_press: "Bench Press",
};

function emptyState(): PRState {
  return {
    deadlift: [],
    back_squat: [],
    front_squat: [],
    clean: [],
    bench_press: [],
  };
}

function normalizeKey(value: string): PRKey | null {
  if (value in fitnessPRLabels) return value as PRKey;
  return null;
}

function hashString(input: string) {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  let h3 = 0xc0decafe ^ input.length;
  let h4 = 0x9e3779b9 ^ input.length;

  for (let index = 0; index < input.length; index += 1) {
    const ch = input.charCodeAt(index);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 2246822519);
    h4 = Math.imul(h4 ^ ch, 3266489917);
  }

  h1 = (h1 ^ (h1 >>> 16)) >>> 0;
  h2 = (h2 ^ (h2 >>> 16)) >>> 0;
  h3 = (h3 ^ (h3 >>> 16)) >>> 0;
  h4 = (h4 ^ (h4 >>> 16)) >>> 0;
  return [h1, h2, h3, h4];
}

function toUuid(seed: string) {
  const [a, b, c, d] = hashString(seed);
  const hex = [
    a.toString(16).padStart(8, "0"),
    b.toString(16).padStart(8, "0"),
    c.toString(16).padStart(8, "0"),
    d.toString(16).padStart(8, "0"),
  ].join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function normalizeRows(rows: FitnessPRRow[]): PRState {
  const state = emptyState();
  for (const row of rows) {
    const key = normalizeKey(row.movement);
    if (!key) continue;
    state[key].push({
      id: row.id,
      date: row.date,
      value: row.value,
    });
  }

  for (const key of Object.keys(state) as PRKey[]) {
    state[key].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  }

  return state;
}

function mergeState(base: PRState, next: PRState): PRState {
  const merged = emptyState();
  for (const key of Object.keys(merged) as PRKey[]) {
    const byId = new Map<string, PREntry>();
    for (const entry of [...base[key], ...next[key]]) {
      byId.set(entry.id, entry);
    }
    merged[key] = Array.from(byId.values()).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  }
  return merged;
}

export function loadFitnessPRState(): PRState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyState();
  try {
    const parsed = JSON.parse(raw) as Partial<PRState>;
    return {
      deadlift: parsed.deadlift ?? [],
      back_squat: parsed.back_squat ?? [],
      front_squat: parsed.front_squat ?? [],
      clean: parsed.clean ?? [],
      bench_press: parsed.bench_press ?? [],
    };
  } catch {
    return emptyState();
  }
}

export function saveFitnessPRState(state: PRState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function hydrateFitnessPRStateFromRemote(): Promise<PRState> {
  try {
    const rows = await pullRows<FitnessPRRow>("fitness_prs", getSingleUserId(), "id,user_id,movement,value,unit,date,notes,created_at,updated_at");
    const remoteState = normalizeRows(rows);
    const merged = mergeState(loadFitnessPRState(), remoteState);
    saveFitnessPRState(merged);
    return merged;
  } catch {
    return loadFitnessPRState();
  }
}

export async function appendFitnessPREntry(key: PRKey, value: number, date = new Date().toISOString().slice(0, 10)) {
  const state = loadFitnessPRState();
  const id = toUuid(`${getSingleUserId()}|${key}|${date}|${value}`);
  const nextEntry: PREntry = { id, date, value };
  const nextState: PRState = {
    ...state,
    [key]: [...state[key].filter((entry) => entry.id !== id), nextEntry].sort(
      (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
    ),
  };

  saveFitnessPRState(nextState);

  const payload: FitnessPRRow = {
    id,
    user_id: getSingleUserId(),
    movement: key,
    value,
    unit: "kg",
    date,
    notes: "Imported from FitnessPRRepository",
  };

  try {
    await upsertRows<FitnessPRRow>("fitness_prs", [payload], "id");
  } catch {
    // offline cache fallback
  }

  return nextState;
}

export function normalizeFitnessPRRows(rows: FitnessPRRow[]) {
  return normalizeRows(rows);
}

