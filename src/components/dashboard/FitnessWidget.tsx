import { Dumbbell } from "lucide-react";
import { WidgetCard } from "./WidgetCard";
import { WidgetHeader } from "./WidgetHeader";
import { WidgetMetric } from "./WidgetMetric";

function ProgressLine({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-surface2">
      <div className="h-2 rounded-full bg-accent" style={{ width: `${Math.min(100, Math.max(0, Math.round(value)))}%` }} />
    </div>
  );
}

export function FitnessWidget({
  sessionName,
  sessionFocus,
  sessionsCompleted,
  gymCompleted,
  homeCompleted,
  fitnessPct,
}: {
  sessionName: string;
  sessionFocus: string;
  sessionsCompleted: number;
  gymCompleted: number;
  homeCompleted: number;
  fitnessPct: number;
}) {
  const metricItems = [
    { label: "sesiones", value: sessionsCompleted },
    { label: "gym", value: gymCompleted },
    { label: "home", value: homeCompleted },
  ].filter((item) => item.value > 0);

  return (
    <WidgetCard to="/fitness">
      <WidgetHeader
        eyebrow="Fitness"
        title={sessionName}
        subtitle={sessionFocus}
        size="lg"
        className="mb-5"
        icon={<span className="rounded-full bg-surface2 p-3 text-primary"><Dumbbell className="h-5 w-5" /></span>}
      />
      {metricItems.length > 0 ? (
        <div className={`grid gap-2 ${metricItems.length === 1 ? "grid-cols-1" : metricItems.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {metricItems.map((metric) => (
            <WidgetMetric key={metric.label} label={metric.label} value={metric.value} labelPosition="bottom" />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-surface2 p-3 text-sm text-texts">Sin sesiones registradas esta semana.</p>
      )}
      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs text-texts">
          <span>Semana</span>
          <span>{sessionsCompleted}/6</span>
        </div>
        <ProgressLine value={fitnessPct} />
      </div>
    </WidgetCard>
  );
}
