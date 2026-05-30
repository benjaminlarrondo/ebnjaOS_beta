import { setConnected, setSaving, setSyncError } from "../../lib/syncStatus";
import { syncCalendarBackground } from "./calendarSync";
import { probeGithubSyncSource } from "./githubSync";
import { syncSupabaseState } from "./supabaseSync";

export type SyncManagerState = "idle" | "syncing" | "success" | "error";

let state: SyncManagerState = "idle";
let lastSyncAt: string | null = null;

export function getSyncManagerState() {
  return { state, lastSyncAt };
}

export async function startBackgroundSync() {
  state = "syncing";
  setSaving(true);
  setSyncError(null);

  let hadError = false;

  try {
    await syncSupabaseState();
  } catch (error) {
    hadError = true;
    setConnected(false);
    setSyncError(error instanceof Error ? error.message : "Error en sync Supabase");
  }

  try {
    await probeGithubSyncSource();
  } catch (error) {
    hadError = true;
    setConnected(false);
    setSyncError(error instanceof Error ? error.message : "Error en sync GitHub");
  }

  try {
    await syncCalendarBackground();
  } catch (error) {
    hadError = true;
    setConnected(false);
    setSyncError(error instanceof Error ? error.message : "Error en sync Calendar");
  }

  lastSyncAt = new Date().toISOString();
  state = hadError ? "error" : "success";
  setSaving(false);
  if (!hadError) setConnected(true);
}
