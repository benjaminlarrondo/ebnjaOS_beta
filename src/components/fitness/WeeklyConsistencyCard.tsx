import { WorkoutProgressMiniChart } from "./WorkoutProgressMiniChart";

export function WeeklyConsistencyCard({ completed, pending, streak }: { completed: number; pending: number; streak: number }) {
  const total = completed + pending;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <section className="card">
      <h3 className="mb-3 text-sm font-semibold">Consistencia semanal</h3>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div><p className="text-lg font-semibold">{completed}</p><p className="text-xs text-texts">Completadas</p></div>
        <div><p className="text-lg font-semibold">{pending}</p><p className="text-xs text-texts">Pendientes</p></div>
        <div><p className="text-lg font-semibold">{streak}</p><p className="text-xs text-texts">Streak</p></div>
      </div>
      <WorkoutProgressMiniChart value={pct} />
      <p className="mt-2 text-xs text-texts">Adherencia: {pct}%</p>
    </section>
  );
}
