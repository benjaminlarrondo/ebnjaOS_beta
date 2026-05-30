import type { TrackingHabitDefinition, TrackingHabitId } from "../../lib/tracking";

function unitLabel(unit: TrackingHabitDefinition["unit"]) {
  if (unit === "ml") return "ml";
  if (unit === "g") return "g";
  if (unit === "hours") return "h";
  if (unit === "count") return "x";
  if (unit === "minutes") return "min";
  return "ok";
}

export function TrackingHealthCard({
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
        <p className="eyebrow">💪 Salud</p>
        <h3 className="text-sm font-semibold text-textp">Agua, comidas, proteína, entreno, sueño</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="inner-card">
          <p className="text-xs text-texts">Score salud</p>
          <p className="mt-1 font-semibold text-textp">{score}</p>
        </div>
        <div className="inner-card">
          <p className="text-xs text-texts">Adherencia hoy</p>
          <p className="mt-1 font-semibold text-textp">{completionPct}%</p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => {
          const value = getValue(habit.id);
          return (
            <div key={habit.id} className="inner-card space-y-2">
              <p className="text-sm font-medium text-textp">{habit.label}</p>
              <p className="text-[11px] text-texts">Meta: {habit.defaultTarget} {unitLabel(habit.unit)}</p>
              {habit.unit === "boolean" ? (
                <button
                  type="button"
                  className={`btn-ghost w-full ${value === true ? "border-primary/40 text-primary" : ""}`}
                  onClick={() => setValue(habit.id, value === true ? false : true)}
                >
                  {value === true ? "Completado" : "Marcar hecho"}
                </button>
              ) : (
                <input
                  type="number"
                  min={0}
                  className="input"
                  value={typeof value === "number" ? value : ""}
                  onChange={(event) => setValue(habit.id, Number(event.target.value) || 0)}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
