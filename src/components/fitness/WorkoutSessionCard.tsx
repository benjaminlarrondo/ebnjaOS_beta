import { Dumbbell, Home } from "lucide-react";
import type { WorkoutSession } from "../../data/fitnessPlan";
import { ExerciseRow } from "./ExerciseRow";

export function WorkoutSessionCard({ session }: { session: WorkoutSession }) {
  return (
    <article className="card">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold">{session.name}</h4>
          <p className="mt-1 text-xs text-texts">{session.focus}</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-[11px] ${session.completed ? "bg-[#eaf5ea] text-[#3f6f3f]" : "bg-[#eef1f6] text-primary"}`}>
          {session.completed ? "Completada" : "Pendiente"}
        </span>
      </div>
      <p className="mb-3 flex items-center gap-2 text-xs text-texts">
        {session.location === "Gym" ? <Dumbbell className="h-3.5 w-3.5" /> : <Home className="h-3.5 w-3.5" />}
        {session.location} · {session.durationMin ? `${session.durationMin} min` : session.format || "Duración flexible"}
      </p>
      <div className="space-y-2">
        {session.exercises.slice(0, 5).map((exercise) => (
          <ExerciseRow key={`${session.id}-${exercise.name}`} exercise={exercise} />
        ))}
      </div>
    </article>
  );
}
