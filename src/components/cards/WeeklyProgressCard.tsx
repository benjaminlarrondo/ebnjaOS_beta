function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs"><span>{label}</span><span className="text-texts">{value}%</span></div>
      <div className="h-2 rounded-full bg-[#edf0f4]"><div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
    </div>
  );
}

export function WeeklyProgressCard({ workoutsPct, tasksPct, sleepPct }: { workoutsPct: number; tasksPct: number; sleepPct: number }) {
  return (
    <section className="card">
      <h3 className="mb-3 text-sm font-semibold">Progreso semanal</h3>
      <div className="space-y-3">
        <ProgressBar label="Entrenamientos" value={workoutsPct} />
        <ProgressBar label="Tareas" value={tasksPct} />
        <ProgressBar label="Sueño / recuperación" value={sleepPct} />
      </div>
    </section>
  );
}
