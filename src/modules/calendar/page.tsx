import { useState } from "react";
import { PageTitle } from "../../components/layout/PageTitle";
import { CrudList } from "../shared";
import { db } from "../../lib/store";

export default function CalendarPage() {
  const [view, setView] = useState<"week" | "month">("week");
  const events = db.list("events");

  return (
    <div className="space-y-4">
      <PageTitle title="Calendar" subtitle="Vista semanal y mensual simplificada" />
      <div className="flex gap-2">
        <button onClick={() => setView("week")} className={`rounded-full border px-3 py-1 text-xs ${view === "week" ? "border-primary bg-[#eef1f6] text-primary" : "border-borderc text-texts"}`}>Semana</button>
        <button onClick={() => setView("month")} className={`rounded-full border px-3 py-1 text-xs ${view === "month" ? "border-primary bg-[#eef1f6] text-primary" : "border-borderc text-texts"}`}>Mes</button>
      </div>
      <section className="card">
        <p className="text-sm font-medium">Vista {view === "week" ? "semanal" : "mensual"}</p>
        <div className="mt-2 space-y-2">
          {events.slice(0, view === "week" ? 7 : 12).map((event) => (
            <div key={event.id} className="rounded-xl border border-borderc p-2 text-sm">
              <p className="font-medium">{event.title}</p>
              <p className="text-xs text-texts">{new Date(event.start_time).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>
      <CrudList title="events" keyName="events" fields="event" />
    </div>
  );
}
