import type { CalendarEvent } from "../../types/calendar";
import { ExternalSourceBadge } from "./ExternalSourceBadge";

export function EventCard({ event }: { event: CalendarEvent }) {
  return (
    <article className="rounded-xl border border-borderc bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{event.title}</p>
          <p className="text-xs text-texts">{new Date(event.start_time).toLocaleDateString()} · {new Date(event.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
          {event.description && <p className="mt-1 text-xs text-texts">{event.description}</p>}
        </div>
        <ExternalSourceBadge source={event.source} />
      </div>
      {event.source === "github" && event.source_url && (
        <a href={event.source_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-primary">
          Ver fuente
        </a>
      )}
    </article>
  );
}
