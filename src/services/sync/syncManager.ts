import { setConnected, setSaving, setSyncError } from "../../lib/syncStatus";
import { probeGithubSyncSource } from "./githubSync";
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

  setNetworkState("supabase", "degraded");

  const githubProbe = await runSilently(() => probeGithubSyncSource(), null);
  if (!githubProbe) {
    hadError = true;
    setNetworkState("github", "degraded");
    setNetworkState("calendar", "degraded");
  } else {
    setNetworkState("github", "ok");
    setNetworkState("calendar", "ok");
  }

  lastSyncAt = new Date().toISOString();
  state = hadError ? "error" : "success";
  setSaving(false);
  setConnected(!hadError);
}
