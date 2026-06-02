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
  fitnessScore,
  recoveryScore,
  routineLabel,
}: {
  sessionName: string;
  fitnessScore: number;
  recoveryScore: number;
  routineLabel: string;
}) {
  return (
    <WidgetCard to="/fitness">
      <WidgetHeader
        eyebrow="Fitness"
        title={sessionName}
        subtitle={routineLabel}
        size="lg"
        className="mb-5"
        icon={<span className="rounded-full bg-surface2 p-3 text-primary"><Dumbbell className="h-5 w-5" /></span>}
      />
      <div className="grid grid-cols-2 gap-2">
        <WidgetMetric label="fitness" value={`${Math.round(fitnessScore)}%`} labelPosition="bottom" />
        <WidgetMetric label="recovery" value={`${Math.round(recoveryScore)}%`} labelPosition="bottom" />
      </div>
      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs text-texts">
          <span>Rutina hoy</span>
          <span>{routineLabel}</span>
        </div>
        <ProgressLine value={fitnessScore} />
      </div>
    </WidgetCard>
  );
}
