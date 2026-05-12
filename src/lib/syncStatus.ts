export type SyncState = {
  connected: boolean;
  saving: boolean;
  lastSavedAt: string | null;
  error: string | null;
};

type Listener = (state: SyncState) => void;

const state: SyncState = {
  connected: false,
  saving: false,
  lastSavedAt: null,
  error: null,
};

const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l({ ...state });
}

export function subscribeSyncStatus(listener: Listener) {
  listeners.add(listener);
  listener({ ...state });
  return () => {
    listeners.delete(listener);
  };
}

export function setConnected(connected: boolean) {
  state.connected = connected;
  if (connected) state.error = null;
  emit();
}

export function setSaving(saving: boolean) {
  state.saving = saving;
  if (!saving) state.lastSavedAt = new Date().toISOString();
  emit();
}

export function setSyncError(error: string | null) {
  state.error = error;
  emit();
}
