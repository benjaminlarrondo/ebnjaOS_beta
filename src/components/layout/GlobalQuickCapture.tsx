import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "../forms/Modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { db } from "../../lib/store";

type CaptureType = "auto" | "task" | "note" | "event";

function toLocalDateTimeInput(d: Date) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function inferType(text: string): Exclude<CaptureType, "auto"> {
  const t = text.toLowerCase();
  if (t.includes("reun") || t.includes("evento") || t.includes("calendar") || t.includes("mañana") || t.includes("hoy")) {
    return "event";
  }
  if (t.includes("idea") || t.includes("nota") || t.includes("apunte")) return "note";
  return "task";
}

export function GlobalQuickCapture() {
  const [open, setOpen] = useState(false);
  const [captureType, setCaptureType] = useState<CaptureType>("auto");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");
  const [startAt, setStartAt] = useState(() => toLocalDateTimeInput(new Date()));
  const [endAt, setEndAt] = useState(() => toLocalDateTimeInput(new Date(Date.now() + 3600000)));

  const textForInference = useMemo(() => `${title} ${content}`.trim(), [title, content]);

  const reset = () => {
    setCaptureType("auto");
    setTitle("");
    setContent("");
    setStatus("");
    setStartAt(toLocalDateTimeInput(new Date()));
    setEndAt(toLocalDateTimeInput(new Date(Date.now() + 3600000)));
  };

  const save = () => {
    const finalType = captureType === "auto" ? inferType(textForInference) : captureType;
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    const fallbackTitle = cleanContent.split("\n")[0]?.trim() || "Nueva captura";
    const finalTitle = cleanTitle || fallbackTitle;

    if (!finalTitle) {
      setStatus("Agrega contenido para capturar.");
      return;
    }

    if (finalType === "task") {
      db.create("tasks", {
        title: finalTitle,
        description: cleanContent,
        status: "inbox",
        priority: "medium",
        due_date: "",
        tags: [],
      });
    } else if (finalType === "note") {
      db.create("notes", {
        title: finalTitle,
        content: cleanContent || finalTitle,
        type: "quick",
        tags: [],
        pinned: false,
      });
    } else {
      const start = new Date(startAt);
      const end = new Date(endAt);
      if (Number.isNaN(+start) || Number.isNaN(+end) || end <= start) {
        setStatus("Fecha/hora inválida.");
        return;
      }
      db.create("events", {
        title: finalTitle,
        description: cleanContent,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        source: "manual",
        sync_status: "synced",
        event_type: "event",
        metadata: { capture: "quick" },
      });
    }

    setStatus("Capturado.");
    setTimeout(() => {
      setOpen(false);
      reset();
    }, 250);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-primary text-white shadow-lg"
        aria-label="Quick capture"
      >
        <Plus className="h-5 w-5" />
      </button>

      <Modal open={open}>
        <h3 className="mb-2 text-sm font-semibold">Quick capture</h3>
        <div className="space-y-2">
          <Select value={captureType} onChange={(e) => setCaptureType(e.target.value as CaptureType)}>
            <option value="auto">Auto</option>
            <option value="task">Tarea</option>
            <option value="note">Nota</option>
            <option value="event">Evento</option>
          </Select>
          <Input placeholder="Título (opcional)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Escribe lo que quieres guardar..." value={content} onChange={(e) => setContent(e.target.value)} />
          {(captureType === "event" || (captureType === "auto" && inferType(textForInference) === "event")) && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
              <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
            </div>
          )}
          {status && <p className="text-xs text-texts">{status}</p>}
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => { setOpen(false); reset(); }}>Cancelar</button>
          <Button onClick={save}>Guardar</Button>
        </div>
      </Modal>
    </>
  );
}
