import type { WeeklyFeedback, WeeklyUsageAnalytics } from "../../lib/weeklyReview";

type Props = {
  current: WeeklyUsageAnalytics;
  previous: WeeklyUsageAnalytics;
  feedback: WeeklyFeedback;
};

function deltaLabel(current: number, previous: number) {
  const delta = current - previous;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta}`;
}

export function WeeklyReviewPanel({ current, previous, feedback }: Props) {
  return (
    <section className="card space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Weekly feedback engine</p>
          <h3 className="heading-md font-semibold text-textp">{feedback.headline}</h3>
          <p className="text-sm text-texts">{feedback.context}</p>
        </div>
        <div className="rounded-2xl border border-borderc bg-surface2 px-4 py-3 text-right">
          <p className="text-xs text-texts">Score semanal</p>
          <p className="metric-value mt-1">{feedback.score}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="metric-card">
          <p className="caption text-textm">Fortalezas</p>
          <ul className="mt-3 space-y-2 text-sm text-textp">
            {feedback.strengths.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </div>
        <div className="metric-card">
          <p className="caption text-textm">Áreas de foco</p>
          <ul className="mt-3 space-y-2 text-sm text-textp">
            {feedback.focusAreas.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-borderc bg-surface2 p-4">
        <p className="caption text-textm">Próximo paso</p>
        <p className="mt-2 text-sm text-textp">{feedback.nextStep}</p>
      </div>

      <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Tasks done", current: current.tasksDone, previous: previous.tasksDone },
          { label: "Workouts", current: current.workouts, previous: previous.workouts },
          { label: "Notes", current: current.notes, previous: previous.notes },
          { label: "Projects updated", current: current.projectsUpdated, previous: previous.projectsUpdated },
          { label: "Events", current: current.events, previous: previous.events },
          { label: "Logs", current: current.logsCreated, previous: previous.logsCreated },
        ].map((item) => (
          <div key={item.label} className="inner-card">
            <p className="text-xs text-texts">{item.label}</p>
            <p className="metric-value mt-2">{item.current}</p>
            <p className="mt-1 text-xs text-textm">vs prev {deltaLabel(item.current, item.previous)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
