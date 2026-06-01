import { loadCalendarDomainState } from "./calendarDomainStore";
import type { CalendarDomainDay, CalendarDomainEvent, CalendarDomainState, CalendarOwner } from "./calendarDomainTypes";

function toDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getCalendarDomainState() {
  return loadCalendarDomainState();
}

export function getOwnershipByDate(date: string, state = loadCalendarDomainState()): CalendarDomainDay | null {
  return state.daysByDate[date] ?? null;
}

export function listCalendarDomainEvents(state = loadCalendarDomainState()): CalendarDomainEvent[] {
  return Object.values(state.eventsBySourceId).sort((a, b) => a.start_time.localeCompare(b.start_time));
}

export function listEventsByOwner(owner: CalendarOwner, state = loadCalendarDomainState()) {
  return listCalendarDomainEvents(state).filter((event) => String(event.metadata?.owner || "") === owner);
}

export function isOwnerAtDate(owner: CalendarOwner, date: string, state = loadCalendarDomainState()) {
  return state.daysByDate[date]?.owner === owner;
}

export function getTodayOwner(state = loadCalendarDomainState()) {
  const today = toDateKey();
  return state.daysByDate[today]?.owner ?? "neutral";
}

export function getNextOwnerEvent(owner: CalendarOwner, state = loadCalendarDomainState()) {
  const now = new Date().toISOString();
  return listEventsByOwner(owner, state).find((event) => event.start_time >= now) ?? null;
}

export function hasCalendarDomainData(state = loadCalendarDomainState()) {
  return Object.keys(state.daysByDate).length > 0;
}

export function mergeDomainWithManualEvents(
  manualEvents: CalendarDomainEvent[] | Array<Omit<CalendarDomainEvent, "domainHash"> & { domainHash?: string }>,
  state: CalendarDomainState = loadCalendarDomainState(),
) {
  const domainEvents = listCalendarDomainEvents(state);
  const dedupe = new Map<string, CalendarDomainEvent | (typeof manualEvents)[number]>();
  for (const event of domainEvents) {
    dedupe.set(`github:${event.source_id || event.id}`, event);
  }
  for (const event of manualEvents) {
    const key = event.source === "github" ? `github:${event.source_id || event.id}` : `manual:${event.id}`;
    if (!dedupe.has(key)) dedupe.set(key, event);
  }
  return Array.from(dedupe.values()).sort((a, b) => a.start_time.localeCompare(b.start_time));
}

