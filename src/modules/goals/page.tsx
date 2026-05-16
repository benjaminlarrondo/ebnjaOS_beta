import { useMemo, useState } from "react";
import { PageTitle } from "../../components/layout/PageTitle";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { createGoal, listGoals, removeGoal, updateGoal, type GoalArea, type GoalStatus } from "../../lib/goals";

const areas: GoalArea[] = ["work", "health", "learning", "personal"];
const statuses: GoalStatus[] = ["active", "paused", "done"];

export default function GoalsPage() {
  const [title, setTitle] = useState("");
  const [area, setArea] = useState<GoalArea>("work");
  const [target, setTarget] = useState("10");
  const [quarter, setQuarter] = useState("2026-Q2");
  const [tick, setTick] = useState(0);
  const goals = listGoals();

  const totals = useMemo(() => {
    const active = goals.filter((g) => g.status === "active").length;
    const done = goals.filter((g) => g.status === "done").length;
    const pct = goals.length === 0 ? 0 : Math.round(goals.reduce((acc, g) => acc + Math.min(100, Math.round((g.progress / Math.max(1, g.target)) * 100)), 0) / goals.length);
    return { active, done, pct };
  }, [goals, tick]);

  const add = () => {
    const n = Number(target);
    if (!title.trim() || Number.isNaN(n) || n <= 0) return;
    createGoal({ title: title.trim(), area, target: n, progress: 0, quarter, status: "active" });
    setTitle("");
    setTick((x) => x + 1);
  };

  return (
    <div className="space-y-4">
      <PageTitle title="Goals" subtitle="Objetivos trimestrales y progreso" />

      <section className="card space-y-2">
        <h3 className="text-sm font-semibold">Nuevo objetivo</h3>
        <Input placeholder="Título del objetivo" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="grid gap-2 sm:grid-cols-3">
          <Select value={area} onChange={(e) => setArea(e.target.value as GoalArea)}>
            {areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </Select>
          <Input type="number" min={1} value={target} onChange={(e) => setTarget(e.target.value)} />
          <Input placeholder="2026-Q2" value={quarter} onChange={(e) => setQuarter(e.target.value)} />
        </div>
        <Button type="button" onClick={add}>Crear objetivo</Button>
      </section>

      <section className="card">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-xl border border-borderc p-2.5"><p className="text-xs text-texts">Activos</p><p className="font-semibold">{totals.active}</p></div>
          <div className="rounded-xl border border-borderc p-2.5"><p className="text-xs text-texts">Completados</p><p className="font-semibold">{totals.done}</p></div>
          <div className="rounded-xl border border-borderc p-2.5"><p className="text-xs text-texts">Avance medio</p><p className="font-semibold">{totals.pct}%</p></div>
        </div>
      </section>

      <section className="card space-y-2">
        <h3 className="text-sm font-semibold">Objetivos</h3>
        {goals.length === 0 && <p className="text-sm text-texts">Sin objetivos todavía.</p>}
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.progress / Math.max(1, g.target)) * 100));
          return (
            <article key={g.id} className="rounded-xl border border-borderc p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{g.title}</p>
                  <p className="text-xs text-texts">{g.area} · {g.quarter} · {g.progress}/{g.target}</p>
                </div>
                <button className="btn-ghost" onClick={() => { removeGoal(g.id); setTick((x) => x + 1); }}>Eliminar</button>
              </div>
              <div className="mt-2 h-2 rounded-full bg-[#edf0f4]"><div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className="btn-ghost" onClick={() => { updateGoal(g.id, { progress: Math.min(g.target, g.progress + 1) }); setTick((x) => x + 1); }}>+1 progreso</button>
                <button className="btn-ghost" onClick={() => { updateGoal(g.id, { status: g.status === "done" ? "active" : "done" }); setTick((x) => x + 1); }}>
                  {g.status === "done" ? "Marcar activa" : "Marcar done"}
                </button>
                <Select value={g.status} onChange={(e) => { updateGoal(g.id, { status: e.target.value as GoalStatus }); setTick((x) => x + 1); }}>
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
