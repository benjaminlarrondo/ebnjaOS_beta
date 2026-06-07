function MetricPill({
  label,
  value,
  tone = "text-textp",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-borderc bg-surface px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.18em] text-texts">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

export function FitnessHomeConsolidated({
  hero,
  objectives,
  consistency,
  nextWorkout,
}: {
  hero: {
    recoveryScore: number;
    readinessScore: number;
    workoutLabel: string;
    workoutStatus: string;
  };
  objectives: {
    nextPrObjective: string;
    bodyWeight: string;
    weeklyVolume: string;
  };
  consistency: {
    streak: number;
    weeklyWorkouts: number;
    adherencePct: number;
  };
  nextWorkout: {
    name: string;
    focus: string;
    dateLabel: string;
    status: string;
    durationLabel: string;
    location: string;
    exerciseCount: number;
  };
}) {
  return (
    <section className="space-y-2.5">
      <div className="grid gap-2.5 lg:grid-cols-[1.45fr_1fr]">
        <article className="card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Fitness Home</p>
              <h3 className="text-base font-semibold text-textp">Lo esencial para entrenar hoy</h3>
              <p className="mt-1 text-xs text-texts">Recovery, readiness, objetivos y consistencia en una lectura rápida.</p>
            </div>
            <span className="pill-soft text-primary">{hero.workoutStatus}</span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="surface-tile">
              <p className="text-xs text-texts">Recovery Score</p>
              <p className="metric-value-xl mt-2 text-primary">{hero.recoveryScore}%</p>
            </div>
            <div className="surface-tile">
              <p className="text-xs text-texts">Readiness Score</p>
              <p className="metric-value-xl mt-2 text-textp">{hero.readinessScore}%</p>
            </div>
            <div className="surface-tile">
              <p className="text-xs text-texts">Workout de hoy</p>
              <p className="mt-2 text-lg font-semibold text-textp">{hero.workoutLabel}</p>
            </div>
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <MetricPill label="Próximo PR objetivo" value={objectives.nextPrObjective} tone="text-primary" />
            <MetricPill label="Peso corporal" value={objectives.bodyWeight} />
            <MetricPill label="Volumen semanal" value={objectives.weeklyVolume} />
          </div>
        </article>

        <article className="card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Consistency</p>
              <h3 className="text-sm font-semibold text-textp">Adherencia y momentum</h3>
            </div>
            <span className="pill-soft">{consistency.adherencePct}%</span>
          </div>

          <div className="mt-4 grid gap-2">
            <div className="inner-card">
              <p className="text-xs text-texts">Streak</p>
              <p className="mt-1 text-xl font-semibold text-textp">{consistency.streak} días</p>
            </div>
            <div className="inner-card">
              <p className="text-xs text-texts">Entrenos semana</p>
              <p className="mt-1 text-xl font-semibold text-textp">{consistency.weeklyWorkouts}</p>
            </div>
            <div className="inner-card">
              <p className="text-xs text-texts">Adherencia</p>
              <p className="mt-1 text-xl font-semibold text-textp">{consistency.adherencePct}%</p>
            </div>
          </div>
        </article>
      </div>

      <article className="card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Next Workout</p>
            <h3 className="text-sm font-semibold text-textp">{nextWorkout.name}</h3>
            <p className="mt-1 text-xs text-texts">{nextWorkout.focus}</p>
          </div>
          <span className="pill-soft">{nextWorkout.dateLabel}</span>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          <MetricPill label="Estado" value={nextWorkout.status} tone="text-primary" />
          <MetricPill label="Duración" value={nextWorkout.durationLabel} />
          <MetricPill label="Ubicación" value={nextWorkout.location} />
          <MetricPill label="Ejercicios" value={`${nextWorkout.exerciseCount}`} />
        </div>
      </article>
    </section>
  );
}
