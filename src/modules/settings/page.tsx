import { useState } from "react";
import { PageTitle } from "../../components/layout/PageTitle";
import { IS_MOCK } from "../../lib/constants";
import { db } from "../../lib/store";

export default function SettingsPage() {
  const [message, setMessage] = useState("");

  const handleResetFitness = () => {
    const ok = window.confirm("Esto reiniciará métricas de Fitness a cero. ¿Continuar?");
    if (!ok) return;
    db.resetFitnessState();
    setMessage("Fitness reiniciado a cero.");
  };

  return (
    <div className="space-y-4">
      <PageTitle title="Settings" subtitle="Perfil, Supabase e integraciones" />

      <section className="card space-y-2 text-sm">
        <p>Estado Supabase: <strong>{IS_MOCK ? "Mock mode" : "Conectado"}</strong></p>
        <p>Google Calendar: preparado para fase 2 (sin OAuth activo).</p>
        <p>Preferencias visuales: paleta sobria activa.</p>
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
