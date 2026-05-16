import { useEffect, useState } from "react";
import { PageTitle } from "../../components/layout/PageTitle";
import { getEnvDiagnostics, IS_MOCK } from "../../lib/constants";
import { db } from "../../lib/store";
import { flushSyncQueue, probeSupabaseConnection } from "../../lib/supabaseSync";
import { subscribeSyncStatus, type SyncState } from "../../lib/syncStatus";
import { listSyncQueue } from "../../lib/syncQueue";
import { listGoals } from "../../lib/goals";

export default function SettingsPage() {
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState("");
  const [queueResult, setQueueResult] = useState("");
  const [syncState, setSyncState] = useState<SyncState>({ connected: false, saving: false, lastSavedAt: null, error: null });
  const env = getEnvDiagnostics();
  const queueItems = listSyncQueue();

  useEffect(() => subscribeSyncStatus(setSyncState), []);

  const handleResetFitness = () => {
    const ok = window.confirm("Esto reiniciará métricas de Fitness a cero. ¿Continuar?");
    if (!ok) return;
    db.resetFitnessState();
    setMessage("Fitness reiniciado a cero.");
  };

  const handleProbeConnection = async () => {
    setChecking(true);
    const ok = await probeSupabaseConnection();
    setCheckResult(ok ? "Conexión OK con Supabase." : "Fallo de conexión. Revisa variables/env o políticas RLS.");
    setChecking(false);
  };

  const handleRetryQueue = async () => {
    const result = await flushSyncQueue();
    setQueueResult(`Reintentados: ${result.retried} · OK: ${result.succeeded} · Fallidos: ${result.failed}`);
  };

  const handleBackupExport = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      db: db.load(),
      goals: listGoals(),
      review: localStorage.getItem("ebnjaos-weekly-review-v1"),
      version: "v1",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ebnjaos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBackupImport = async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text) as {
      db?: ReturnType<typeof db.load>;
      goals?: unknown;
      review?: string | null;
    };
    if (parsed.db) db.save(parsed.db);
    if (parsed.goals) localStorage.setItem("ebnjaos-goals-v1", JSON.stringify(parsed.goals));
    if (typeof parsed.review === "string") localStorage.setItem("ebnjaos-weekly-review-v1", parsed.review);
    setMessage("Backup restaurado. Recarga la app para ver todo actualizado.");
  };

  return (
    <div className="space-y-4">
      <PageTitle title="Settings" subtitle="Perfil, Supabase e integraciones" />

      <section className="card space-y-2 text-sm">
        <p>Estado Supabase: <strong>{IS_MOCK ? "Mock mode" : "Conectado"}</strong></p>
        <p>Estado de red app: <strong>{syncState.connected ? "Conexión activa" : "Sin conexión"}</strong></p>
        {syncState.error && <p className="text-xs text-danger">Último error: {syncState.error}</p>}
        <p className="text-xs text-texts">
          Último guardado: {syncState.lastSavedAt ? new Date(syncState.lastSavedAt).toLocaleString("es-CL") : "Sin registro"}
        </p>
        <p>Google Calendar: preparado para fase 2 (sin OAuth activo).</p>
        <p>Preferencias visuales: paleta sobria activa.</p>
      </section>

      <section className="card space-y-2 text-sm">
        <h3 className="text-sm font-semibold">Diagnóstico de entorno</h3>
        <p>VITE_SUPABASE_URL: <strong>{env.hasUrl ? "Definida" : "Falta"}</strong> · {env.urlPreview}</p>
        <p>VITE_SUPABASE_ANON_KEY: <strong>{env.hasAnonKey ? "Definida" : "Falta"}</strong> · largo {env.anonKeyLength}</p>
        <p>VITE_SINGLE_USER_ID: <strong>{env.singleUserId}</strong></p>
        <p>
          Validación runtime: <strong>{env.urlLooksReal && env.anonLooksReal ? "Variables reales detectadas" : "Variables incompletas o placeholder"}</strong>
        </p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={handleProbeConnection} disabled={checking}>
            {checking ? "Probando..." : "Probar conexión"}
          </button>
        </div>
        {checkResult && <p className="text-xs text-texts">{checkResult}</p>}
      </section>

      <section className="card space-y-2 text-sm">
        <h3 className="text-sm font-semibold">Cola de sincronización</h3>
        <p>Elementos pendientes: <strong>{queueItems.length}</strong></p>
        <button className="btn-ghost" onClick={handleRetryQueue}>Reintentar cola</button>
        {queueResult && <p className="text-xs text-texts">{queueResult}</p>}
      </section>

      <section className="card space-y-2 text-sm">
        <h3 className="text-sm font-semibold">Backup y restauración</h3>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={handleBackupExport}>Exportar backup JSON</button>
          <label className="btn-ghost cursor-pointer">
            Importar backup
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleBackupImport(file);
              }}
            />
          </label>
        </div>
      </section>

      <section className="card space-y-3 text-sm">
        <h3 className="text-sm font-semibold">Mantenimiento</h3>
        <p className="text-texts">Si quieres comenzar nuevamente, puedes reiniciar las métricas del módulo Fitness.</p>
        <button className="btn-ghost" onClick={handleResetFitness}>Resetear Fitness</button>
        {message && <p className="text-xs text-accent">{message}</p>}
      </section>
    </div>
  );
}
