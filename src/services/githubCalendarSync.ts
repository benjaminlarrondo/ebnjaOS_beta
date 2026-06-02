import {
  getCalendarDomainState,
  hasCalendarDomainData,
  listCalendarDomainEvents,
} from "../lib/calendarDomain/calendarDomainSelectors";
import {
  CALENDAR_DOMAIN_KEY,
  loadCalendarDomainState,
  setCalendarDomainDegraded,
  upsertCalendarDomainSnapshot,
} from "../lib/calendarDomain/calendarDomainStore";
import { syncCalendarDomainState } from "../lib/repositories/calendarRepository";
import type { CalendarDomainDay } from "../lib/calendarDomain/calendarDomainTypes";
import { setConnected, setSaving, setSyncError } from "../lib/syncStatus";
import { fetchCelesteSnapshot } from "./celeste/CelesteSyncAdapter";
import { setNetworkState } from "./sync/networkStatusLayer";

const LOCAL_SYNC_KEY = "ebnjaos-calendar-last-sync";

type CelesteFile = {
  year: number;
  days: Record<string, { owner: string; exception: boolean; note: string }>;
};

export type CalendarSyncResult = {
  inserted: number;
  updated: number;
  unchanged: number;
  errors: number;
  lastSyncAt: string;
  sourcePath: string;
  detectedDate: string | null;
};

function toCelesteFile(days: CalendarDomainDay[]): CelesteFile {
  const dayMap: CelesteFile["days"] = {};
  for (const day of days) {
    dayMap[day.date] = {
      owner: day.owner,
      exception: day.exception,
      note: day.note,
    };
  }
  const inferredYear = Number(days[0]?.date.slice(0, 4)) || new Date().getFullYear();
  return { year: inferredYear, days: dayMap };
}

function countDelta(prev: ReturnType<typeof loadCalendarDomainState>, incoming: CalendarDomainDay[]) {
  let inserted = 0;
  let updated = 0;
  let unchanged = 0;
  for (const day of incoming) {
    const existing = prev.daysByDate[day.date];
    if (!existing) {
      inserted += 1;
      continue;
    }
    if (existing.hash === day.hash) unchanged += 1;
    else updated += 1;
  }
  return { inserted, updated, unchanged };
}

export async function fetchOfficialCelesteCalendarState() {
  try {
    const snapshot = await fetchCelesteSnapshot();
    return {
      file: toCelesteFile(snapshot.days),
      sourceUrl: snapshot.sourceUrl,
      sourcePath: "archivo_base.json",
      detectedDate: null,
    };
  } catch {
    const local = loadCalendarDomainState();
    if (hasCalendarDomainData(local)) {
      const days = Object.values(local.daysByDate).sort((a, b) => a.date.localeCompare(b.date));
      return {
        file: toCelesteFile(days),
        sourceUrl: "local-cache",
        sourcePath: CALENDAR_DOMAIN_KEY,
        detectedDate: local.lastSuccessfulSyncAt,
      };
    }
    throw new Error("No se pudo leer celeste_calendar desde fuentes públicas.");
  }
}

export function getLastCalendarSyncAt() {
  return localStorage.getItem(LOCAL_SYNC_KEY);
}

export function getCalendarDomainEvents() {
  return listCalendarDomainEvents(getCalendarDomainState());
}

export async function syncCelesteCalendar(): Promise<CalendarSyncResult> {
  const previous = loadCalendarDomainState();
  setSaving(true);
  setSyncError(null);
  try {
    const snapshot = await fetchCelesteSnapshot();
    const delta = countDelta(previous, snapshot.days);
    upsertCalendarDomainSnapshot({
      days: snapshot.days,
      datasetHash: snapshot.datasetHash,
      fetchedAt: snapshot.fetchedAt,
      sourceUrl: snapshot.sourceUrl,
      sourceKind: snapshot.sourceKind,
    });
    await syncCalendarDomainState().catch(() => {});

    localStorage.setItem(LOCAL_SYNC_KEY, snapshot.fetchedAt);
    setConnected(true);
    setNetworkState("github", snapshot.sourceKind === "gh_pages" ? "ok" : "degraded");
    setNetworkState("calendar", "ok");
    setNetworkState("supabase", "degraded");

    return {
      inserted: delta.inserted,
      updated: delta.updated,
      unchanged: delta.unchanged,
      errors: 0,
      lastSyncAt: snapshot.fetchedAt,
      sourcePath: "archivo_base.json",
      detectedDate: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    setCalendarDomainDegraded(message);
    setConnected(false);
    setNetworkState("github", "offline");
    setNetworkState("calendar", "degraded");
    if (!hasCalendarDomainData(previous)) setSyncError(message);
    return {
      inserted: 0,
      updated: 0,
      unchanged: 0,
      errors: 1,
      lastSyncAt: new Date().toISOString(),
      sourcePath: "local-cache",
      detectedDate: previous.lastSuccessfulSyncAt,
    };
  } finally {
    setSaving(false);
  }
}
