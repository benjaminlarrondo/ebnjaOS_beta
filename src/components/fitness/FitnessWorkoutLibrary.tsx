import type { FitnessWorkoutLibrary, FitnessWorkoutDayRow } from "../../lib/fitness/fitnessExecutionTypes";

export function FitnessWorkoutLibrary({
  library,
  selectedWorkoutDayId,
  recommendedWorkoutDayId,
  onSelectWorkoutDay,
}: {
  library: FitnessWorkoutLibrary;
  selectedWorkoutDayId: string | null;
  recommendedWorkoutDayId: string | null;
  onSelectWorkoutDay: (workoutDayId: string) => void;
}) {
  const program = library.programs.find((item) => item.active) ?? library.programs[0];

  return (
    <section className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Workout Library</p>
          <h3 className="text-sm font-semibold text-textp">{program?.name ?? "Programa de entrenamiento"}</h3>
          <p className="mt-1 text-xs text-texts">{program?.description ?? "Librería canónica para ejecución diaria."}</p>
        </div>
        <span className="pill-soft">{library.workoutDays.length} días</span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {library.workoutDays.map((day) => (
          <WorkoutDayTile
            key={day.id}
            day={day}
            selected={day.id === selectedWorkoutDayId}
            recommended={day.id === recommendedWorkoutDayId}
            onSelect={onSelectWorkoutDay}
          />
        ))}
      </div>
    </section>
  );
}

function WorkoutDayTile({
  day,
  selected,
  recommended,
  onSelect,
}: {
  day: FitnessWorkoutDayRow;
  selected: boolean;
  recommended: boolean;
  onSelect: (workoutDayId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(day.id)}
      className={`rounded-2xl border p-3 text-left transition ${
        selected ? "border-primary/45 bg-primary/10" : "border-borderc bg-surface hover:border-primary/30"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-texts">Day {day.day_number}</p>
          <h4 className="mt-1 text-sm font-semibold text-textp">{day.name}</h4>
        </div>
        {recommended && <span className="pill-soft text-primary">Recommended</span>}
      </div>
      <p className="mt-2 text-xs text-texts">{day.description}</p>
    </button>
  );
}
