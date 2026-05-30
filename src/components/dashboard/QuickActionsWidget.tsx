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
  const actionable = [
    { id: "new-task", title: "Nueva tarea", description: "Captura en inbox", to: "/tasks", icon: ClipboardPlus },
    { id: "new-event", title: "Nuevo evento", description: "Agenda rápida", to: "/calendar", icon: CalendarDays },
    { id: "new-note", title: "Nueva nota", description: "Nota vinculada", to: "/notes", icon: NotebookPen },
    { id: "new-workout", title: "Registrar entrenamiento", description: "Bitácora fitness", to: "/fitness", icon: Dumbbell },
  ];

  return (
    <>
      <WidgetCard>
        <WidgetHeader
          eyebrow="Acciones"
          title="Movimiento rapido"
          icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
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

      <WidgetCard>
        <WidgetHeader
          title="Sistema"
          size="sm"
          action={
            <WidgetAction to="/settings" variant="plain">
            Mas <ArrowUpRight className="h-3.5 w-3.5" />
            </WidgetAction>
          }
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {secondaryModules.map((module) => (
            <WidgetAction key={module.id} to={module.path} className="text-center">
              {module.label}
            </WidgetAction>
          ))}
        </div>
      </WidgetCard>
    </>
  );
}
