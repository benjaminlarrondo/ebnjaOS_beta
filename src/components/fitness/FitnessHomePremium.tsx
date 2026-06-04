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

export type FitnessHomePremiumProps = {
  hero: {
    fitnessScore: number;
    streak: number;
    lastWorkoutLabel: string;
    lastWorkoutTitle: string;
    totalWorkouts: number;
    prsCount: number;
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
};

export function FitnessHomePremium({ hero, nextWorkout }: FitnessHomePremiumProps) {
  return (
    <section className="space-y-2.5">
      <div className="grid gap-2.5 lg:grid-cols-[1.55fr_1fr]">
        <article className="card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Fitness Home Premium</p>
              <h3 className="text-base font-semibold text-textp">Portada diaria de entrenamiento</h3>
              <p className="mt-1 text-xs text-texts">Señales clave, sin ruido y con jerarquía visual limpia.</p>
            </div>
            <span className="pill-soft text-primary">{nextWorkout.status}</span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="surface-tile">
              <p className="text-xs text-texts">Fitness Score</p>
              <p className="metric-value-xl mt-2 text-primary">{hero.fitnessScore}%</p>
              <p className="mt-1 text-xs text-texts">Entreno + nutrición + consistencia</p>
            </div>
            <div className="surface-tile">
              <p className="text-xs text-texts">Workout Momentum</p>
              <p className="metric-value-xl mt-2 text-textp">{hero.totalWorkouts}</p>
              <p className="mt-1 text-xs text-texts">Sesiones acumuladas</p>
            </div>
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <MetricPill label="Streak actual" value={`${hero.streak} días`} tone="text-primary" />
            <MetricPill label="Último entrenamiento" value={hero.lastWorkoutTitle} />
            <MetricPill label="Último registro" value={hero.lastWorkoutLabel} />
            <MetricPill label="PRs activos" value={`${hero.prsCount}`} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="pill-soft">Entrenos: {hero.totalWorkouts}</span>
            <span className="pill-soft">PRs activos: {hero.prsCount}</span>
          </div>
        </article>

        <article className="card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Daily Snapshot</p>
              <h3 className="text-sm font-semibold text-textp">Resumen ejecutivo</h3>
            </div>
            <span className="pill-soft text-primary">{nextWorkout.status}</span>
          </div>

          <div className="mt-4 grid gap-2">
            <div className="inner-card">
              <p className="text-xs text-texts">Rutina actual</p>
              <p className="mt-2 text-sm font-semibold text-textp">{nextWorkout.name}</p>
            </div>
            <div className="inner-card">
              <p className="text-xs text-texts">Ubicación</p>
              <p className="mt-2 text-sm font-semibold text-textp">{nextWorkout.location}</p>
            </div>
            <div className="inner-card">
              <p className="text-xs text-texts">Duración estimada</p>
              <p className="metric-value mt-2">{nextWorkout.durationLabel}</p>
              <p className="mt-1 text-xs text-texts">{nextWorkout.exerciseCount} ejercicios visibles</p>
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
