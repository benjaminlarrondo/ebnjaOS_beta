import { CalendarDays } from "lucide-react";
import type { CalendarEvent } from "../../types/calendar";
import { WidgetCard } from "./WidgetCard";
import { WidgetHeader } from "./WidgetHeader";

function compactTime(iso?: string) {
  if (!iso) return "Libre";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function CalendarWidget({
  todayEvents,
  nextEvent,
  nextWeekEventsCount,
  lastSyncAt,
}: {
  todayEvents: CalendarEvent[];
  nextEvent?: CalendarEvent;
  nextWeekEventsCount: number;
  lastSyncAt: string | null;
}) {
  const previewEvents = todayEvents.length ? todayEvents : nextEvent ? [nextEvent] : [];

  return (
    <WidgetCard to="/calendar">
      <WidgetHeader
        eyebrow="Calendario"
        title={`${todayEvents.length} hoy`}
        subtitle={`${nextWeekEventsCount} eventos en 7 dias`}
        size="lg"
        className="mb-5"
        icon={<span className="rounded-full bg-surface2 p-3 text-primary"><CalendarDays className="h-5 w-5" /></span>}
      />
      <div className="space-y-3">
        {previewEvents.slice(0, 3).map((event) => (
          <div key={event.id} className="flex items-center gap-3 rounded-2xl bg-surface2 p-3">
            <span className="text-xs font-semibold text-primary">{compactTime(event.start_time)}</span>
            <p className="min-w-0 truncate text-sm font-medium text-textp">{event.title}</p>
          </div>
        ))}
        {!nextEvent && <p className="rounded-2xl bg-surface2 p-3 text-sm text-texts">Agenda libre.</p>}
      </div>
      <p className="mt-4 text-xs text-texts">Sync {lastSyncAt ? compactTime(lastSyncAt) : "pendiente"}</p>
    </WidgetCard>
  );
}
