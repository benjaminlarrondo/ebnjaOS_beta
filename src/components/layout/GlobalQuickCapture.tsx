import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ClipboardPlus, Dumbbell, NotebookPen, Plus, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal } from "../forms/Modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { db } from "../../lib/store";

type CaptureType = "auto" | "task" | "note" | "event" | "fitness";

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
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [captureType, setCaptureType] = useState<CaptureType>("auto");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");
  const [startAt, setStartAt] = useState(() => toLocalDateTimeInput(new Date()));
  const [endAt, setEndAt] = useState(() => toLocalDateTimeInput(new Date(Date.now() + 3600000)));

  const textForInference = useMemo(() => `${title} ${content}`.trim(), [title, content]);
  const contextualType: CaptureType =
    location.pathname === "/fitness"
      ? "fitness"
      : location.pathname === "/calendar"
        ? "event"
        : location.pathname === "/notes"
          ? "note"
          : "task";

  useEffect(() => {
    const onOpen = (event: Event) => {
      const custom = event as CustomEvent<{ type?: CaptureType }>;
      setCaptureType(custom.detail?.type || "auto");
      setOpen(true);
      setMenuOpen(false);
    };
    window.addEventListener("ebnja:quick-capture-open", onOpen as EventListener);
    return () => window.removeEventListener("ebnja:quick-capture-open", onOpen as EventListener);
  }, []);

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
    } else if (finalType === "fitness") {
      db.create("workouts", {
        title: finalTitle,
        date: new Date().toISOString().slice(0, 10),
        type: "strength",
        duration_minutes: 45,
        intensity: 7,
        notes: cleanContent || "Registro rapido",
      });
      navigate("/fitness");
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
        onClick={() => setMenuOpen((value) => !value)}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.05rem)] right-[max(0.85rem,env(safe-area-inset-right))] z-40 grid h-11 w-11 place-items-center rounded-full border border-primary/40 bg-primary text-[#171717] md:h-12 md:w-12"
        aria-label="Quick capture"
      >
        {menuOpen ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
      </button>
      {menuOpen && (
        <div className="fixed bottom-32 right-[max(0.85rem,env(safe-area-inset-right))] z-40 grid gap-2">
          <button type="button" className="btn-primary flex items-center gap-2 text-xs" onClick={() => { setCaptureType(contextualType); setOpen(true); setMenuOpen(false); }}>
            <Plus className="h-4 w-4" /> Acción rápida del módulo
          </button>
          <button type="button" className="btn-ghost flex items-center gap-2" onClick={() => { setCaptureType("task"); setOpen(true); setMenuOpen(false); }}>
            <ClipboardPlus className="h-4 w-4" /> Nueva tarea
          </button>
          <button type="button" className="btn-ghost flex items-center gap-2" onClick={() => { setCaptureType("event"); setOpen(true); setMenuOpen(false); }}>
            <CalendarDays className="h-4 w-4" /> Nuevo evento
          </button>
          <button type="button" className="btn-ghost flex items-center gap-2" onClick={() => { setCaptureType("note"); setOpen(true); setMenuOpen(false); }}>
            <NotebookPen className="h-4 w-4" /> Nueva nota
          </button>
          <button type="button" className="btn-ghost flex items-center gap-2" onClick={() => { setCaptureType("fitness"); setOpen(true); setMenuOpen(false); }}>
            <Dumbbell className="h-4 w-4" /> Nuevo registro fitness
          </button>
        </div>
      )}

      <Modal open={open}>
        <h3 className="mb-2 text-sm font-semibold">Quick capture</h3>
        <div className="space-y-2">
          <Select value={captureType} onChange={(e) => setCaptureType(e.target.value as CaptureType)}>
            <option value="auto">Auto</option>
            <option value="task">Tarea</option>
            <option value="note">Nota</option>
            <option value="event">Evento</option>
            <option value="fitness">Fitness</option>
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
