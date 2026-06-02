import { useMemo, useState } from "react";

const KEY = "ebnjaos-fitness-pr-v1";

type PRKey = "deadlift" | "back_squat" | "front_squat" | "clean" | "bench_press";
type PREntry = { date: string; value: number };
type PRState = Record<PRKey, PREntry[]>;

const labels: Record<PRKey, string> = {
  deadlift: "Deadlift",
  back_squat: "Back Squat",
  front_squat: "Front Squat",
  clean: "Clean",
  bench_press: "Bench Press",
};

function loadState(): PRState {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    return {
      deadlift: [],
      back_squat: [],
      front_squat: [],
      clean: [],
      bench_press: [],
    };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<PRState>;
    return {
      deadlift: parsed.deadlift ?? [],
      back_squat: parsed.back_squat ?? [],
      front_squat: parsed.front_squat ?? [],
      clean: parsed.clean ?? [],
      bench_press: parsed.bench_press ?? [],
    };
  } catch {
    return {
      deadlift: [],
      back_squat: [],
      front_squat: [],
      clean: [],
      bench_press: [],
    };
  }
}

function saveState(state: PRState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

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
  const [state, setState] = useState<PRState>(loadState);
  const [inputs, setInputs] = useState<Record<PRKey, string>>({
    deadlift: "",
    back_squat: "",
    front_squat: "",
    clean: "",
    bench_press: "",
  });

  const rows = useMemo(
    () =>
      (Object.keys(labels) as PRKey[]).map((key) => {
        const logs = state[key];
        const last = logs[logs.length - 1]?.value ?? 0;
        return {
          key,
          label: labels[key],
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
    const next: PRState = {
      ...state,
      [key]: [...state[key], { date: new Date().toISOString().slice(0, 10), value }],
    };
    setState(next);
    saveState(next);
    setInputs((prev) => ({ ...prev, [key]: "" }));
  };

  return (
    <section className="card">
      <div className="mb-3">
        <p className="eyebrow">PR Tracker</p>
        <h3 className="text-sm font-semibold text-textp">Seguimiento de levantamientos clave</h3>
      </div>
      <div className="space-y-2">
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
    </section>
  );
}

