import type { BaseEntity } from "./common";
export type Resource = BaseEntity & { title: string; description: string; url: string; type: "link" | "document" | "video" | "article" | "tool" | "reference"; tags: string[]; source: string };
