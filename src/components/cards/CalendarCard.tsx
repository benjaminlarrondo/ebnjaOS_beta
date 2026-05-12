import type { CalendarEvent } from "../../types/calendar";
export function CalendarCard({ event }: { event: CalendarEvent }) {
  return <div className="flex items-center justify-between rounded-xl border border-borderc p-3"><div><p className="text-sm font-medium">{event.title}</p><p className="text-xs text-texts">{new Date(event.start_time).toLocaleString()}</p></div></div>;
}
