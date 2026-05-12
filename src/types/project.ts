import type { BaseEntity, Priority } from "./common";
export type ProjectStatus = "active" | "paused" | "completed" | "archived";
export type Project = BaseEntity & { title: string; description: string; status: ProjectStatus; priority: Priority; start_date?: string; due_date?: string; tags: string[] };
