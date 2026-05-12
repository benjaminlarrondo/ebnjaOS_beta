import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { EmptyState } from "../components/cards/EmptyState";
import { ConfirmDialog } from "../components/forms/ConfirmDialog";
import { Modal } from "../components/forms/Modal";
import { db } from "../lib/store";

export function CrudList<T extends { id: string; title: string; description?: string }>(props: {
  title: string;
  keyName: "tasks" | "events" | "workouts" | "notes" | "prompts" | "resources" | "logs" | "projects";
  fields?: "basic" | "task" | "event" | "workout" | "note" | "prompt" | "resource" | "daily";
}) {
  const [, setTick] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [extra, setExtra] = useState("today");
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [editing, setEditing] = useState<T | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const items = [...(db.list(props.keyName) as unknown as T[])];

  const create = () => {
    if (!title.trim()) return;
    if (props.keyName === "tasks") db.create("tasks", { title, description, status: extra as "inbox" | "today" | "next" | "waiting" | "done" | "archived", priority: "medium", due_date: "", tags: [] });
    else if (props.keyName === "events") db.create("events", { title, description, start_time: new Date().toISOString(), end_time: new Date(Date.now() + 3600000).toISOString(), source: "manual", sync_status: "synced", event_type: "event", metadata: {} });
    else if (props.keyName === "workouts") db.create("workouts", { title, date: new Date().toISOString().slice(0, 10), type: "strength", duration_minutes: 45, intensity: 7, notes: description });
    else if (props.keyName === "notes") db.create("notes", { title, content: description, type: "quick", tags: [], pinned: false });
    else if (props.keyName === "prompts") db.create("prompts", { title, description, content: description || title, category: "productividad", tags: [], favorite: false });
    else if (props.keyName === "resources") db.create("resources", { title, description, url: description || "https://", type: "link", tags: [], source: "manual" });
    else if (props.keyName === "logs") db.create("logs", { date: new Date().toISOString().slice(0, 10), focus: title, wins: description, pending: "", energy_level: 7, workout_done: false, notes: "" });
    else if (props.keyName === "projects") db.create("projects", { title, description, status: "active", priority: "medium", start_date: "", due_date: "", tags: [] });
    setTitle("");
    setDescription("");
    setTick((x) => x + 1);
  };

  const openEdit = (item: T) => {
    setEditing(item);
    setEditTitle(item.title || "");
    setEditDescription(item.description || "");
  };

  const saveEdit = () => {
    if (!editing) return;
    if (props.keyName === "notes") db.update("notes", editing.id, { title: editTitle, content: editDescription });
    else if (props.keyName === "prompts") db.update("prompts", editing.id, { title: editTitle, description: editDescription, content: editDescription || editTitle });
    else if (props.keyName === "logs") db.update("logs", editing.id, { focus: editTitle, wins: editDescription, title: editTitle, description: editDescription });
    else db.update(props.keyName, editing.id, { title: editTitle, description: editDescription });
    setEditing(null);
    setTick((x) => x + 1);
  };

  return (
    <section className="space-y-4">
      <div className="card">
        <h3 className="mb-3 text-sm font-semibold">Nuevo</h3>
        <div className="grid gap-2 md:grid-cols-3">
          <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Descripción o detalle" value={description} onChange={(e) => setDescription(e.target.value)} className="md:col-span-2" />
          {props.keyName === "tasks" && (
            <Select value={extra} onChange={(e) => setExtra(e.target.value)}>
              <option value="today">today</option>
              <option value="inbox">inbox</option>
              <option value="next">next</option>
              <option value="waiting">waiting</option>
              <option value="done">done</option>
            </Select>
          )}
          <Button type="button" onClick={create}>Guardar</Button>
        </div>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <EmptyState text={`No hay elementos en ${props.title}`} />
        ) : (
          items.map((item) => (
            <div key={item.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.description && <p className="text-sm text-texts">{item.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button className="btn-ghost" onClick={() => openEdit(item)}>Editar</button>
                  <button className="btn-ghost" onClick={() => setToDelete(item.id)}>Eliminar</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          db.remove(props.keyName, toDelete);
          setToDelete(null);
          setTick((x) => x + 1);
        }}
      />

      <Modal open={!!editing}>
        <h3 className="mb-2 text-sm font-semibold">Editar</h3>
        <div className="space-y-2">
          <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Título" />
          <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Descripción" />
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => setEditing(null)}>Cancelar</button>
          <Button onClick={saveEdit}>Guardar cambios</Button>
        </div>
      </Modal>
    </section>
  );
}
