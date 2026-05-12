import { useState } from "react";
import { PageTitle } from "../../components/layout/PageTitle";
import { CrudList } from "../shared";
import { db } from "../../lib/store";

const tabs = ["today", "inbox", "upcoming", "done"] as const;

export default function TasksPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("today");
  const tasks = db.list("tasks");

  const filtered = tasks.filter((task) => {
    if (tab === "today") return task.status === "today";
    if (tab === "inbox") return task.status === "inbox";
    if (tab === "done") return task.status === "done";
    return task.status === "next" || task.status === "waiting";
  });

  return (
    <div className="space-y-4">
      <PageTitle title="Tasks" subtitle="Today, Inbox, Upcoming, Done" />
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full border px-3 py-1 text-xs ${tab === t ? "border-primary bg-[#eef1f6] text-primary" : "border-borderc text-texts"}`}>
            {t}
          </button>
        ))}
      </div>
      <section className="card">
        <p className="text-sm font-medium">Vista: {tab}</p>
        <p className="mt-1 text-sm text-texts">{filtered.length} tareas</p>
      </section>
      <CrudList title="tasks" keyName="tasks" fields="task" />
    </div>
  );
}
