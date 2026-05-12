import { useEffect, useState } from "react";
import { subscribeSyncStatus, type SyncState } from "../../lib/syncStatus";

function formatTime(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function SyncIndicator() {
  const [state, setState] = useState<SyncState>({ connected: false, saving: false, lastSavedAt: null, error: null });

  useEffect(() => subscribeSyncStatus(setState), []);

  const label = state.error
    ? "Error de sync"
    : state.saving
      ? "Guardando..."
      : state.connected
        ? "Conectado"
        : "Sin conexión";

  return (
    <div className="fixed bottom-2 left-1/2 z-40 -translate-x-1/2 rounded-full border border-borderc bg-white/95 px-3 py-1 text-[11px] text-texts shadow-sm">
      <span>{label}</span>
      {state.lastSavedAt && !state.saving && !state.error && (
        <span className="ml-2">• {formatTime(state.lastSavedAt)}</span>
      )}
    </div>
  );
}
