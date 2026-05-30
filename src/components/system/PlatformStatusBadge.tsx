import { useEffect, useMemo, useRef, useState } from "react";
import { APP_NAME, IS_MOCK } from "../../lib/constants";
import { subscribeSyncStatus, type SyncState } from "../../lib/syncStatus";
import { getLastCalendarSyncAt } from "../../services/githubCalendarSync";

function formatTime(iso: string | null) {
  if (!iso) return "Sin registro";
  return new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
}

function appVersion() {
  const parts = APP_NAME.split(" ");
  return parts[parts.length - 1] || "v0";
}

export function PlatformStatusBadge({ inMoreMenu = false }: { inMoreMenu?: boolean }) {
  const [state, setState] = useState<SyncState>({ connected: false, saving: false, lastSavedAt: null, error: null });
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => subscribeSyncStatus(setState), []);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const status = useMemo(() => {
    if (state.error) return { label: "OFFLINE", tone: "text-danger", dot: "bg-danger" };
    if (state.saving) return { label: "SYNC", tone: "text-primary", dot: "bg-primary" };
    if (state.connected || IS_MOCK) return { label: "ONLINE", tone: "text-success", dot: "bg-success" };
    return { label: "OFFLINE", tone: "text-danger", dot: "bg-danger" };
  }, [state]);

  const calendarSync = getLastCalendarSyncAt();
  const supabaseLabel = IS_MOCK ? "Mock" : state.connected ? "Conectado" : "Sin conexión";
  const calendarLabel = calendarSync ? "Sincronizado" : "Pendiente";

  if (inMoreMenu) {
    return (
      <section className="card space-y-2">
        <h3 className="text-sm font-semibold">Estado del sistema</h3>
        <p className="flex items-center gap-2 text-sm">
          <span className={`h-2.5 w-2.5 rounded-full ${status.dot}`} />
          <span className={status.tone}>{status.label}</span>
        </p>
        <p className="text-sm text-texts">Supabase {supabaseLabel}</p>
        <p className="text-sm text-texts">Calendario {calendarLabel}</p>
        <p className="text-sm text-texts">Último sync {formatTime(state.lastSavedAt)}</p>
        <p className="text-sm text-texts">Versión {appVersion()}</p>
      </section>
    );
  }

  return (
    <div
      ref={rootRef}
      className="relative hidden md:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="Estado plataforma"
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 max-w-[120px] items-center gap-1.5 rounded-full border border-borderc bg-surface px-2 text-xs"
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`} />
        <span className={`hidden truncate font-semibold lg:block ${status.tone}`}>{status.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-borderc bg-surface p-2 text-xs shadow-sm">
          <p className="flex items-center gap-1.5 text-textp">
            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
            <span className={`font-semibold ${status.tone}`}>{status.label}</span>
          </p>
          <p className="mt-2 text-texts">Supabase: {supabaseLabel}</p>
          <p className="text-texts">Calendario: {calendarLabel}</p>
          <p className="text-texts">Último Sync: {formatTime(state.lastSavedAt)}</p>
          <p className="text-texts">Versión: {appVersion()}</p>
        </div>
      )}
    </div>
  );
}
