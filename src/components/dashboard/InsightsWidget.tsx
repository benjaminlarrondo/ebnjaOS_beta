import { Flame } from "lucide-react";
import { WidgetCard } from "./WidgetCard";
import { WidgetHeader } from "./WidgetHeader";

function clampPct(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function ProgressLine({ value, tone = "primary" }: { value: number; tone?: "primary" | "accent" | "warning" }) {
  const color = tone === "accent" ? "bg-accent" : tone === "warning" ? "bg-warning" : "bg-primary";

  return (
    <div className="h-2 rounded-full bg-surface2">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${clampPct(value)}%` }} />
    </div>
  );
}

function InsightRow({ label, value, tone }: { label: string; value: number; tone: "primary" | "accent" | "warning" }) {
  return (
    <div className="rounded-2xl bg-surface2 p-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-textp">{label}</span>
        <span className="text-texts">{clampPct(value)}%</span>
      </div>
      <ProgressLine value={value} tone={tone} />
    </div>
  );
}

export function InsightsWidget({
  fitnessPct,
  recoveryScore,
  activeGoalsCount,
}: {
  fitnessPct: number;
  recoveryScore: number;
  activeGoalsCount: number;
}) {
  return (
    <WidgetCard>
      <WidgetHeader
        eyebrow="Insights"
        title="Pulso semanal"
        icon={<Flame className="h-5 w-5 text-primary" />}
      />
      <div className="space-y-3">
        <InsightRow label="Fitness" value={fitnessPct} tone="accent" />
        <InsightRow label="Recovery" value={recoveryScore} tone="primary" />
        <InsightRow label="Objetivos" value={Math.min(100, activeGoalsCount * 20)} tone="warning" />
      </div>
    </WidgetCard>
  );
}
