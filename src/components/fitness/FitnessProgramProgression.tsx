import { ProgramProgressionEngine } from "../../lib/fitness/fitnessProgressEngine";
import type { AdaptiveTrainingRecommendation, FitnessExecutionCache } from "../../lib/fitness/fitnessExecutionTypes";

function progressTone(readiness: number, deload: boolean) {
  if (deload) return "text-warning";
  if (readiness > 80) return "text-[#2b6b45]";
  if (readiness >= 60) return "text-primary";
  return "text-warning";
}

export function FitnessProgramProgression({
  executionState,
  selectedWorkoutDayId,
  readiness,
}: {
  executionState: FitnessExecutionCache;
  selectedWorkoutDayId: string | null;
  readiness: AdaptiveTrainingRecommendation;
}) {
  const plan = ProgramProgressionEngine.buildPlan({
    library: executionState.library,
    sessionLogs: executionState.sessionLogs,
    setLogs: executionState.setLogs,
    selectedWorkoutDayId,
    readiness: readiness.readiness,
  });

  if (!plan) {
    return (
      <section className="card">
        <p className="eyebrow">Programs</p>
        <p className="mt-2 text-sm text-texts">No hay programa activo todavía.</p>
      </section>
    );
  }

  return (
    <section className="card space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Programs</p>
          <h3 className="text-sm font-semibold text-textp">{plan.programName}</h3>
          <p className="mt-1 text-xs text-texts">{plan.workoutDayName} · {plan.workoutDayDescription}</p>
        </div>
        <span className={`pill-soft ${progressTone(plan.readiness, plan.deload)}`}>{plan.mesocycleLabel}</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-4">
        <div className="inner-card">
          <p className="text-xs text-texts">Readiness</p>
          <p className="mt-1 text-xl font-semibold text-textp">{plan.readiness}%</p>
        </div>
        <div className="inner-card">
          <p className="text-xs text-texts">Carga</p>
          <p className="mt-1 text-xl font-semibold text-textp">{Math.round(plan.volumeMultiplier * 100)}%</p>
        </div>
        <div className="inner-card">
          <p className="text-xs text-texts">Recomendación</p>
          <p className="mt-1 text-sm font-semibold text-textp">{plan.recommendation}</p>
        </div>
        <div className="inner-card">
          <p className="text-xs text-texts">Mesocycle</p>
          <p className="mt-1 text-xl font-semibold text-textp">W{plan.weekNumber}</p>
        </div>
      </div>

      <div className="space-y-2">
        {plan.exercises.map((exercise) => (
          <article key={exercise.name} className="rounded-2xl border border-borderc bg-surface p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-textp">{exercise.name}</p>
                <p className="mt-1 text-xs text-texts">{exercise.prescription}</p>
              </div>
              <span className="pill-soft">{exercise.baseWeight ? `${Math.round(exercise.baseWeight)} kg` : "Bodyweight"}</span>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              {exercise.weekTargets.map((week) => (
                <div key={`${exercise.name}-${week.week}`} className="inner-card">
                  <p className="text-[11px] text-texts">{week.label}</p>
                  <p className={`mt-1 text-sm font-semibold ${week.tone === "primary" ? "text-primary" : week.tone === "accent" ? "text-textp" : "text-texts"}`}>
                    {week.weightLabel}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-texts">{exercise.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
