import { CalendarDays, Dumbbell, Sparkles, Target } from "lucide-react";
import { WidgetCard } from "./WidgetCard";
import { WidgetHeader } from "./WidgetHeader";
import { WidgetMetric } from "./WidgetMetric";

export function ExecutiveHomeHero({
  lifeScore,
  recoveryScore,
  readinessScore,
  workoutLabel,
  coachHeadline,
  coachReason,
  nextTeteLabel,
  nextAgendaLabel,
  insight,
  action,
}: {
  lifeScore: number;
  recoveryScore: number;
  readinessScore: number;
  workoutLabel: string;
  coachHeadline: string;
  coachReason: string;
  nextTeteLabel: string;
  nextAgendaLabel: string;
  insight: string;
  action: string;
}) {
  return (
    <div className="space-y-3">
      <div className="adaptive-grid">
        <WidgetCard>
          <WidgetHeader
            eyebrow="Estado del día"
            title="Executive Home"
            subtitle="Entiende tu día en menos de 5 segundos"
            size="lg"
            className="mb-5"
            icon={<span className="rounded-full bg-surface2 p-3 text-primary"><Target className="h-5 w-5" /></span>}
          />
          <div className="grid grid-cols-3 gap-2">
            <WidgetMetric label="Life Score" value={`${Math.round(lifeScore)}%`} labelPosition="bottom" />
            <WidgetMetric label="Recovery" value={`${Math.round(recoveryScore)}%`} labelPosition="bottom" />
            <WidgetMetric label="Readiness" value={`${Math.round(readinessScore)}%`} labelPosition="bottom" />
          </div>
        </WidgetCard>

        <WidgetCard>
          <WidgetHeader
            eyebrow="Entrenamiento"
            title={workoutLabel}
            subtitle={coachHeadline}
            size="lg"
            className="mb-5"
            icon={<span className="rounded-full bg-surface2 p-3 text-primary"><Dumbbell className="h-5 w-5" /></span>}
          />
          <p className="text-sm text-texts">{coachReason}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <WidgetMetric label="Workout de hoy" value={workoutLabel} labelPosition="bottom" />
            <WidgetMetric label="Daily Coach" value={coachHeadline} labelPosition="bottom" />
          </div>
        </WidgetCard>
      </div>

      <div className="adaptive-grid">
        <WidgetCard>
          <WidgetHeader
            eyebrow="Tete"
            title={nextTeteLabel}
            subtitle="Próximo cambio y actividad"
            size="md"
            className="mb-4"
            icon={<span className="rounded-full bg-surface2 p-3 text-primary"><Sparkles className="h-5 w-5" /></span>}
          />
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="inner-card">
              <p className="text-xs text-texts">Próximo cambio</p>
              <p className="mt-1 font-semibold text-textp">{nextTeteLabel}</p>
            </div>
            <div className="inner-card">
              <p className="text-xs text-texts">Próxima actividad</p>
              <p className="mt-1 font-semibold text-textp">{nextAgendaLabel}</p>
            </div>
          </div>
        </WidgetCard>

        <WidgetCard>
          <WidgetHeader
            eyebrow="Insights"
            title="1 insight relevante"
            subtitle="1 acción sugerida"
            size="md"
            className="mb-4"
            icon={<span className="rounded-full bg-surface2 p-3 text-primary"><CalendarDays className="h-5 w-5" /></span>}
          />
          <div className="space-y-3">
            <div className="rounded-2xl border border-borderc bg-surface2 p-3">
              <p className="text-xs text-texts">Insight</p>
              <p className="mt-1 text-sm font-medium text-textp">{insight}</p>
            </div>
            <div className="rounded-2xl border border-borderc bg-surface2 p-3">
              <p className="text-xs text-texts">Acción sugerida</p>
              <p className="mt-1 text-sm font-medium text-textp">{action}</p>
            </div>
          </div>
        </WidgetCard>
      </div>
    </div>
  );
}

