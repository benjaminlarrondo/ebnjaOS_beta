import { Dumbbell, Home, Target } from "lucide-react";
import { Link } from "react-router-dom";

type WorkoutExercise = {
  name: string;
  prescription?: string;
  rest?: string;
  effort?: string;
};

type DashboardWorkout = {
  name: string;
  location: "Gym" | "Casa";
  focus: string;
  durationMin?: number;
  exercises: Array<string | WorkoutExercise>;
};

export function TodayWorkoutCard({
  workout,
  cta = "Ver entrenamiento",
  ctaTo = "/fitness",
  onCtaClick,
}: {
  workout?: DashboardWorkout;
  cta?: string;
  ctaTo?: string;
  onCtaClick?: () => void;
}) {
  return (
    <section className="card h-full">
      <h3 className="mb-3 text-sm font-semibold">Entrenamiento</h3>
      {workout ? (
        <>
          <p className="text-sm font-medium">{workout.name}</p>
          <p className="mt-1 flex items-center gap-2 text-xs text-texts">
            {workout.location === "Gym" ? <Dumbbell className="h-3.5 w-3.5" /> : <Home className="h-3.5 w-3.5" />}
            {workout.location} · {workout.durationMin ? `${workout.durationMin} min` : "Duración flexible"}
          </p>
          <p className="mt-1 flex items-center gap-2 text-xs text-texts"><Target className="h-3.5 w-3.5" />{workout.focus}</p>
          <ul className="mt-2 space-y-1">
            {workout.exercises.map((ex) => {
              if (typeof ex === "string") {
                return <li key={ex} className="text-xs text-texts">• {ex}</li>;
              }
              return (
                <li key={ex.name} className="text-xs text-texts">
                  • {ex.name}
                  {ex.prescription ? ` — ${ex.prescription}` : ""}
                  {ex.effort ? ` · ${ex.effort}` : ""}
                  {ex.rest ? ` · Descanso ${ex.rest}` : ""}
                </li>
              );
            })}
          </ul>
          {onCtaClick ? (
            <button type="button" onClick={onCtaClick} className="btn-primary mt-3 inline-block text-xs">
              {cta}
            </button>
          ) : (
            <Link to={ctaTo} className="btn-primary mt-3 inline-block text-xs">{cta}</Link>
          )}
        </>
      ) : (
        <p className="text-sm text-texts">Registra tu primer entrenamiento</p>
      )}
    </section>
  );
}
