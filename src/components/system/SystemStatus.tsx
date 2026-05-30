import { useEffect, useMemo, useState } from "react";
import { APP_NAME, IS_MOCK } from "../../lib/constants";
import { subscribeSyncStatus, type SyncState } from "../../lib/syncStatus";
import { getLastCalendarSyncAt } from "../../services/githubCalendarSync";

function formatTime(iso: string | null) {
  if (!iso) return "Sin registro";
  return new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function appVersion() {
  const parts = APP_NAME.split(" ");
  return parts[parts.length - 1] || "v0";
}

export function SystemStatus({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<SyncState>({ connected: false, saving: false, lastSavedAt: null, error: null });

  useEffect(() => subscribeSyncStatus(setState), []);

  const status = useMemo(() => {
    if (state.error) return "OFFLINE";
    if (state.saving) return "SYNC PENDIENTE";
    if (state.connected) return "ONLINE";
    return IS_MOCK ? "SYNC PENDIENTE" : "OFFLINE";
  }, [state]);

  const statusTone =
    status === "ONLINE" ? "status-pill--success" : status === "SYNC PENDIENTE" ? "status-pill--accent" : "";
  const calendarSync = getLastCalendarSyncAt();

  if (compact) {
    return (
      <div className="rounded-2xl border border-borderc bg-surface p-3 text-xs">
        <div className="mb-2 flex items-center justify-between">
          <span className={`status-pill ${statusTone}`}>{status}</span>
          <span className="text-textm">{appVersion()}</span>
        </div>
        <p className="text-texts">Supabase: {IS_MOCK ? "Mock" : state.connected ? "Conectado" : "Sin conexión"}</p>
        <p className="text-texts">Último sync: {formatTime(state.lastSavedAt)}</p>
        <p className="text-texts">Calendar: {calendarSync ? "Sincronizado" : "Pendiente"}</p>
      </div>
    );
  }

  return (
    <section className="card space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Estado de plataforma</h3>
        <span className={`status-pill ${statusTone}`}>{status}</span>
      </div>
      <p>Estado Supabase: <strong>{IS_MOCK ? "Mock mode" : state.connected ? "Conectado" : "Sin conexión"}</strong></p>
      <p>Última sincronización: <strong>{formatTime(state.lastSavedAt)}</strong></p>
      <p>Estado Calendar: <strong>{calendarSync ? `Sincronizado (${formatTime(calendarSync)})` : "Pendiente"}</strong></p>
      <p>Version app: <strong>{appVersion()}</strong></p>
      {state.error && <p className="text-xs text-danger">Error: {state.error}</p>}
    </section>
  );
}
