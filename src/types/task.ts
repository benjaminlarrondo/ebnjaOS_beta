import type { BaseEntity, Priority } from "./common";
export type TaskStatus = "inbox" | "today" | "next" | "waiting" | "done" | "archived";
export type Task = BaseEntity & { title: string; description: string; status: TaskStatus; priority: Priority; due_date?: string; project_id?: string; calendar_event_id?: string; tags: string[] };
