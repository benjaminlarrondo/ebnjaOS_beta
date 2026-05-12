import type { CalendarEvent } from "../../types/calendar";

function inNextDays(dateISO: string, days: number) {
  const now = new Date();
  const end = new Date();
  end.setDate(now.getDate() + days);
  const d = new Date(dateISO);
  return d >= now && d <= end;
}

export function CalendarOverviewCard({ events, lastSyncAt }: { events: CalendarEvent[]; lastSyncAt: string | null }) {
  const today = new Date().toDateString();
  const delivery = events
    .filter((e) => e.event_type === "delivery")
    .sort((a, b) => +new Date(a.start_time) - +new Date(b.start_time))[0];
  const todayEvents = events.filter((e) => new Date(e.start_time).toDateString() === today).length;
  const next7 = events.filter((e) => inNextDays(e.start_time, 7)).length;

  return (
    <section className="card">
      <h3 className="mb-3 text-sm font-semibold">Calendario</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl border border-borderc p-2.5">
          <p className="text-xs text-texts">Próxima entrega</p>
          <p className="mt-1 font-medium">{delivery ? new Date(delivery.start_time).toLocaleDateString() : "Sin entregas"}</p>
        </div>
        <div className="rounded-xl border border-borderc p-2.5">
          <p className="text-xs text-texts">Eventos hoy</p>
          <p className="mt-1 font-medium">{todayEvents}</p>
        </div>
        <div className="rounded-xl border border-borderc p-2.5">
          <p className="text-xs text-texts">Próximos 7 días</p>
          <p className="mt-1 font-medium">{next7}</p>
        </div>
        <div className="rounded-xl border border-borderc p-2.5">
          <p className="text-xs text-texts">Último sync</p>
          <p className="mt-1 font-medium">{lastSyncAt ? new Date(lastSyncAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Nunca"}</p>
        </div>
      </div>
    </section>
  );
}
