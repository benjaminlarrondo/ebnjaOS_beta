import { ArrowUpRight, CalendarDays, CheckCircle2, ClipboardPlus, Dumbbell, NotebookPen } from "lucide-react";
import type { AppModule } from "../../lib/navigation";
import { WidgetAction } from "./WidgetAction";
import { WidgetCard } from "./WidgetCard";
import { WidgetHeader } from "./WidgetHeader";

export function QuickActionsWidget({
  primaryActions,
  secondaryModules,
}: {
  primaryActions: AppModule[];
  secondaryModules: AppModule[];
}) {
  void primaryActions;
  void secondaryModules;
  const actionable = [
    { id: "new-task", title: "Nueva tarea", description: "Captura en inbox", to: "/tasks", icon: ClipboardPlus },
    { id: "new-event", title: "Nuevo evento", description: "Agenda rápida", to: "/calendar", icon: CalendarDays },
    { id: "new-note", title: "Nueva nota", description: "Captura Brain", to: "/brain", icon: NotebookPen },
    { id: "new-workout", title: "Registrar entrenamiento", description: "Bitácora fitness", to: "/fitness", icon: Dumbbell },
  ];

  return (
    <WidgetCard>
      <WidgetHeader
        eyebrow="Acciones"
        title="Acciones rápidas"
        icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
        action={
          <WidgetAction to="/settings" variant="plain">
            Más <ArrowUpRight className="h-3.5 w-3.5" />
          </WidgetAction>
        }
      />
      <div className="adaptive-grid">
        {actionable.map((action) => {
          const Icon = action.icon;
          return (
            <WidgetAction
              key={action.id}
              to={action.to}
              variant="tile"
              className="text-left"
              icon={<Icon className="h-4 w-4 text-primary" />}
            >
              <div>
                <p className="text-sm font-semibold">{action.title}</p>
                <p className="text-xs text-texts">{action.description}</p>
              </div>
            </WidgetAction>
          );
        })}
      </div>
    </WidgetCard>
  );
}
