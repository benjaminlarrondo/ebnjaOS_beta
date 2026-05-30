import { useState } from "react";
import { PageTitle } from "../../components/layout/PageTitle";
import { TrackingGrowthCard } from "../../components/tracking/TrackingGrowthCard";
import { TrackingHealthCard } from "../../components/tracking/TrackingHealthCard";
import { TrackingHeatmap } from "../../components/tracking/TrackingHeatmap";
import { TrackingTrendChart } from "../../components/tracking/TrackingTrendChart";
import { TrackingWeeklyScore } from "../../components/tracking/TrackingWeeklyScore";
import { useTrackingEngine } from "../../hooks/useTrackingEngine";

const tabs = [
  { id: "today", label: "Hoy" },
  { id: "week", label: "Semana" },
  { id: "health", label: "Salud" },
  { id: "focus", label: "Focus" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function TrackingPage() {
  const [tab, setTab] = useState<TabId>("today");
  const {
    state,
    today,
    todayScore,
    weekScores,
    healthHabits,
    growthHabits,
    getLogValue,
    setValue,
    toggleChecklist,
  } = useTrackingEngine();
  const hasTodayData = Boolean(state.logs[today] && Object.keys(state.logs[today]).length > 0);
  const healthCompletion = Math.round(
    (healthHabits.reduce((sum, habit) => sum + todayScore.completions[habit.id], 0) / Math.max(1, healthHabits.length)) * 100,
  );
  const focusCompletion = Math.round(
    (growthHabits.reduce((sum, habit) => sum + todayScore.completions[habit.id], 0) / Math.max(1, growthHabits.length)) * 100,
  );

  return (
    <div className="page-shell">
      <PageTitle title="Tracking" subtitle="Uso diario · score y adherencia" />

      <section className="card">
        <div className="grid grid-cols-4 gap-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-xl border px-2 py-1.5 text-xs transition ${
                tab === item.id ? "border-primary/35 bg-primary/15 font-medium text-primary" : "border-transparent text-texts"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {tab === "today" && (
        <>
          <TrackingWeeklyScore daily={todayScore.globalScore} health={todayScore.healthScore} growth={todayScore.growthScore} />

          <section className="card space-y-2">
            <h3 className="text-sm font-semibold text-textp">Checklist interactivo</h3>
            <p className="text-xs text-texts">{today}</p>
            {!hasTodayData && (
              <p className="rounded-xl border border-borderc bg-surface px-3 py-2 text-xs text-texts">
                Sin registros hoy todavía. Marca hábitos o ingresa valores para iniciar el score diario.
              </p>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              {[...healthHabits, ...growthHabits].map((habit) => {
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
        </>
      )}

      {tab === "week" && (
        <div className="grid gap-3 lg:grid-cols-2">
          <TrackingHeatmap week={weekScores.map((x) => ({ date: x.date, globalScore: x.globalScore }))} />
          <TrackingTrendChart week={weekScores.map((x) => ({ date: x.date, globalScore: x.globalScore }))} />
        </div>
      )}

      {tab === "health" && (
        <TrackingHealthCard
          habits={healthHabits}
          getValue={getLogValue}
          setValue={setValue}
          score={todayScore.healthScore}
          completionPct={healthCompletion}
        />
      )}

      {tab === "focus" && (
        <TrackingGrowthCard
          habits={growthHabits}
          getValue={getLogValue}
          setValue={setValue}
          score={todayScore.growthScore}
          completionPct={focusCompletion}
        />
      )}
    </div>
  );
}
