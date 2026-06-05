import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  appendFitnessPREntry,
  fitnessPRLabels,
  hydrateFitnessPRStateFromRemote,
  loadFitnessPRState,
  type PRKey,
  type PREntry,
  type PRState,
} from "../../lib/repositories/fitnessPRRepository";

function monthlyDelta(logs: PREntry[]) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonth = logs.filter((entry) => entry.date.startsWith(currentMonth));
  if (thisMonth.length < 2) return 0;
  return Math.round(thisMonth[thisMonth.length - 1].value - thisMonth[0].value);
}

function trend(logs: PREntry[]) {
  if (logs.length < 3) return "base";
  const tail = logs.slice(-3).map((entry) => entry.value);
  if (tail[2] > tail[1] && tail[1] >= tail[0]) return "↗";
  if (tail[2] < tail[1] && tail[1] <= tail[0]) return "↘";
  return "→";
}

export function FitnessPRTracker() {
  const [state, setState] = useState<PRState>(loadFitnessPRState());
  const [inputs, setInputs] = useState<Record<PRKey, string>>({
    deadlift: "",
    back_squat: "",
    front_squat: "",
    clean: "",
    bench_press: "",
  });

  useEffect(() => {
    let cancelled = false;
    void hydrateFitnessPRStateFromRemote().then((remote) => {
      if (!cancelled) setState(remote);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(
    () =>
      (Object.keys(fitnessPRLabels) as PRKey[]).map((key) => {
        const logs = state[key];
        const last = logs[logs.length - 1]?.value ?? 0;
        return {
          key,
          label: fitnessPRLabels[key],
          last,
          delta: monthlyDelta(logs),
          trend: trend(logs),
        };
      }),
    [state],
  );

  const savePR = (key: PRKey) => {
    const value = Number(inputs[key]);
    if (!value || Number.isNaN(value) || value <= 0) return;
    void appendFitnessPREntry(key, value).then((next) => {
      setState(next);
      setInputs((prev) => ({ ...prev, [key]: "" }));
    });
  };

  return (
    <details className="card group">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
        <div>
          <p className="eyebrow">PR Tracker</p>
          <h3 className="text-sm font-semibold text-textp">Seguimiento de levantamientos clave</h3>
          <p className="mt-1 text-xs text-texts">Bloque colapsable para mantener la portada ligera.</p>
        </div>
        <span className="flex items-center gap-1 rounded-full border border-borderc bg-surface px-2 py-1 text-[10px] text-texts">
          {rows.length} movimientos
          <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <div key={row.key} className="rounded-xl border border-borderc bg-surface p-2.5">
            <div className="flex items-center justify-between text-sm">
              <p className="font-medium text-textp">{row.label}</p>
              <p className="text-xs text-texts">{row.trend} {row.delta >= 0 ? `+${row.delta}` : row.delta} kg mes</p>
            </div>
            <p className="mt-1 text-xs text-texts">Último PR: <span className="font-semibold text-textp">{row.last} kg</span></p>
            <div className="mt-2 flex gap-2">
              <input
                className="input h-8 min-h-0 py-1 text-xs"
                inputMode="decimal"
                placeholder="Nuevo PR kg"
                value={inputs[row.key]}
                onChange={(event) => setInputs((prev) => ({ ...prev, [row.key]: event.target.value }))}
              />
              <button type="button" className="btn-ghost min-h-0 px-2 py-1 text-xs" onClick={() => savePR(row.key)}>
                Guardar
              </button>
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}
