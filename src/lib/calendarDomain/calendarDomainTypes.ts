import type { CalendarEvent } from "../../types/calendar";

export type CalendarOwner = "mine" | "hers" | "neutral";

export type CalendarDomainSyncStatus = "idle" | "syncing" | "ok" | "degraded" | "error";

export type CalendarDomainDay = {
  date: string;
  owner: CalendarOwner;
  note: string;
  exception: boolean;
  source: "celeste_calendar";
  sourceId: string;
  hash: string;
  fetchedAt: string;
};

export type CalendarDomainEvent = Omit<CalendarEvent, "id" | "created_at" | "updated_at"> & {
  id: string;
  created_at: string;
  updated_at: string;
  domainHash: string;
};

export type CalendarDomainSyncMeta = {
  status: CalendarDomainSyncStatus;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  sourceUrl: string | null;
  sourceKind: "gh_pages" | "raw_main" | "raw_master" | "cache" | null;
  error: string | null;
};

export type CalendarDomainState = {
  schemaVersion: "v1";
  lastSuccessfulSyncAt: string | null;
  sourceFingerprint: string | null;
  daysByDate: Record<string, CalendarDomainDay>;
  eventsBySourceId: Record<string, CalendarDomainEvent>;
  syncMeta: CalendarDomainSyncMeta;
};

