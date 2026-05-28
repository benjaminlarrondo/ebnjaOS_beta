import { Dumbbell, Home } from "lucide-react";
import type { WorkoutSession } from "../../data/fitnessPlan";
import { ExerciseRow } from "./ExerciseRow";

export function WorkoutSessionCard({ session, highlighted = false }: { session: WorkoutSession; highlighted?: boolean }) {
  return (
    <article className={`card ${highlighted ? "border-primary/40 ring-2 ring-primary/10" : ""}`}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold">{session.name}</h4>
          <p className="mt-1 text-xs text-texts">{session.focus}</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-[11px] ${highlighted ? "bg-primary text-white" : session.completed ? "bg-[#eaf5ea] text-[#3f6f3f]" : "bg-[#eef1f6] text-primary"}`}>
          {highlighted ? "Sugerida" : session.completed ? "Completada" : "Pendiente"}
        </span>
      </div>
      <p className="mb-3 flex items-center gap-2 text-xs text-texts">
        {session.location === "Gym" ? <Dumbbell className="h-3.5 w-3.5" /> : <Home className="h-3.5 w-3.5" />}
        {session.location} · {session.durationMin ? `${session.durationMin} min` : session.format || "Duración flexible"}
      </p>
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 border-b border-borderc pb-1 text-[11px] font-medium text-texts">
        <span>Ejercicio</span>
        <span className="text-right">Series/Reps</span>
        <span className="text-right">Descanso</span>
      </div>
      <div className="space-y-1.5 pt-1.5">
        {session.exercises.map((exercise) => (
          <ExerciseRow key={`${session.id}-${exercise.name}`} exercise={exercise} />
        ))}
      </div>
    </article>
  );
}
