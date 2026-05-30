import type { WorkoutSession } from "../../data/fitnessPlan";

export function WorkoutTodayCard({
  session,
  onStart,
}: {
  session?: WorkoutSession;
  onStart: () => void;
}) {
  return (
    <section className="card">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-textm">Entrenamiento de hoy</p>
          <h3 className="text-base font-semibold text-textp">{session?.name || "Descanso"}</h3>
          <p className="text-xs text-texts">{session?.focus || "Sin rutina asignada"}</p>
        </div>
        <button type="button" className="btn-primary text-xs" onClick={onStart}>
          Iniciar entrenamiento
        </button>
      </div>
      {session ? (
        <div className="space-y-1">
          <p className="text-xs text-texts">Duración estimada: {session.durationMin ?? 45} min</p>
          {session.exercises.slice(0, 6).map((exercise) => (
            <div key={`${session.id}-${exercise.name}`} className="flex items-center justify-between rounded-xl border border-borderc px-2 py-1.5 text-xs">
              <span className="text-textp">{exercise.name}</span>
              <span className="text-texts">{exercise.prescription}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-texts">Sin entrenamiento programado.</p>
      )}
    </section>
  );
}
