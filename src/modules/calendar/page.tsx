import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageTitle } from "../../components/layout/PageTitle";
import { db } from "../../lib/store";
import { IS_MOCK } from "../../lib/constants";
import { CalendarViewToggle } from "../../components/calendar/CalendarViewToggle";
import { EventCard } from "../../components/calendar/EventCard";
import { fetchOfficialCelesteCalendarState, syncCelesteCalendar } from "../../services/githubCalendarSync";
import { canRunSupabaseQueries, hydrateAllFromSupabase, pullCollection } from "../../lib/supabaseSync";
import { CalendarMonthGrid } from "../../components/calendar/CalendarMonthGrid";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { normalizeCelesteState, type CelesteCalendarState } from "../../lib/celesteCalendar";

function inNextDays(dateISO: string, days: number) {
  const now = new Date();
  const end = new Date();
  end.setDate(now.getDate() + days);
  const d = new Date(dateISO);
  return d >= now && d <= end;
}

export default function CalendarPage() {
  const [view, setView] = useState<"week" | "month" | "list">("month");
  const [status, setStatus] = useState<string>("");
  const [monthCursor, setMonthCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [celesteState, setCelesteState] = useState<CelesteCalendarState | null>(null);
  const [startAt, setStartAt] = useState(() => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [endAt, setEndAt] = useState(() => {
    const end = new Date(Date.now() + 3600000);
    end.setMinutes(0, 0, 0);
    return new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [, setTick] = useState(0);
  const hasBootSyncedRef = useRef(false);
  const events = db.list("events");

  const sorted = useMemo(
    () => [...events].sort((a, b) => +new Date(a.start_time) - +new Date(b.start_time)),
    [events],
  );
  const loadOfficialCelesteState = useCallback(async () => {
    try {
      const { file } = await fetchOfficialCelesteCalendarState();
      setCelesteState(normalizeCelesteState(file));
    } catch {
      setCelesteState(null);
    }
  }, []);

  const windowEvents = useMemo(() => {
    if (view === "week") {
      const now = new Date();
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return sorted.filter((e) => {
        const d = new Date(e.start_time);
        return d >= start && d < end;
      });
    }
    if (view === "month") {
      return sorted.filter((e) => {
        const d = new Date(e.start_time);
        return d.getMonth() === monthCursor.getMonth() && d.getFullYear() === monthCursor.getFullYear();
      });
    }
    return sorted;
  }, [sorted, view, monthCursor]);

  const manualEvents = sorted
    .filter((e) => e.source === "manual" && inNextDays(e.start_time, 30))
    .slice(0, 12);
  const upcomingEvents = sorted.filter((e) => new Date(e.start_time) >= new Date()).slice(0, 3);

  const doSync = useCallback(async () => {
    try {
      setStatus("Sincronizando...");
      const result = await syncCelesteCalendar();
      const canSyncRemote = await canRunSupabaseQueries();
      if (canSyncRemote) {
        const remote = await hydrateAllFromSupabase();
        db.hydrateCollections(remote);
      }
      setTick((x) => x + 1);
      await loadOfficialCelesteState();

      if (result.errors > 0) {
        setStatus(
          `Sync parcial: ${result.errors} errores, +${result.inserted} nuevos, ${result.updated} actualizados · fuente: ${result.sourcePath}${result.detectedDate ? ` (${result.detectedDate})` : ""}`,
        );
        return;
      }

      if (result.inserted === 0 && result.updated === 0) {
        setStatus(`Sin cambios (${result.unchanged} intactos)`);
      } else {
        setStatus(`Sincronizado: +${result.inserted} nuevos, ${result.updated} actualizados`);
      }
    } catch {
      setStatus("Sincronización en modo degradado. Usando estado local.");
    }
  }, [loadOfficialCelesteState]);

  const refreshFromSupabase = useCallback(async () => {
    if (!(await canRunSupabaseQueries())) return;
    const rows = await pullCollection("events");
    if (rows) {
      db.hydrateCollections({ events: rows });
      setTick((x) => x + 1);
    }
  }, []);

  const onDaySelect = (dayIso: string) => {
    setSelectedDay(dayIso);
    setView("month");
    setStartAt(`${dayIso}T09:00`);
    setEndAt(`${dayIso}T10:00`);
    setStatus(`Fecha seleccionada: ${dayIso}`);
  };

  const createEvent = async () => {
    if (!title.trim()) {
      setStatus("Agrega un título para crear el evento.");
      return;
    }

    if (!startAt || !endAt) {
      setStatus("Selecciona inicio y fin del evento.");
      return;
    }

    const start = new Date(startAt);
    const end = new Date(endAt);
    if (Number.isNaN(+start) || Number.isNaN(+end) || end <= start) {
      setStatus("Rango de fecha/hora inválido.");
      return;
    }

    db.create("events", {
      title: title.trim(),
      description: description.trim(),
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      source: "manual",
      sync_status: "synced",
      event_type: "event",
      metadata: {},
    });

    setTitle("");
    setDescription("");
    setStatus("Evento creado.");
    await refreshFromSupabase();
  };

  useEffect(() => {
    if (hasBootSyncedRef.current) return;
    hasBootSyncedRef.current = true;

    const boot = async () => {
      if (IS_MOCK) setStatus("Modo local activo. Carga inmediata.");
      await loadOfficialCelesteState();
    };
    void boot();
  }, [doSync, refreshFromSupabase, loadOfficialCelesteState]);

  return (
    <div className="page-shell">
      <PageTitle title="Calendar" subtitle="Mensual, semanal y lista" />

      <section className="card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CalendarViewToggle view={view} onChange={setView} />
          <button className="btn-primary" onClick={doSync}>Sincronizar celeste_calendar</button>
        </div>
        {IS_MOCK && (
          <p className="text-xs text-texts">
            Mock mode activo: usa datos locales.
          </p>
        )}
        {status && <p className="text-xs text-texts">{status}</p>}
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {upcomingEvents.length === 0 ? (
          <div className="card sm:col-span-3">
            <p className="eyebrow">Agenda</p>
            <p className="mt-2 heading-lg font-semibold text-textp">Sin próximos eventos</p>
            <p className="mt-1 text-sm text-texts">La agenda está despejada.</p>
          </div>
        ) : (
          upcomingEvents.map((event) => (
            <article key={`upcoming-${event.id}`} className="metric-card">
              <p className="caption font-semibold text-primary">
                {new Date(event.start_time).toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" })}
              </p>
              <h3 className="mt-2 heading-md font-semibold text-textp">{event.title}</h3>
              <p className="mt-2 caption text-texts">
                {new Date(event.start_time).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </article>
          ))
        )}
      </section>

      {view === "month" && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <button className="btn-ghost" onClick={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}><ChevronLeft className="h-4 w-4" /></button>
            <p className="text-sm font-semibold">{monthCursor.toLocaleDateString("es-CL", { month: "long", year: "numeric" })}</p>
            <button className="btn-ghost" onClick={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}><ChevronRight className="h-4 w-4" /></button>
          </div>
          <CalendarMonthGrid
            month={monthCursor}
            events={sorted}
            onDaySelect={onDaySelect}
            selectedDay={selectedDay}
            celesteState={celesteState ?? undefined}
          />
        </section>
      )}

      {view !== "month" && (
        <section className="card space-y-3">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-sm font-semibold">{view === "week" ? "Semana" : "Lista"}</h3>
            <button className="btn-ghost" onClick={refreshFromSupabase}>Actualizar</button>
          </div>
          {windowEvents.length === 0 ? (
            <p className="text-sm text-texts">Sin eventos</p>
          ) : (
            <div className="relative space-y-3 border-l border-borderc pl-3">
              {windowEvents.map((event) => (
                <div key={event.id} className="relative">
                  <span className="absolute -left-[1.05rem] top-4 h-2 w-2 rounded-full bg-primary" />
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {sorted.length === 0 && (
        <section className="card">
          <p className="text-sm text-texts">
            No hay eventos cargados todavía. Crea uno en "Nuevo" o sincroniza `celeste_calendar`.
          </p>
        </section>
      )}

      <section className="card space-y-3">
        <h3 className="text-sm font-semibold">Eventos</h3>
        {manualEvents.length === 0 ? <p className="text-sm text-texts">No hay eventos manuales próximos</p> : manualEvents.map((event) => <EventCard key={`manual-${event.id}`} event={event} />)}
      </section>

      <section className="card space-y-3">
        <h3 className="text-sm font-semibold">Nuevo</h3>
        <div className="grid gap-2 md:grid-cols-2">
          <Input placeholder="Título del evento" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="grid gap-2 sm:grid-cols-2">
            <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
            <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
          </div>
          <Textarea
            placeholder="Descripción o detalle"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="md:col-span-2"
          />
        </div>
        <Button type="button" onClick={createEvent}>Guardar evento</Button>
      </section>
    </div>
  );
}
