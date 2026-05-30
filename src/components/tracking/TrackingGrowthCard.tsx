import type { TrackingHabitDefinition, TrackingHabitId } from "../../lib/tracking";

export function TrackingGrowthCard({
  habits,
  getValue,
  setValue,
  score,
  completionPct,
}: {
  habits: TrackingHabitDefinition[];
  getValue: (habitId: TrackingHabitId) => number | boolean | undefined;
  setValue: (habitId: TrackingHabitId, value: number | boolean) => void;
  score: number;
  completionPct: number;
}) {
  return (
    <section className="card space-y-3">
      <div>
        <p className="eyebrow">🚀 Focus</p>
        <h3 className="text-sm font-semibold text-textp">PMP, PyMO, Music</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="inner-card">
          <p className="text-xs text-texts">Score focus</p>
          <p className="mt-1 font-semibold text-textp">{score}</p>
        </div>
        <div className="inner-card">
          <p className="text-xs text-texts">Adherencia hoy</p>
          <p className="mt-1 font-semibold text-textp">{completionPct}%</p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {habits.map((habit) => {
          const value = getValue(habit.id);
          return (
            <div key={habit.id} className="inner-card space-y-2">
              <p className="text-sm font-medium text-textp">{habit.label}</p>
              <p className="text-[11px] text-texts">Meta: {habit.defaultTarget} min</p>
              <input
                type="number"
                min={0}
                className="input"
                value={typeof value === "number" ? value : ""}
                onChange={(event) => setValue(habit.id, Number(event.target.value) || 0)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
