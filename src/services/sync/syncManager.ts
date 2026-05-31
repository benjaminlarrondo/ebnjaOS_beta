import { setConnected, setSaving, setSyncError } from "../../lib/syncStatus";
import { syncCalendarBackground } from "./calendarSync";
import { probeGithubSyncSource } from "./githubSync";
import { syncSupabaseState } from "./supabaseSync";
import { runSilently } from "./backgroundErrorHandling";
import { setNetworkState } from "./networkStatusLayer";

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

  const supabaseResult = await runSilently(() => syncSupabaseState(), { ok: false as const, hydrated: false as const });
  if (!supabaseResult.ok) {
    hadError = true;
    setNetworkState("supabase", "degraded");
  } else {
    setNetworkState("supabase", "ok");
  }

  const githubProbe = await runSilently(() => probeGithubSyncSource(), null);
  if (!githubProbe) {
    hadError = true;
    setNetworkState("github", "degraded");
  } else {
    setNetworkState("github", "ok");
  }

  const calendarSync = await runSilently(() => syncCalendarBackground(), null);
  if (!calendarSync) {
    hadError = true;
    setNetworkState("calendar", "degraded");
  } else {
    setNetworkState("calendar", "ok");
  }

  lastSyncAt = new Date().toISOString();
  state = hadError ? "error" : "success";
  setSaving(false);
  setConnected(!hadError);
}
