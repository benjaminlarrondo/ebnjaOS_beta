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
      <div className="grid grid-cols-3 gap-2">
        <WidgetMetric label="sesiones" value={sessionsCompleted} labelPosition="bottom" />
        <WidgetMetric label="gym" value={gymCompleted} labelPosition="bottom" />
        <WidgetMetric label="home" value={homeCompleted} labelPosition="bottom" />
      </div>
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
