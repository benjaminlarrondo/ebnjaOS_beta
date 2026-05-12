import type { Task } from "../../types/task";

function dotColor(priority: Task["priority"]) {
  if (priority === "critical") return "bg-danger";
  if (priority === "high") return "bg-warning";
  if (priority === "medium") return "bg-primary";
  return "bg-accent";
}

export function TodayTasksCard({ tasks }: { tasks: Task[] }) {
  return (
    <section className="card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Tareas de hoy</h3>
        <span className="text-xs text-primary">Ver todas</span>
      </div>
      <div className="space-y-2">
        {tasks.length === 0 && <p className="text-sm text-texts">No tienes tareas para hoy</p>}
        {tasks.slice(0, 3).map((task) => (
          <div key={task.id} className="flex items-center justify-between gap-2 rounded-xl border border-borderc p-2.5">
            <p className="flex items-center gap-2 text-sm">
              <span className={`h-2 w-2 rounded-full ${dotColor(task.priority)}`} />
              {task.title}
            </p>
            <span className="text-xs text-texts">{task.due_date ? new Date(task.due_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
