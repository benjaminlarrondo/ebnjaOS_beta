import { getSingleUserId } from "../supabaseSync";
import type { CalendarEvent } from "../../types/calendar";
import type { CalendarDomainState } from "../calendarDomain/calendarDomainTypes";
import { listCalendarDomainEvents } from "../calendarDomain/calendarDomainSelectors";
import { loadCalendarDomainState, saveCalendarDomainState } from "../calendarDomain/calendarDomainStore";
import { pullRows, upsertRows } from "./syncRepository";

const TABLE = "calendar_events";

function toDbCalendarEvent(event: CalendarEvent): Record<string, unknown> {
  return {
    id: event.id,
    user_id: event.user_id,
    title: event.title,
    description: event.description,
    start_time: event.start_time,
    end_time: event.end_time,
    location: event.location || "",
    source: event.source,
    google_event_id: event.google_event_id || null,
    source_id: event.source_id || null,
    source_repo: event.source_repo || null,
    source_url: event.source_url || null,
    external_updated_at: event.external_updated_at || null,
    sync_status: event.sync_status || "synced",
    event_type: event.event_type || "event",
    metadata: event.metadata || {},
    created_at: event.created_at,
    updated_at: event.updated_at,
  };
}

function toDomainStateFromEvents(
  current: CalendarDomainState,
  events: CalendarEvent[],
): CalendarDomainState {
  const nextDays = { ...current.daysByDate };
  const nextEvents = { ...current.eventsBySourceId };

  for (const event of events) {
    if (event.source !== "github" || !event.source_id) continue;
    const owner = String(event.metadata?.owner || "neutral");
    const note = String(event.metadata?.note || "");
    const exception = Boolean(event.metadata?.exception);
    const hash = String(event.metadata?.domainHash || event.metadata?._hash || "");

    nextDays[event.source_id] = {
      date: event.source_id,
      owner: owner === "mine" || owner === "hers" ? owner : "neutral",
      note,
      exception,
      source: "celeste_calendar",
      sourceId: event.source_id,
      hash,
      fetchedAt: event.external_updated_at || event.updated_at || new Date().toISOString(),
    };
    nextEvents[event.source_id] = {
      ...(event as CalendarDomainState["eventsBySourceId"][string]),
      domainHash: hash,
    };
  }

  return {
    ...current,
    daysByDate: nextDays,
    eventsBySourceId: nextEvents,
    syncMeta: {
      ...current.syncMeta,
      lastAttemptAt: new Date().toISOString(),
      lastSuccessAt: new Date().toISOString(),
      status: "ok",
      sourceKind: current.syncMeta.sourceKind || "cache",
      sourceUrl: current.syncMeta.sourceUrl || "calendar_events",
    },
  };
}

export async function pushCalendarDomainToSupabase(state = loadCalendarDomainState()) {
  const events = listCalendarDomainEvents(state).map((event) => ({
    ...toDbCalendarEvent({
      ...event,
      user_id: getSingleUserId(),
      source: "github",
      source_id: event.source_id || event.id,
      source_repo: event.source_repo || "benjaminlarrondo/celeste_calendar",
      source_url: event.source_url || "",
      external_updated_at: event.external_updated_at || event.updated_at,
    }),
    metadata: {
      ...(event.metadata || {}),
      domainHash: event.domainHash,
    },
  }));
  await upsertRows(TABLE, events, "id");
}

export async function pullCalendarDomainFromSupabase() {
  const rows = await pullRows<CalendarEvent>(TABLE, getSingleUserId());
  const current = loadCalendarDomainState();
  const next = toDomainStateFromEvents(current, rows);
  saveCalendarDomainState(next);
  return next;
}

export async function syncCalendarDomainState() {
  const local = loadCalendarDomainState();
  const remoteRows = await pullRows<CalendarEvent>(TABLE, getSingleUserId());
  const localRows = listCalendarDomainEvents(local);
  const bySourceId = new Map<string, CalendarEvent>();

  for (const row of [...remoteRows, ...localRows]) {
    const sourceId = String(row.source_id || row.id);
    const existing = bySourceId.get(sourceId);
    if (!existing) {
      bySourceId.set(sourceId, row as CalendarEvent);
      continue;
    }
    const existingTs = new Date(existing.updated_at || 0).toISOString();
    const incomingTs = new Date(row.updated_at || 0).toISOString();
    if (incomingTs >= existingTs) bySourceId.set(sourceId, row as CalendarEvent);
  }

  const dbRows = Array.from(bySourceId.values()).map((row) =>
    toDbCalendarEvent({
      ...row,
      user_id: row.user_id || getSingleUserId(),
      source: row.source || "github",
      source_id: row.source_id || row.id,
      source_repo: row.source_repo || "benjaminlarrondo/celeste_calendar",
      source_url: row.source_url || "",
      external_updated_at: row.external_updated_at || row.updated_at,
    }),
  );
  await upsertRows(TABLE, dbRows, "id");
  return pullCalendarDomainFromSupabase();
}
