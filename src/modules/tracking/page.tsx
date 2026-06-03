import { PageTitle } from "../../components/layout/PageTitle";
import { TrackingHeatmap } from "../../components/tracking/TrackingHeatmap";
import { TrackingStreakStats } from "../../components/tracking/TrackingStreakStats";
import { TrackingTrendChart } from "../../components/tracking/TrackingTrendChart";
import { TrackingWeeklyProgress } from "../../components/tracking/TrackingWeeklyProgress";
import { TrackingWeeklyScore } from "../../components/tracking/TrackingWeeklyScore";
import { useTrackingEngine } from "../../hooks/useTrackingEngine";
import { db } from "../../lib/store";
import { computeDailyScore, computeObjectiveDailyScore, computeObjectiveWeekSummary } from "../../lib/tracking";

export default function TrackingPage() {
  const {
    state,
    today,
    weekDates,
    todayScore,
    healthHabits,
    growthHabits,
    getLogValue,
    setValue,
    adjustHealthValue,
    toggleChecklist,
  } = useTrackingEngine();
  const events = db.list("events");
  const mealsHabitIds = ["breakfast", "lunch", "snack", "dinner"] as const;
  const mealHabits = healthHabits.filter((habit) => mealsHabitIds.includes(habit.id as (typeof mealsHabitIds)[number]));
  const nonMealHealthHabits = healthHabits.filter((habit) => !mealsHabitIds.includes(habit.id as (typeof mealsHabitIds)[number]));

  const isFamilyCompletedAtDate = (date: string) =>
    events.some((event) => {
      const owner = String(event.metadata?.owner || "").toLowerCase();
      return event.source === "github" && owner === "mine" && String(event.source_id || "").slice(0, 10) === date;
    });

  const mealsCompleted = mealHabits.every((habit) => todayScore.completions[habit.id] >= 1);
  const familyTodayDone = isFamilyCompletedAtDate(today);
  const healthCompletedCount =
    nonMealHealthHabits.filter((habit) => todayScore.completions[habit.id] >= 1).length + (mealsCompleted ? 1 : 0);
  const growthCompletedCount = growthHabits.filter((habit) => todayScore.completions[habit.id] >= 1).length;
  const completedHabits = healthCompletedCount + growthCompletedCount + (familyTodayDone ? 1 : 0);
  const totalHabits = nonMealHealthHabits.length + 1 + growthHabits.length + 1;
  const objectiveToday = computeObjectiveDailyScore({
    date: today,
    dailyScore: todayScore,
    isFamilyDone: familyTodayDone,
  });
  const objectiveWeek = computeObjectiveWeekSummary({
    state,
    weekDates,
    isFamilyDoneAt: isFamilyCompletedAtDate,
  });
  const past30Dates = Array.from({ length: 30 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (29 - index));
    return day.toISOString().slice(0, 10);
  });
  const objective30Days = past30Dates.map((date) => {
    const dailyScore = computeDailyScore(state, date);
    return computeObjectiveDailyScore({
      date,
      dailyScore,
      isFamilyDone: isFamilyCompletedAtDate(date),
    });
  });
  const streakThreshold = 70;
  let currentStreak = 0;
  for (let index = objective30Days.length - 1; index >= 0; index -= 1) {
    if (objective30Days[index].overall >= streakThreshold) currentStreak += 1;
    else break;
  }
  let bestStreak = 0;
  let running = 0;
  for (const day of objective30Days) {
    if (day.overall >= streakThreshold) {
      running += 1;
      bestStreak = Math.max(bestStreak, running);
    } else {
      running = 0;
    }
  }
  const consistency30d = Math.round((objective30Days.filter((day) => day.overall >= streakThreshold).length / 30) * 100);
  const weeklyPct = objectiveWeek.completionRate;

  const toggleMeals = () => {
    const nextValue = mealsCompleted ? 0 : 1;
    for (const habit of mealHabits) {
      setValue(habit.id, nextValue, today);
    }
  };
  const waterValue = typeof getLogValue("water") === "number" ? Number(getLogValue("water")) : 0;
  const proteinValue = typeof getLogValue("protein") === "number" ? Number(getLogValue("protein")) : 0;
  const sleepValue = typeof getLogValue("sleep") === "number" ? Number(getLogValue("sleep")) : 0;

  return (
    <div className="page-shell">
      <PageTitle title="Goals" subtitle={`Score semanal ${objectiveWeek.average}%`} />

      <TrackingWeeklyScore
        daily={objectiveToday.overall}
        completed={completedHabits}
        total={totalHabits}
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <TrackingHeatmap days={objective30Days} />
        <TrackingTrendChart days={objective30Days} />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <TrackingStreakStats currentStreak={currentStreak} bestStreak={bestStreak} consistency30d={consistency30d} />
        <TrackingWeeklyProgress weeklyPct={weeklyPct} />
      </div>

      <section className="card space-y-3">
        <div>
          <p className="eyebrow">💪 Salud</p>
          <h3 className="text-sm font-semibold text-textp">Agua, comidas, proteína, entrenamiento y sueño</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={toggleMeals}
            className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
              mealsCompleted ? "border-primary/35 bg-primary/10 text-textp" : "border-borderc bg-surface text-texts"
            }`}
          >
            <span>Comidas</span>
            <span className="text-xs">{mealsCompleted ? "✓" : "○"}</span>
          </button>
          {nonMealHealthHabits.map((habit) => {
            if (habit.id === "water") {
              return (
                <div key={habit.id} className="rounded-xl border border-borderc bg-surface px-3 py-2 text-sm text-textp">
                  <p className="font-medium">{habit.label}</p>
                  <p className="text-xs text-texts">{waterValue}ml / 3000ml</p>
                  <div className="mt-2 flex gap-2">
                    <button type="button" className="btn-ghost min-h-0 px-2 py-1 text-xs" onClick={() => void adjustHealthValue("water", 250, today)}>
                      +250ml
                    </button>
                    <button type="button" className="btn-ghost min-h-0 px-2 py-1 text-xs" onClick={() => void adjustHealthValue("water", 500, today)}>
                      +500ml
                    </button>
                  </div>
                </div>
              );
            }
            if (habit.id === "protein") {
              return (
                <div key={habit.id} className="rounded-xl border border-borderc bg-surface px-3 py-2 text-sm text-textp">
                  <p className="font-medium">{habit.label}</p>
                  <p className="text-xs text-texts">{proteinValue}g / 135g</p>
                  <div className="mt-2 flex gap-2">
                    <button type="button" className="btn-ghost min-h-0 px-2 py-1 text-xs" onClick={() => void adjustHealthValue("protein", 25, today)}>
                      +25g
                    </button>
                    <button type="button" className="btn-ghost min-h-0 px-2 py-1 text-xs" onClick={() => void adjustHealthValue("protein", 50, today)}>
                      +50g
                    </button>
                  </div>
                </div>
              );
            }
            if (habit.id === "sleep") {
              return (
                <div key={habit.id} className="rounded-xl border border-borderc bg-surface px-3 py-2 text-sm text-textp">
                  <p className="font-medium">{habit.label}</p>
                  <p className="text-xs text-texts">Objetivo 8h</p>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    className="input mt-2 h-9 min-h-0 py-1"
                    value={sleepValue || ""}
                    onChange={(event) => setValue("sleep", Number(event.target.value) || 0, today)}
                  />
                </div>
              );
            }
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
          <p className="eyebrow">🚀 Desarrollo</p>
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

      <section className="card space-y-3">
        <div>
          <p className="eyebrow">❤️ Familia</p>
          <h3 className="text-sm font-semibold text-textp">Tete (integrado con calendario)</h3>
          <p className="text-xs text-texts">Se completa automáticamente cuando el día corresponde a Benja.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div
            className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${
              familyTodayDone ? "border-primary/35 bg-primary/10 text-textp" : "border-borderc bg-surface text-texts"
            }`}
          >
            <span>Tete</span>
            <span className="text-xs">{familyTodayDone ? "Tete ✓" : "Sin bloque Tete hoy"}</span>
          </div>
          <div className="inner-card sm:col-span-2">
            <p className="text-xs text-texts">Base próxima fase</p>
            <p className="mt-1 font-semibold text-textp">
              Adherencia semanal {objectiveWeek.completionRate}% · días listos para streak {objectiveWeek.streakReadyDays}/7
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
