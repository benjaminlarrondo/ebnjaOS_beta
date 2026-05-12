import type { CalendarEvent } from "../../types/calendar";

function compactDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
}

export function UpcomingEventsCard({ events }: { events: CalendarEvent[] }) {
  return (
    <section className="card">
      <h3 className="mb-3 text-sm font-semibold">Próximos eventos</h3>
      <div className="space-y-2">
        {events.length === 0 && <p className="text-sm text-texts">No hay eventos próximos</p>}
        {events.slice(0, 2).map((event) => (
          <div key={event.id} className="flex items-center gap-3 rounded-xl border border-borderc p-2.5">
            <span className="rounded-lg bg-[#eef1f6] px-2 py-1 text-[10px] font-semibold text-primary">{compactDate(event.start_time)}</span>
            <div>
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-texts">{new Date(event.start_time).toLocaleDateString()} · {new Date(event.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
