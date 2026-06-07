import { useState } from "react";
import { PageTitle } from "../../components/layout/PageTitle";
import { db } from "../../lib/store";
import {
  buildWeeklyFeedback,
  buildWeeklyReviewMarkdown,
  summarizeWeeklyUsage,
  type WeeklyChecklistState,
} from "../../lib/weeklyReview";
import { WeeklyReviewPanel } from "../../components/review/WeeklyReviewPanel";

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

function previousWeekKey() {
  const previous = mondayOfWeek();
  previous.setDate(previous.getDate() - 7);
  return previous.toISOString().slice(0, 10);
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
  const [, setTick] = useState(0);
  const data = db.load();
  const wk = weekKey();
  const checks = loadChecklist();
  const current = checks[wk] || {};
  const previousKey = previousWeekKey();
  const checklistItems = [
    { id: "inbox_zero", label: "Procesar inbox de tareas" },
    { id: "calendar_review", label: "Revisar calendario 7 días" },
    { id: "projects_review", label: "Actualizar estado de proyectos" },
    { id: "fitness_review", label: "Revisar adherencia fitness" },
    { id: "plan_next_week", label: "Definir foco de la próxima semana" },
  ];
  const checklistTotal = checklistItems.length;

  const currentUsage = summarizeWeeklyUsage(data, current as WeeklyChecklistState, 0, checklistTotal);
  const previousUsage = summarizeWeeklyUsage(data, checks[previousKey] || {}, -1, checklistTotal);
  const feedback = buildWeeklyFeedback(currentUsage, previousUsage);

  const toggle = (id: string) => {
    const next = loadChecklist();
    next[wk] = { ...(next[wk] || {}), [id]: !(next[wk] || {})[id] };
    saveChecklist(next);
    setTick((x) => x + 1);
  };

  const checkedCount = checklistItems.filter((i) => current[i.id]).length;

  const exportWeekReview = () => {
    const markdown = buildWeeklyReviewMarkdown(
      currentUsage,
      previousUsage,
      feedback,
      checklistItems.map((item) => ({ label: item.label, done: !!current[item.id] })),
    );
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ebnjaos-week-review-${currentUsage.weekStart}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <PageTitle title="Review" subtitle="Revisión semanal guiada, feedback y memoria automática" />

      <WeeklyReviewPanel current={currentUsage} previous={previousUsage} feedback={feedback} />

      <section className="card space-y-3">
        <h3 className="text-sm font-semibold">Checklist semanal</h3>
        <p className="text-xs text-texts">Semana de {wk} · {checkedCount}/{checklistItems.length} completado</p>
        <div className="space-y-2">
          {checklistItems.map((item) => (
            <label key={item.id} className="flex items-center gap-2 rounded-2xl border border-borderc bg-surface p-3 text-sm">
              <input type="checkbox" checked={!!current[item.id]} onChange={() => toggle(item.id)} />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">Resumen automático de la semana</h3>
          <button className="btn-ghost" onClick={exportWeekReview}>Export Week Review</button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
          <div className="inner-card"><p className="text-xs text-texts">Tasks done</p><p className="metric-value mt-2">{currentUsage.tasksDone}</p><p className="mt-1 text-xs text-textm">vs prev {currentUsage.tasksDone - previousUsage.tasksDone}</p></div>
          <div className="inner-card"><p className="text-xs text-texts">Tasks creadas</p><p className="metric-value mt-2">{currentUsage.tasksCreated}</p><p className="mt-1 text-xs text-textm">vs prev {currentUsage.tasksCreated - previousUsage.tasksCreated}</p></div>
          <div className="inner-card"><p className="text-xs text-texts">Eventos</p><p className="metric-value mt-2">{currentUsage.events}</p><p className="mt-1 text-xs text-textm">vs prev {currentUsage.events - previousUsage.events}</p></div>
          <div className="inner-card"><p className="text-xs text-texts">Entrenos</p><p className="metric-value mt-2">{currentUsage.workouts}</p><p className="mt-1 text-xs text-textm">vs prev {currentUsage.workouts - previousUsage.workouts}</p></div>
          <div className="inner-card"><p className="text-xs text-texts">Notas</p><p className="metric-value mt-2">{currentUsage.notes}</p><p className="mt-1 text-xs text-textm">vs prev {currentUsage.notes - previousUsage.notes}</p></div>
        </div>
      </section>
    </div>
  );
}
