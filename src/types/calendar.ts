import type { BaseEntity } from "./common";

export type CalendarSource = "manual" | "github" | "google";

export type CalendarEvent = BaseEntity & {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location?: string;
  source: CalendarSource;
  google_event_id?: string;
  source_id?: string;
  source_repo?: string;
  source_url?: string;
  external_updated_at?: string;
  sync_status?: "synced" | "changed" | "error";
  event_type?: "event" | "delivery" | "deadline";
  metadata?: Record<string, unknown>;
};
