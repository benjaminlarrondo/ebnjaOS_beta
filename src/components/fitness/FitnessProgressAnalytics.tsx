import { useEffect, useState } from "react";
import { loadFitnessProgressRows } from "../../lib/repositories/fitnessExecutionRepository";
import type { FitnessProgressRow, ProgressAnalyticsModel } from "../../lib/fitness/fitnessExecutionTypes";

function metricTone(delta: number) {
  if (delta > 0) return "text-[#2b6b45]";
  if (delta < 0) return "text-[#a94444]";
  return "text-texts";
}

function formatSignedKg(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${Math.round(value)} kg`;
}

function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${Math.round(value)}%`;
}

export function FitnessProgressAnalytics({ analytics }: { analytics: ProgressAnalyticsModel }) {
  const [progressRows, setProgressRows] = useState<FitnessProgressRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    void loadFitnessProgressRows().then((rows) => {
      if (!cancelled) setProgressRows(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="space-y-3">
      <div className="card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Progress</p>
            <h3 className="text-sm font-semibold text-textp">Fuerza, físico y adherencia</h3>
            <p className="mt-1 text-xs text-texts">La capa de progreso convierte rutinas y sesiones en señales operativas.</p>
          </div>
          <span className="pill-soft">Live data</span>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="inner-card">
            <p className="text-xs text-texts">Peso actual</p>
            <p className="mt-1 text-xl font-semibold text-textp">{analytics.physical.currentWeight ? `${analytics.physical.currentWeight.toFixed(1)} kg` : "—"}</p>
          </div>
          <div className="inner-card">
            <p className="text-xs text-texts">Tendencia 30 días</p>
            <p className={`mt-1 text-xl font-semibold ${metricTone(analytics.physical.trend30d)}`}>{formatSignedKg(analytics.physical.trend30d)}</p>
          </div>
          <div className="inner-card">
            <p className="text-xs text-texts">Tendencia 90 días</p>
            <p className={`mt-1 text-xl font-semibold ${metricTone(analytics.physical.trend90d)}`}>{formatSignedKg(analytics.physical.trend90d)}</p>
          </div>
          <div className="inner-card">
            <p className="text-xs text-texts">Cumplimiento</p>
            <p className="mt-1 text-xl font-semibold text-textp">{analytics.adherence.fulfillmentPct}%</p>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-borderc bg-surface px-3 py-2">
          <p className="text-xs text-texts">fitness_progress</p>
          <p className="mt-1 text-sm font-semibold text-textp">{progressRows.length} snapshots</p>
          <p className="mt-1 text-xs text-texts">Persistencia de progreso disponible para mesociclos y deloads.</p>
        </div>
      </div>

      <section className="grid gap-3 xl:grid-cols-2">
        <article className="card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Fuerza</p>
              <h3 className="text-sm font-semibold text-textp">PR actual · histórico · 1RM · volumen</h3>
            </div>
            <span className="pill-soft">{analytics.strength.length} lifts</span>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {analytics.strength.map((row) => (
              <div key={row.key} className="rounded-2xl border border-borderc bg-surface p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-texts">{row.label}</p>
                    <p className="mt-1 text-base font-semibold text-textp">{row.lastPr ? `${Math.round(row.lastPr)} kg` : "—"}</p>
                  </div>
                  <span className={`rounded-full border border-borderc px-2 py-1 text-[10px] ${metricTone(row.monthlyImprovement)}`}>{row.trendLabel}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="inner-card">
                    <p className="text-texts">Histórico</p>
                    <p className="mt-1 font-semibold text-textp">{row.bestPr ? `${Math.round(row.bestPr)} kg` : "—"}</p>
                  </div>
                  <div className="inner-card">
                    <p className="text-texts">1RM est.</p>
                    <p className="mt-1 font-semibold text-textp">{row.estimated1rm ? `${Math.round(row.estimated1rm)} kg` : "—"}</p>
                  </div>
                  <div className="inner-card">
                    <p className="text-texts">Volumen</p>
                    <p className="mt-1 font-semibold text-textp">{Math.round(row.totalVolume)} kg</p>
                  </div>
                  <div className="inner-card">
                    <p className="text-texts">Mes</p>
                    <p className={`mt-1 font-semibold ${metricTone(row.monthlyImprovement)}`}>{row.monthlyImprovement ? formatSignedKg(row.monthlyImprovement) : "0 kg"}</p>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-texts">Último {row.lastDate} · {row.sourceLabel}</p>
              </div>
            ))}
          </div>
        </article>

        <div className="space-y-3">
          <article className="card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Adherencia</p>
                <h3 className="text-sm font-semibold text-textp">Streak y consistencia</h3>
              </div>
              <span className="pill-soft">{analytics.adherence.weeklyWorkouts} semana</span>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="inner-card">
                <p className="text-xs text-texts">Entrenos completados</p>
                <p className="mt-1 text-xl font-semibold text-textp">{analytics.adherence.completedWorkouts}</p>
              </div>
              <div className="inner-card">
                <p className="text-xs text-texts">Streak</p>
                <p className="mt-1 text-xl font-semibold text-textp">{analytics.adherence.streak}</p>
              </div>
              <div className="inner-card">
                <p className="text-xs text-texts">Consistencia</p>
                <p className="mt-1 text-xl font-semibold text-textp">{analytics.adherence.consistency}%</p>
              </div>
              <div className="inner-card">
                <p className="text-xs text-texts">Cumplimiento</p>
                <p className="mt-1 text-xl font-semibold text-textp">{analytics.adherence.fulfillmentPct}%</p>
              </div>
            </div>
          </article>

          <article className="card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Lectura rápida</p>
                <h3 className="text-sm font-semibold text-textp">¿Estoy progresando?</h3>
              </div>
              <span className="pill-soft">Resumen</span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="inner-card">
                <p className="text-xs text-texts">Peso</p>
                <p className="mt-1 font-semibold text-textp">{analytics.physical.currentWeight ? `${analytics.physical.currentWeight.toFixed(1)} kg` : "Sin datos"}</p>
              </div>
              <div className="inner-card">
                <p className="text-xs text-texts">Progreso mensual</p>
                <p className="mt-1 font-semibold text-textp">{formatPercent(analytics.adherence.consistency)}</p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </section>
  );
}
