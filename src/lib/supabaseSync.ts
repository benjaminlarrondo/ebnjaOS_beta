import type { CalendarEvent } from "../types/calendar";
import type { DailyLog } from "../types/daily-log";
import type { FitnessWorkout } from "../types/fitness";
import type { Note } from "../types/note";
import type { Project } from "../types/project";
import type { Prompt } from "../types/prompt";
import type { Resource } from "../types/resource";
import type { Task } from "../types/task";
import { IS_MOCK } from "./constants";
import { supabase } from "./supabase";
import { setConnected, setSaving, setSyncError } from "./syncStatus";

export type SupaCollection = "tasks" | "events" | "workouts" | "notes" | "prompts" | "resources" | "logs" | "projects";

const SINGLE_USER_ID = import.meta.env.VITE_SINGLE_USER_ID || "00000000-0000-0000-0000-000000000001";

const tableMap: Record<SupaCollection, string> = {
  tasks: "tasks",
  events: "calendar_events",
  workouts: "fitness_workouts",
  notes: "notes",
  prompts: "prompts",
  resources: "resources",
  logs: "daily_logs",
  projects: "projects",
};

function normalizeForDb(key: SupaCollection, row: Record<string, unknown>) {
  if (key === "events") {
    const event = row as unknown as CalendarEvent;
    return {
      id: event.id,
      user_id: event.user_id || SINGLE_USER_ID,
      title: event.title,
      description: event.description || "",
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location || "",
      source: event.source || "manual",
      google_event_id: event.google_event_id || null,
      source_id: event.source_id || null,
      source_repo: event.source_repo || null,
      source_url: event.source_url || null,
      external_updated_at: event.external_updated_at || null,
      sync_status: event.sync_status || "synced",
      event_type: event.event_type || "event",
      metadata: event.metadata || {},
      created_at: event.created_at,
      updated_at: event.updated_at,
    };
  }

  if (key === "workouts") {
    const workout = row as unknown as FitnessWorkout;
    return {
      id: workout.id,
      user_id: workout.user_id || SINGLE_USER_ID,
      title: workout.title,
      date: workout.date,
      type: workout.type,
      duration_minutes: workout.duration_minutes,
      intensity: workout.intensity,
      notes: workout.notes || "",
      created_at: workout.created_at,
      updated_at: workout.updated_at,
    };
  }

  if (key === "logs") {
    const log = row as unknown as DailyLog;
    return {
      id: log.id,
      user_id: log.user_id || SINGLE_USER_ID,
      date: log.date,
      focus: log.focus || "",
      wins: log.wins || "",
      pending: log.pending || "",
      energy_level: log.energy_level || 0,
      workout_done: log.workout_done || false,
      notes: log.notes || "",
      created_at: log.created_at,
      updated_at: log.updated_at,
    };
  }

  if (key === "notes") {
    const note = row as unknown as Note;
    return { ...note, user_id: note.user_id || SINGLE_USER_ID };
  }

  if (key === "prompts") {
    const prompt = row as unknown as Prompt;
    return { ...prompt, user_id: prompt.user_id || SINGLE_USER_ID };
  }

  if (key === "resources") {
    const resource = row as unknown as Resource;
    return { ...resource, user_id: resource.user_id || SINGLE_USER_ID };
  }

  if (key === "projects") {
    const project = row as unknown as Project;
    return { ...project, user_id: project.user_id || SINGLE_USER_ID };
  }

  const task = row as unknown as Task;
  return { ...task, user_id: task.user_id || SINGLE_USER_ID };
}

export async function probeSupabaseConnection() {
  if (IS_MOCK) {
    setConnected(false);
    return false;
  }

  const { error } = await supabase.from("projects").select("id").limit(1);
  if (error) {
    setConnected(false);
    setSyncError(error.message);
    return false;
  }
  setConnected(true);
  setSyncError(null);
  return true;
}

export async function pullCollection(key: SupaCollection) {
  if (!(await probeSupabaseConnection())) return null;
  const table = tableMap[key];
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("user_id", SINGLE_USER_ID)
    .order("created_at", { ascending: false });

  if (error) {
    setConnected(false);
    setSyncError(error.message);
    return null;
  }

  setConnected(true);
  setSyncError(null);
  return (data ?? []) as Record<string, unknown>[];
}

export async function pushUpsertCollectionItem(key: SupaCollection, row: Record<string, unknown>) {
  if (!(await probeSupabaseConnection())) return;
  const table = tableMap[key];
  const payload = normalizeForDb(key, row);
  setSaving(true);
  const { error } = await supabase.from(table).upsert(payload as never, { onConflict: "id" });
  if (error) {
    setConnected(false);
    setSyncError(error.message);
  } else {
    setConnected(true);
    setSyncError(null);
  }
  setSaving(false);
}

export async function pushDeleteCollectionItem(key: SupaCollection, id: string) {
  if (!(await probeSupabaseConnection())) return;
  const table = tableMap[key];
  setSaving(true);
  const { error } = await supabase.from(table).delete().eq("id", id).eq("user_id", SINGLE_USER_ID);
  if (error) {
    setConnected(false);
    setSyncError(error.message);
  } else {
    setConnected(true);
    setSyncError(null);
  }
  setSaving(false);
}

export async function hydrateAllFromSupabase() {
  const keys: SupaCollection[] = ["tasks", "events", "workouts", "notes", "prompts", "resources", "logs", "projects"];
  const out: Partial<Record<SupaCollection, Record<string, unknown>[]>> = {};

  for (const key of keys) {
    const rows = await pullCollection(key);
    if (rows) out[key] = rows;
  }

  return out;
}

export function getSingleUserId() {
  return SINGLE_USER_ID;
}
