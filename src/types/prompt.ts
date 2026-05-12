import type { BaseEntity } from "./common";
export type Prompt = BaseEntity & { title: string; description: string; content: string; category: string; tags: string[]; favorite: boolean };
