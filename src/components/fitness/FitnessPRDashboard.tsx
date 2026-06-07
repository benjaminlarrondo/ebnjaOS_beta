import { useEffect, useMemo, useState } from "react";
import { buildPRDashboard } from "../../lib/fitness/fitnessExecutionEngine";
import { loadLegacyPRRows } from "../../lib/repositories/fitnessExecutionRepository";
import type { FitnessExecutionCache, PRDashboardRow } from "../../lib/fitness/fitnessExecutionTypes";

function formatKg(value: number) {
  return `${Math.round(value)} kg`;
}

function metricTone(delta: number) {
  if (delta > 0) return "text-[#2b6b45]";
  if (delta < 0) return "text-[#a94444]";
  return "text-texts";
}

export function FitnessPRDashboard({ executionState }: { executionState: FitnessExecutionCache }) {
  const [legacyRows, setLegacyRows] = useState<Array<{ movement: string; value: number; date: string }>>([]);

  useEffect(() => {
    let cancelled = false;
    void loadLegacyPRRows().then((rows) => {
      if (!cancelled) setLegacyRows(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => buildPRDashboard(executionState.sessionLogs, executionState.setLogs, legacyRows), [executionState, legacyRows]);

  return (
    <section className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">PR Dashboard</p>
          <h3 className="text-sm font-semibold text-textp">Récords automáticos desde sesión real</h3>
          <p className="mt-1 text-xs text-texts">La información de `fitness_prs` se migra como histórico y los nuevos PRs salen de `fitness_set_logs`.</p>
        </div>
        <span className="pill-soft">{rows.length} lifts</span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <PRCard key={row.key} row={row} />
        ))}
      </div>
    </section>
  );
}

function PRCard({ row }: { row: PRDashboardRow }) {
  return (
    <article className="rounded-2xl border border-borderc bg-surface p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-texts">{row.label}</p>
          <p className="mt-1 text-base font-semibold text-textp">{formatKg(row.bestPr)}</p>
        </div>
        <span className={`rounded-full border border-borderc px-2 py-1 text-[10px] ${metricTone(row.monthlyImprovement)}`}>
          {row.trendLabel}
        </span>
      </div>

      <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
        <div className="inner-card">
          <p className="text-texts">Último PR</p>
          <p className="mt-1 font-semibold text-textp">{formatKg(row.lastPr)}</p>
        </div>
        <div className="inner-card">
          <p className="text-texts">Mejora mes</p>
          <p className={`mt-1 font-semibold ${metricTone(row.monthlyImprovement)}`}>
            {row.monthlyImprovement >= 0 ? "+" : ""}
            {Math.round(row.monthlyImprovement)} kg
          </p>
        </div>
        <div className="inner-card">
          <p className="text-texts">1RM est.</p>
          <p className="mt-1 font-semibold text-textp">{formatKg(row.estimated1rm)}</p>
        </div>
        <div className="inner-card">
          <p className="text-texts">Volumen</p>
          <p className="mt-1 font-semibold text-textp">{Math.round(row.totalVolume)} kg</p>
        </div>
      </div>

      <p className="mt-2 text-[11px] text-texts">
        Último registro {row.lastDate} · {row.sourceLabel}
      </p>
    </article>
  );
}
