import { makeBase } from "../mock";
import { getSingleUserId } from "../supabaseSync";
import type {
  CalendarDomainDay,
  CalendarDomainEvent,
  CalendarDomainState,
  CalendarOwner,
} from "./calendarDomainTypes";

export const CALENDAR_DOMAIN_KEY = "ebnjaos-calendar-domain-v1";

function toIsoDayStart(day: string) {
  return `${day}T09:00:00.000Z`;
}

function toIsoDayEnd(day: string) {
  return `${day}T10:00:00.000Z`;
}

function eventTypeFromOwner(owner: CalendarOwner) {
  if (owner === "mine") return "delivery";
  return "event";
}

function titleFromOwner(owner: CalendarOwner) {
  if (owner === "mine") return "Bloque Benja";
  if (owner === "hers") return "Bloque Charo";
  return "Bloque celeste";
}

function descriptionFromDay(day: CalendarDomainDay) {
  if (day.note) return day.note;
  if (day.owner === "mine") return "Día Benja";
  if (day.owner === "hers") return "Día Charo";
  return "Día neutral";
}

function defaultState(): CalendarDomainState {
  return {
    schemaVersion: "v1",
    lastSuccessfulSyncAt: null,
    sourceFingerprint: null,
    daysByDate: {},
    eventsBySourceId: {},
    syncMeta: {
      status: "idle",
      lastAttemptAt: null,
      lastSuccessAt: null,
      sourceUrl: null,
      sourceKind: null,
      error: null,
    },
  };
}

export function loadCalendarDomainState(): CalendarDomainState {
  const raw = localStorage.getItem(CALENDAR_DOMAIN_KEY);
  if (!raw) return defaultState();
  try {
    const parsed = JSON.parse(raw) as Partial<CalendarDomainState>;
    return {
      schemaVersion: "v1",
      lastSuccessfulSyncAt: parsed.lastSuccessfulSyncAt ?? null,
      sourceFingerprint: parsed.sourceFingerprint ?? null,
      daysByDate: parsed.daysByDate ?? {},
      eventsBySourceId: parsed.eventsBySourceId ?? {},
      syncMeta: {
        status: parsed.syncMeta?.status ?? "idle",
        lastAttemptAt: parsed.syncMeta?.lastAttemptAt ?? null,
        lastSuccessAt: parsed.syncMeta?.lastSuccessAt ?? null,
        sourceUrl: parsed.syncMeta?.sourceUrl ?? null,
        sourceKind: parsed.syncMeta?.sourceKind ?? null,
        error: parsed.syncMeta?.error ?? null,
      },
    };
  } catch {
    return defaultState();
  }
}

export function saveCalendarDomainState(state: CalendarDomainState) {
  localStorage.setItem(CALENDAR_DOMAIN_KEY, JSON.stringify(state));
}

export function buildDomainEventFromDay(day: CalendarDomainDay): CalendarDomainEvent {
  const base = makeBase();
  return {
    ...base,
    user_id: getSingleUserId(),
    title: titleFromOwner(day.owner),
    description: descriptionFromDay(day),
    start_time: toIsoDayStart(day.date),
    end_time: toIsoDayEnd(day.date),
    location: "",
    source: "github",
    source_id: day.sourceId,
    source_repo: "benjaminlarrondo/celeste_calendar",
    source_url: "",
    external_updated_at: day.fetchedAt,
    sync_status: "synced",
    event_type: eventTypeFromOwner(day.owner),
    metadata: {
      owner: day.owner,
      exception: day.exception,
      note: day.note,
      domainHash: day.hash,
    },
    domainHash: day.hash,
  };
}

export function upsertCalendarDomainSnapshot(input: {
  days: CalendarDomainDay[];
  datasetHash: string;
  fetchedAt: string;
  sourceUrl: string;
  sourceKind: CalendarDomainState["syncMeta"]["sourceKind"];
}) {
  const current = loadCalendarDomainState();
  const nextDays = { ...current.daysByDate };
  const nextEvents = { ...current.eventsBySourceId };

  for (const day of input.days) {
    const existingDay = nextDays[day.date];
    if (!existingDay || existingDay.hash !== day.hash) {
      nextDays[day.date] = day;
      nextEvents[day.sourceId] = buildDomainEventFromDay(day);
    }
  }

  const next: CalendarDomainState = {
    ...current,
    lastSuccessfulSyncAt: input.fetchedAt,
    sourceFingerprint: input.datasetHash,
    daysByDate: nextDays,
    eventsBySourceId: nextEvents,
    syncMeta: {
      status: "ok",
      lastAttemptAt: input.fetchedAt,
      lastSuccessAt: input.fetchedAt,
      sourceUrl: input.sourceUrl,
      sourceKind: input.sourceKind,
      error: null,
    },
  };

  saveCalendarDomainState(next);
  return next;
}

export function setCalendarDomainDegraded(errorMessage: string) {
  const current = loadCalendarDomainState();
  const next: CalendarDomainState = {
    ...current,
    syncMeta: {
      ...current.syncMeta,
      status: "degraded",
      lastAttemptAt: new Date().toISOString(),
      error: errorMessage,
    },
  };
  saveCalendarDomainState(next);
  return next;
}

