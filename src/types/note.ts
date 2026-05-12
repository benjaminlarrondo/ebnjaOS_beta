import type { BaseEntity } from "./common";
export type NoteType = "quick" | "idea" | "meeting" | "learning" | "reflection";
export type Note = BaseEntity & { title: string; content: string; type: NoteType; tags: string[]; pinned: boolean };
