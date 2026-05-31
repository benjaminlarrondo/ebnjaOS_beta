import { PageTitle } from "../../components/layout/PageTitle";
import { TrackingWeeklyScore } from "../../components/tracking/TrackingWeeklyScore";
import { useTrackingEngine } from "../../hooks/useTrackingEngine";

export default function TrackingPage() {
  const {
    todayScore,
    healthHabits,
    growthHabits,
    toggleChecklist,
  } = useTrackingEngine();
  const activeHabits = [...healthHabits, ...growthHabits];
  const completedHabits = activeHabits.filter((habit) => todayScore.completions[habit.id] >= 1).length;

  return (
    <div className="page-shell">
      <PageTitle title="Tracking" subtitle="Hoy · hábitos diarios y score" />

      <TrackingWeeklyScore
        daily={todayScore.globalScore}
        health={todayScore.healthScore}
        growth={todayScore.growthScore}
        completed={completedHabits}
        total={activeHabits.length}
      />

      <section className="card space-y-3">
        <div>
          <p className="eyebrow">💪 Salud</p>
          <h3 className="text-sm font-semibold text-textp">Agua, comidas, proteína, entrenamiento y sueño</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {healthHabits.map((habit) => {
            const done = todayScore.completions[habit.id] >= 1;
            return (
              <button
                key={habit.id}
                type="button"
                onClick={() => toggleChecklist(habit)}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                  done ? "border-primary/35 bg-primary/10 text-textp" : "border-borderc bg-surface text-texts"
                }`}
              >
                <span>{habit.label}</span>
                <span className="text-xs">{done ? "✓" : "○"}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="card space-y-3">
        <div>
          <p className="eyebrow">🚀 Focus</p>
          <h3 className="text-sm font-semibold text-textp">PMP, PyMO y Music</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {growthHabits.map((habit) => {
            const done = todayScore.completions[habit.id] >= 1;
            return (
              <button
                key={habit.id}
                type="button"
                onClick={() => toggleChecklist(habit)}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                  done ? "border-primary/35 bg-primary/10 text-textp" : "border-borderc bg-surface text-texts"
                }`}
              >
                <span>{habit.label}</span>
                <span className="text-xs">{done ? "✓" : "○"}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
