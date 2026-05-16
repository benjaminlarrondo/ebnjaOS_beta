import { useMemo, useState } from "react";
import { PageTitle } from "../../components/layout/PageTitle";
import { db } from "../../lib/store";

function mondayOfWeek(d = new Date()) {
  const out = new Date(d);
  out.setDate(out.getDate() - ((out.getDay() + 6) % 7));
  out.setHours(0, 0, 0, 0);
  return out;
}

const CHECK_KEY = "ebnjaos-weekly-review-v1";

function weekKey() {
  return mondayOfWeek().toISOString().slice(0, 10);
}

function loadChecklist() {
  const raw = localStorage.getItem(CHECK_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, Record<string, boolean>>;
  } catch {
    return {};
  }
}

function saveChecklist(data: Record<string, Record<string, boolean>>) {
  localStorage.setItem(CHECK_KEY, JSON.stringify(data));
}

export default function ReviewPage() {
  const [tick, setTick] = useState(0);
  const data = db.load();
  const wk = weekKey();
  const checks = loadChecklist();
  const current = checks[wk] || {};
  const checklistItems = [
    { id: "inbox_zero", label: "Procesar inbox de tareas" },
    { id: "calendar_review", label: "Revisar calendario 7 días" },
    { id: "projects_review", label: "Actualizar estado de proyectos" },
    { id: "fitness_review", label: "Revisar adherencia fitness" },
    { id: "plan_next_week", label: "Definir foco de la próxima semana" },
  ];

  const summary = useMemo(() => {
    const weekStart = mondayOfWeek();
    const done = data.tasks.filter((t) => t.status === "done" && new Date(t.updated_at || t.created_at) >= weekStart).length;
    const created = data.tasks.filter((t) => new Date(t.created_at) >= weekStart).length;
    const events = data.events.filter((e) => new Date(e.start_time) >= weekStart).length;
    const workouts = data.workouts.filter((w) => new Date(`${w.date}T00:00:00`) >= weekStart).length;
    const notes = data.notes.filter((n) => new Date(n.created_at) >= weekStart).length;
    return { done, created, events, workouts, notes };
  }, [data, tick]);

  const toggle = (id: string) => {
    const next = loadChecklist();
    next[wk] = { ...(next[wk] || {}), [id]: !(next[wk] || {})[id] };
    saveChecklist(next);
    setTick((x) => x + 1);
  };

  const checkedCount = checklistItems.filter((i) => current[i.id]).length;

  return (
    <div className="space-y-4">
      <PageTitle title="Review" subtitle="Revisión semanal guiada y memoria automática" />

      <section className="card space-y-2">
        <h3 className="text-sm font-semibold">Checklist semanal</h3>
        <p className="text-xs text-texts">Semana de {wk} · {checkedCount}/{checklistItems.length} completado</p>
        <div className="space-y-2">
          {checklistItems.map((item) => (
            <label key={item.id} className="flex items-center gap-2 rounded-lg border border-borderc p-2 text-sm">
              <input type="checkbox" checked={!!current[item.id]} onChange={() => toggle(item.id)} />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="card space-y-2">
        <h3 className="text-sm font-semibold">Resumen automático de la semana</h3>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
          <div className="rounded-xl border border-borderc p-2.5"><p className="text-xs text-texts">Tasks done</p><p className="font-semibold">{summary.done}</p></div>
          <div className="rounded-xl border border-borderc p-2.5"><p className="text-xs text-texts">Tasks creadas</p><p className="font-semibold">{summary.created}</p></div>
          <div className="rounded-xl border border-borderc p-2.5"><p className="text-xs text-texts">Eventos</p><p className="font-semibold">{summary.events}</p></div>
          <div className="rounded-xl border border-borderc p-2.5"><p className="text-xs text-texts">Entrenos</p><p className="font-semibold">{summary.workouts}</p></div>
          <div className="rounded-xl border border-borderc p-2.5"><p className="text-xs text-texts">Notas</p><p className="font-semibold">{summary.notes}</p></div>
        </div>
      </section>
    </div>
  );
}
