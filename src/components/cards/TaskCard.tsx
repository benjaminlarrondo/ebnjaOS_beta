import type { Task } from "../../types/task";
export function TaskCard({ task }: { task: Task }) {
  return <div className="flex items-center justify-between rounded-xl border border-borderc p-3"><div><p className="text-sm font-medium">{task.title}</p><p className="text-xs text-texts">{task.status}</p></div><span className="text-xs text-texts">{task.priority}</span></div>;
}
