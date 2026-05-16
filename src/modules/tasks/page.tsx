import { useMemo, useState } from "react";
import { PageTitle } from "../../components/layout/PageTitle";
import { db } from "../../lib/store";
import type { Task, TaskStatus } from "../../types/task";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";

const tabs = ["inbox", "today", "upcoming", "done"] as const;

function normalizeStatusForTab(tab: (typeof tabs)[number], status: TaskStatus) {
  if (tab === "inbox") return status === "inbox";
  if (tab === "today") return status === "today";
  if (tab === "done") return status === "done";
  return status === "next" || status === "waiting";
}

function formatStatus(status: TaskStatus) {
  if (status === "inbox") return "Inbox";
  if (status === "today") return "Today";
  if (status === "next") return "Next";
  if (status === "waiting") return "Waiting";
  if (status === "done") return "Done";
  return "Archived";
}

function formatPriority(priority: Task["priority"]) {
  if (priority === "critical") return "Crítica";
  if (priority === "high") return "Alta";
  if (priority === "medium") return "Media";
  return "Baja";
}

export default function TasksPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("inbox");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [, setTick] = useState(0);
  const tasks = db.list("tasks");

  const inboxCount = tasks.filter((t) => t.status === "inbox").length;
  const todayCount = tasks.filter((t) => t.status === "today").length;
  const doneThisWeek = tasks.filter((t) => {
    if (t.status !== "done") return false;
    if (!t.updated_at) return false;
    const d = new Date(t.updated_at);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);
    return d >= weekStart;
  }).length;

  const filtered = useMemo(
    () => tasks.filter((task) => normalizeStatusForTab(tab, task.status)),
    [tasks, tab],
  );

  const createInboxTask = () => {
    if (!title.trim()) {
      setStatus("Escribe un título para capturar.");
      return;
    }
    db.create("tasks", {
      title: title.trim(),
      description: description.trim(),
      status: "inbox",
      priority: "medium",
      due_date: "",
      tags: [],
    });
    setTitle("");
    setDescription("");
    setStatus("Captura enviada a Inbox.");
    setTick((x) => x + 1);
  };

  const moveTask = (taskId: string, next: TaskStatus) => {
    db.update("tasks", taskId, { status: next });
    setTick((x) => x + 1);
  };

  const deleteTask = (taskId: string) => {
    db.remove("tasks", taskId);
    setTick((x) => x + 1);
  };

  return (
    <div className="space-y-4">
      <PageTitle title="Tasks" subtitle="Inbox y procesamiento diario" />

      <section className="card">
        <h3 className="mb-3 text-sm font-semibold">Captura rápida a Inbox</h3>
        <div className="grid gap-2">
          <Input placeholder="Título de la tarea" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Detalle opcional" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button type="button" onClick={createInboxTask}>Agregar a Inbox</Button>
          {status && <p className="text-xs text-texts">{status}</p>}
        </div>
      </section>

      <section className="card">
        <h3 className="mb-3 text-sm font-semibold">Revisión diaria</h3>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-xl border border-borderc p-2.5">
            <p className="text-xs text-texts">Inbox</p>
            <p className="font-semibold">{inboxCount}</p>
          </div>
          <div className="rounded-xl border border-borderc p-2.5">
            <p className="text-xs text-texts">Today</p>
            <p className="font-semibold">{todayCount}</p>
          </div>
          <div className="rounded-xl border border-borderc p-2.5">
            <p className="text-xs text-texts">Done semana</p>
            <p className="font-semibold">{doneThisWeek}</p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-3 py-1 text-xs ${tab === t ? "border-primary bg-[#eef1f6] text-primary" : "border-borderc text-texts"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <section className="card space-y-2">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Vista: {tab}</h3>
          <p className="text-xs text-texts">{filtered.length} tareas</p>
        </div>

        {filtered.length === 0 && (
          <p className="text-sm text-texts">Sin tareas en esta vista.</p>
        )}

        {filtered.map((task) => (
          <article key={task.id} className="rounded-xl border border-borderc p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{task.title}</p>
                {task.description && <p className="mt-1 text-xs text-texts">{task.description}</p>}
                <p className="mt-1 text-xs text-texts">
                  {formatStatus(task.status)} · Prioridad {formatPriority(task.priority)}
                </p>
              </div>
              <button className="btn-ghost" onClick={() => deleteTask(task.id)}>Eliminar</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {task.status !== "today" && <button className="btn-ghost" onClick={() => moveTask(task.id, "today")}>Today</button>}
              {task.status !== "next" && <button className="btn-ghost" onClick={() => moveTask(task.id, "next")}>Next</button>}
              {task.status !== "waiting" && <button className="btn-ghost" onClick={() => moveTask(task.id, "waiting")}>Waiting</button>}
              {task.status !== "done" && <button className="btn-ghost" onClick={() => moveTask(task.id, "done")}>Done</button>}
              {task.status !== "archived" && <button className="btn-ghost" onClick={() => moveTask(task.id, "archived")}>Archivar</button>}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
