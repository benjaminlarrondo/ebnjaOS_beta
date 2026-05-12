import type { BaseEntity } from "./common";
export type CalendarEvent = BaseEntity & { title: string; description: string; start_time: string; end_time: string; location?: string; source: "internal" | "google"; google_event_id?: string };
