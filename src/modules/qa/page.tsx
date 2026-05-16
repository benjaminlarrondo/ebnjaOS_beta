import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageTitle } from "../../components/layout/PageTitle";

type QaItem = {
  id: string;
  label: string;
  to: string;
};

const KEY = "ebnjaos-qa-checklist-v1";

const items: QaItem[] = [
  { id: "quick_capture", label: "Quick capture crea task/note/event", to: "/" },
  { id: "tasks_inbox", label: "Tasks Inbox procesa y mueve estados", to: "/tasks" },
  { id: "calendar_sync", label: "Calendar sincroniza celeste_calendar", to: "/calendar" },
  { id: "calendar_create", label: "Calendar crea evento manual desde formulario", to: "/calendar" },
  { id: "fitness_done", label: "Fitness marca realizado y suma consistencia", to: "/fitness" },
  { id: "review_weekly", label: "Review semanal guarda checklist", to: "/review" },
  { id: "goals_progress", label: "Goals crea objetivo y suma progreso", to: "/goals" },
  { id: "search_global", label: "Search encuentra contenido cruzado", to: "/search" },
  { id: "settings_sync", label: "Settings prueba conexión y cola de sync", to: "/settings" },
  { id: "settings_backup", label: "Settings exporta/importa backup JSON", to: "/settings" },
];

function loadState() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return {} as Record<string, boolean>;
  try {
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {} as Record<string, boolean>;
  }
}

function saveState(state: Record<string, boolean>) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export default function QaPage() {
  const [state, setState] = useState<Record<string, boolean>>(loadState);

  const completed = useMemo(() => items.filter((i) => state[i.id]).length, [state]);
  const pct = Math.round((completed / items.length) * 100);

  const toggle = (id: string) => {
    const next = { ...state, [id]: !state[id] };
    setState(next);
    saveState(next);
  };

  const reset = () => {
    setState({});
    saveState({});
  };

  return (
    <div className="space-y-4">
      <PageTitle title="QA Checklist" subtitle="Validación funcional end-to-end" />

      <section className="card space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Progreso QA</p>
          <button className="btn-ghost" onClick={reset}>Reset</button>
        </div>
        <p className="text-xs text-texts">{completed}/{items.length} checks · {pct}%</p>
        <div className="h-2 rounded-full bg-[#edf0f4]">
          <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
      </section>

      <section className="card space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl border border-borderc p-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!state[item.id]} onChange={() => toggle(item.id)} />
              <span>{item.label}</span>
            </label>
            <Link to={item.to} className="btn-ghost">Abrir</Link>
          </div>
        ))}
      </section>
    </div>
  );
}
