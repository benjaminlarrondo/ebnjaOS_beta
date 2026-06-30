import type { FitnessProgramRow } from "./fitnessExecutionTypes";

type SeedExercise = {
  exercise_name: string;
  sets: number;
  reps: number;
  target_weight: number | null;
  rest_seconds: number | null;
  sort_order: number;
};

type SeedWorkoutDay = {
  day_number: number;
  name: string;
  description: string;
  exercises: SeedExercise[];
};

export const fitnessExecutionSeed = {
  program: {
    name: "ebnjaOS Foundation Cycle",
    description: "Programa base de fuerza, hipertrofia y recuperación para el ciclo inicial.",
    active: true,
  } satisfies Omit<FitnessProgramRow, "id" | "user_id" | "created_at" | "updated_at">,
  workoutDays: [
    {
      day_number: 1,
      name: "Squat",
      description: "Lower body base con énfasis en patrón de sentadilla.",
      exercises: [
        { exercise_name: "Back Squat", sets: 4, reps: 6, target_weight: null, rest_seconds: 120, sort_order: 1 },
        { exercise_name: "Bulgarian Split Squat", sets: 3, reps: 8, target_weight: null, rest_seconds: 90, sort_order: 2 },
        { exercise_name: "Romanian Deadlift", sets: 3, reps: 8, target_weight: null, rest_seconds: 90, sort_order: 3 },
        { exercise_name: "Leg Curl", sets: 3, reps: 12, target_weight: null, rest_seconds: 60, sort_order: 4 },
        { exercise_name: "Core", sets: 3, reps: 10, target_weight: null, rest_seconds: 45, sort_order: 5 },
      ],
    },
    {
      day_number: 2,
      name: "Push Pull",
      description: "Día mixto para empuje y tracción con volumen balanceado.",
      exercises: [
        { exercise_name: "Bench Press", sets: 4, reps: 6, target_weight: null, rest_seconds: 120, sort_order: 1 },
        { exercise_name: "Pull Ups", sets: 4, reps: 8, target_weight: null, rest_seconds: 90, sort_order: 2 },
        { exercise_name: "Incline Press", sets: 3, reps: 10, target_weight: null, rest_seconds: 75, sort_order: 3 },
        { exercise_name: "Row", sets: 3, reps: 10, target_weight: null, rest_seconds: 75, sort_order: 4 },
        { exercise_name: "Face Pull", sets: 3, reps: 15, target_weight: null, rest_seconds: 45, sort_order: 5 },
      ],
    },
    {
      day_number: 3,
      name: "Deadlift",
      description: "Bisagra pesada con accesorios para cadena posterior.",
      exercises: [
        { exercise_name: "Deadlift", sets: 4, reps: 4, target_weight: null, rest_seconds: 150, sort_order: 1 },
        { exercise_name: "Front Squat", sets: 3, reps: 6, target_weight: null, rest_seconds: 120, sort_order: 2 },
        { exercise_name: "Hip Thrust", sets: 3, reps: 8, target_weight: null, rest_seconds: 90, sort_order: 3 },
        { exercise_name: "Row", sets: 3, reps: 8, target_weight: null, rest_seconds: 75, sort_order: 4 },
        { exercise_name: "Ab Wheel", sets: 3, reps: 10, target_weight: null, rest_seconds: 45, sort_order: 5 },
      ],
    },
    {
      day_number: 4,
      name: "Shoulders Arms",
      description: "Trabajo de torso superior, estabilidad y brazos.",
      exercises: [
        { exercise_name: "Military Press", sets: 4, reps: 6, target_weight: null, rest_seconds: 120, sort_order: 1 },
        { exercise_name: "Lateral Raises", sets: 3, reps: 15, target_weight: null, rest_seconds: 45, sort_order: 2 },
        { exercise_name: "Bicep Curl", sets: 3, reps: 10, target_weight: null, rest_seconds: 45, sort_order: 3 },
        { exercise_name: "Tricep Extension", sets: 3, reps: 10, target_weight: null, rest_seconds: 45, sort_order: 4 },
        { exercise_name: "Farmer Carry", sets: 3, reps: 1, target_weight: null, rest_seconds: 60, sort_order: 5 },
      ],
    },
    {
      day_number: 5,
      name: "Home A",
      description: "Sesión en casa de potencia, coordinación y acondicionamiento.",
      exercises: [
        { exercise_name: "DB Hang Clean", sets: 4, reps: 6, target_weight: null, rest_seconds: 75, sort_order: 1 },
        { exercise_name: "DB Push Press", sets: 4, reps: 8, target_weight: null, rest_seconds: 75, sort_order: 2 },
        { exercise_name: "DB Front Squat", sets: 4, reps: 10, target_weight: null, rest_seconds: 90, sort_order: 3 },
        { exercise_name: "DB Snatch alternado", sets: 5, reps: 10, target_weight: null, rest_seconds: 60, sort_order: 4 },
        { exercise_name: "Burpees", sets: 5, reps: 10, target_weight: null, rest_seconds: 60, sort_order: 5 },
        { exercise_name: "Walking Lunges + chaleco", sets: 5, reps: 12, target_weight: null, rest_seconds: 60, sort_order: 6 },
        { exercise_name: "Renegade Row", sets: 5, reps: 10, target_weight: null, rest_seconds: 60, sort_order: 7 },
        { exercise_name: "Russian Twist", sets: 3, reps: 20, target_weight: null, rest_seconds: 30, sort_order: 8 },
        { exercise_name: "Plank", sets: 3, reps: 60, target_weight: null, rest_seconds: 30, sort_order: 9 },
      ],
    },
    {
      day_number: 6,
      name: "Home B",
      description: "Circuito en casa para core, potencia y ritmo metabólico.",
      exercises: [
        { exercise_name: "DB Thrusters", sets: 4, reps: 10, target_weight: null, rest_seconds: 60, sort_order: 1 },
        { exercise_name: "Burpees", sets: 4, reps: 10, target_weight: null, rest_seconds: 60, sort_order: 2 },
        { exercise_name: "Mountain Climbers", sets: 4, reps: 30, target_weight: null, rest_seconds: 45, sort_order: 3 },
        { exercise_name: "Push-ups", sets: 4, reps: 15, target_weight: null, rest_seconds: 45, sort_order: 4 },
        { exercise_name: "DB Row", sets: 4, reps: 12, target_weight: null, rest_seconds: 45, sort_order: 5 },
        { exercise_name: "Goblet Squat", sets: 4, reps: 15, target_weight: null, rest_seconds: 45, sort_order: 6 },
        { exercise_name: "Band Curl", sets: 4, reps: 20, target_weight: null, rest_seconds: 30, sort_order: 7 },
        { exercise_name: "Band Tricep Extension", sets: 4, reps: 20, target_weight: null, rest_seconds: 30, sort_order: 8 },
        { exercise_name: "Dead Bug", sets: 3, reps: 15, target_weight: null, rest_seconds: 30, sort_order: 9 },
        { exercise_name: "Side Plank", sets: 3, reps: 45, target_weight: null, rest_seconds: 30, sort_order: 10 },
      ],
    },
    {
      day_number: 7,
      name: "Home C",
      description: "Sesión full body con énfasis en densidad y resistencia.",
      exercises: [
        { exercise_name: "DB Clean -> Front Squat -> Push Press", sets: 5, reps: 8, target_weight: null, rest_seconds: 90, sort_order: 1 },
        { exercise_name: "Push-ups", sets: 5, reps: 15, target_weight: null, rest_seconds: 60, sort_order: 2 },
        { exercise_name: "DB RDL", sets: 5, reps: 15, target_weight: null, rest_seconds: 60, sort_order: 3 },
        { exercise_name: "Walking Lunges", sets: 5, reps: 12, target_weight: null, rest_seconds: 60, sort_order: 4 },
        { exercise_name: "Burpees", sets: 5, reps: 10, target_weight: null, rest_seconds: 60, sort_order: 5 },
        { exercise_name: "Farmer Carry pesado", sets: 5, reps: 1, target_weight: null, rest_seconds: 45, sort_order: 6 },
      ],
    },
    {
      day_number: 8,
      name: "Home Recovery",
      description: "Sesión de recuperación activa, movilidad y respiración.",
      exercises: [
        { exercise_name: "Mobility Flow", sets: 3, reps: 10, target_weight: null, rest_seconds: 30, sort_order: 1 },
        { exercise_name: "Breath Work", sets: 3, reps: 5, target_weight: null, rest_seconds: 30, sort_order: 2 },
        { exercise_name: "Walk", sets: 1, reps: 20, target_weight: null, rest_seconds: 0, sort_order: 3 },
        { exercise_name: "Stretch", sets: 3, reps: 10, target_weight: null, rest_seconds: 30, sort_order: 4 },
      ],
    },
  ] satisfies SeedWorkoutDay[],
} as const;

export function getSeedWorkoutDayNumbers() {
  return fitnessExecutionSeed.workoutDays.map((day) => day.day_number);
}

export function getSeedWorkoutDayName(dayNumber: number) {
  return fitnessExecutionSeed.workoutDays.find((day) => day.day_number === dayNumber)?.name ?? "";
}

export function getSeedWorkoutDayDescription(dayNumber: number) {
  return fitnessExecutionSeed.workoutDays.find((day) => day.day_number === dayNumber)?.description ?? "";
}

export function getSeedWorkoutLibraryIds(programId: string) {
  return fitnessExecutionSeed.workoutDays.map((day) => `${programId}:${day.day_number}`);
}

export type { SeedExercise, SeedWorkoutDay };
