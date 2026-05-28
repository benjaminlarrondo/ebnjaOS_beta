import { useState } from "react";
import { Link } from "react-router-dom";
import { Modal } from "../forms/Modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { Task } from "../../types/task";
import { WidgetAction } from "./WidgetAction";
import { WidgetCard } from "./WidgetCard";
import { WidgetHeader } from "./WidgetHeader";

export function FocusWidget({
  focus,
  tasks,
  onSave,
}: {
  focus: string;
  tasks: Task[];
  onSave: (focus: string) => void;
}) {
  const [focusOpen, setFocusOpen] = useState(false);
  const [focusDraft, setFocusDraft] = useState("");

  return (
    <WidgetCard>
      <WidgetHeader
        eyebrow="Focus"
        title="Prioridades"
        action={
          <WidgetAction
            className="px-3 py-1.5 text-xs"
            onClick={() => {
            setFocusDraft(focus);
            setFocusOpen(true);
            }}
          >
            Editar
          </WidgetAction>
        }
      />
      <p className="text-sm leading-6 text-textp">{focus}</p>
      <div className="mt-4 space-y-2">
        {tasks.slice(0, 3).map((task) => (
          <Link key={task.id} to="/tasks" className="flex items-center justify-between gap-3 rounded-2xl bg-surface2 p-3">
            <span className="min-w-0 truncate text-sm font-medium text-textp">{task.title}</span>
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
          </Link>
        ))}
        {tasks.length === 0 && <p className="rounded-2xl bg-surface2 p-3 text-sm text-texts">Sin tareas fijadas para hoy.</p>}
      </div>

      <Modal open={focusOpen}>
        <h3 className="mb-2 text-sm font-semibold">Editar foco del dia</h3>
        <Input value={focusDraft} maxLength={120} onChange={(e) => setFocusDraft(e.target.value)} placeholder="Define tu foco" />
        <p className="mt-1 text-xs text-texts">{focusDraft.length}/120</p>
        <div className="mt-3 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => setFocusOpen(false)}>Cancelar</button>
          <Button onClick={() => {
            onSave(focusDraft.trim().slice(0, 120));
            setFocusOpen(false);
          }}>Guardar</Button>
        </div>
      </Modal>
    </WidgetCard>
  );
}
