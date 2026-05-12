import type { BaseEntity } from "./common";
export type DailyLog = BaseEntity & { date: string; focus: string; wins: string; pending: string; energy_level: number; workout_done: boolean; notes: string };
