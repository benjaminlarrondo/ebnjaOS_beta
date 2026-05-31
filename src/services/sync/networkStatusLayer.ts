export type NetworkService = "github" | "supabase" | "calendar";
export type NetworkState = "idle" | "ok" | "degraded" | "offline";

export type NetworkSnapshot = {
  github: NetworkState;
  supabase: NetworkState;
  calendar: NetworkState;
  updatedAt: string | null;
};

const snapshot: NetworkSnapshot = {
  github: "idle",
  supabase: "idle",
  calendar: "idle",
  updatedAt: null,
};

const listeners = new Set<(value: NetworkSnapshot) => void>();

function emit() {
  snapshot.updatedAt = new Date().toISOString();
  for (const listener of listeners) {
    listener({ ...snapshot });
  }
}

export function setNetworkState(service: NetworkService, state: NetworkState) {
  snapshot[service] = state;
  emit();
}

export function getNetworkSnapshot() {
  return { ...snapshot };
}

export function subscribeNetworkStatus(listener: (value: NetworkSnapshot) => void) {
  listeners.add(listener);
  listener({ ...snapshot });
  return () => listeners.delete(listener);
}
