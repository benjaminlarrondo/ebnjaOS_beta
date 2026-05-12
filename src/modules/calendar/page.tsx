import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageTitle } from "../../components/layout/PageTitle";
import { CrudList } from "../shared";
import { db } from "../../lib/store";
import { CalendarViewToggle } from "../../components/calendar/CalendarViewToggle";
import { EventCard } from "../../components/calendar/EventCard";
import { syncCelesteCalendar } from "../../services/githubCalendarSync";
import { hydrateAllFromSupabase, pullCollection } from "../../lib/supabaseSync";
import { CalendarMonthGrid } from "../../components/calendar/CalendarMonthGrid";

function inNextDays(dateISO: string, days: number) {
  const now = new Date();
  const end = new Date();
  end.setDate(now.getDate() + days);
  const d = new Date(dateISO);
  return d >= now && d <= end;
}

export default function CalendarPage() {
  const [view, setView] = useState<"week" | "month" | "list">("week");
  const [status, setStatus] = useState<string>("");
  const [monthCursor, setMonthCursor] = useState(new Date());
  const [, setTick] = useState(0);
  const events = db.list("events");

  const sorted = useMemo(
    () => [...events].sort((a, b) => +new Date(a.start_time) - +new Date(b.start_time)),
    [events],
  );

  const windowEvents = useMemo(() => {
    if (view === "week") return sorted.filter((e) => inNextDays(e.start_time, 7));
    if (view === "month") {
      return sorted.filter((e) => {
        const d = new Date(e.start_time);
        return d.getMonth() === monthCursor.getMonth() && d.getFullYear() === monthCursor.getFullYear();
      });
    }
    return sorted;
  }, [sorted, view, monthCursor]);

  const upcomingDeliveries = sorted.filter((e) => e.event_type === "delivery" && inNextDays(e.start_time, 14)).slice(0, 8);

  const doSync = async () => {
    try {
      setStatus("Sincronizando...");
      const result = await syncCelesteCalendar();
      const remote = await hydrateAllFromSupabase();
      db.hydrateCollections(remote);
      setTick((x) => x + 1);

      if (result.errors > 0) {
        setStatus(`Sync parcial: ${result.errors} errores, +${result.inserted} nuevos, ${result.updated} actualizados`);
        return;
      }

      if (result.inserted === 0 && result.updated === 0) {
        setStatus(`Sin cambios (${result.unchanged} intactos)`);
      } else {
        setStatus(`Sincronizado: +${result.inserted} nuevos, ${result.updated} actualizados`);
      }
    } catch (error) {
      setStatus(error instanceof Error ? `Error: ${error.message}` : "Error de sincronización");
    }
  };

  const refreshFromSupabase = async () => {
    const rows = await pullCollection("events");
    if (rows) {
      db.hydrateCollections({ events: rows });
      setTick((x) => x + 1);
    }
  };

  useEffect(() => {
    void refreshFromSupabase();
  }, []);

  return (
    <div className="space-y-4">
      <PageTitle title="Calendar" subtitle="Mensual, semanal y lista" />

      <section className="card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CalendarViewToggle view={view} onChange={setView} />
          <button className="btn-primary" onClick={doSync}>Sincronizar celeste_calendar</button>
        </div>
        {status && <p className="text-xs text-texts">{status}</p>}
      </section>

      {view === "month" && (
        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <button className="btn-ghost" onClick={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}><ChevronLeft className="h-4 w-4" /></button>
            <p className="text-sm font-semibold">{monthCursor.toLocaleDateString("es-CL", { month: "long", year: "numeric" })}</p>
            <button className="btn-ghost" onClick={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}><ChevronRight className="h-4 w-4" /></button>
          </div>
          <CalendarMonthGrid month={monthCursor} events={sorted} />
        </section>
      )}

      {view !== "month" && (
        <section className="card space-y-2">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Vista {view === "week" ? "semanal" : "lista"}</h3>
            <button className="btn-ghost" onClick={refreshFromSupabase}>Actualizar</button>
          </div>
          {windowEvents.length === 0 ? <p className="text-sm text-texts">Sin eventos en esta vista</p> : windowEvents.map((event) => <EventCard key={event.id} event={event} />)}
        </section>
      )}

      <section className="card space-y-2">
        <h3 className="text-sm font-semibold">Próximas entregas</h3>
        {upcomingDeliveries.length === 0 ? <p className="text-sm text-texts">No hay entregas próximas</p> : upcomingDeliveries.map((event) => <EventCard key={`delivery-${event.id}`} event={event} />)}
      </section>

      <CrudList
        title="events"
        keyName="events"
        fields="event"
        onCreated={async () => {
          await refreshFromSupabase();
          await doSync();
        }}
        onUpdated={refreshFromSupabase}
        onDeleted={refreshFromSupabase}
      />
    </div>
  );
}
