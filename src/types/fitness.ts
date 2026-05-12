import type { BaseEntity } from "./common";
export type WorkoutType = "strength" | "crossfit" | "cardio" | "mobility" | "recovery";
export type FitnessWorkout = BaseEntity & { title: string; date: string; type: WorkoutType; duration_minutes: number; intensity: number; notes: string };
