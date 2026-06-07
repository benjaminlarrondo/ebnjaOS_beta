import { useState } from "react";
import { CalendarPlus2 } from "lucide-react";
import { db } from "../../lib/store";

export function QuickAddEventCard({ onCreated }: { onCreated?: () => void }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(() => new Date().toISOString().slice(11, 16));
  const [message, setMessage] = useState("");

  const handleSave = () => {
    if (!title.trim()) {
      setMessage("Escribe un título para guardar el evento.");
      return;
    }
    const start = new Date(`${date}T${time}:00`);
    const end = new Date(start.getTime() + 3600000);
    db.create("events", {
      title: title.trim(),
      description: "",
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      source: "manual",
      sync_status: "synced",
      event_type: "event",
      metadata: {},
    });
    setTitle("");
    setMessage("Evento creado en Apple Calendar.");
    onCreated?.();
  };

  return (
    <section className="card space-y-3">
      <div className="flex items-center gap-3">
        <span className="rounded-2xl border border-borderc bg-surface2 p-3 text-primary">
          <CalendarPlus2 className="h-5 w-5" />
        </span>
        <div>
          <p className="eyebrow">Quick Add Event</p>
          <h3 className="text-base font-semibold text-textp">Nuevo evento rápido</h3>
          <p className="text-sm text-texts">Título, fecha y hora. Se guarda en Apple Calendar.</p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <input
          className="h-10 rounded-xl border border-borderc bg-surface px-3 text-sm text-textp outline-none"
          placeholder="Título"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <input
          className="h-10 rounded-xl border border-borderc bg-surface px-3 text-sm text-textp outline-none"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        <input
          className="h-10 rounded-xl border border-borderc bg-surface px-3 text-sm text-textp outline-none"
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className="btn-primary" onClick={handleSave}>
          Guardar evento
        </button>
        {message && <p className="text-xs text-texts">{message}</p>}
      </div>
    </section>
  );
}

