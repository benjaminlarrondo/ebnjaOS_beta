export type SessionLocation = "Gym" | "Casa";

export type Exercise = {
  name: string;
  prescription: string;
  rest?: string;
  effort?: string;
};

export type WorkoutSession = {
  id: string;
  name: string;
  location: SessionLocation;
  focus: string;
  durationMin?: number;
  format?: string;
  completed: boolean;
  exercises: Exercise[];
};

export const fitnessSessions: WorkoutSession[] = [
  {
    id: "gym-a",
    name: "GYM A",
    location: "Gym",
    focus: "Fuerza Base + Push/Pull",
    durationMin: 60,
    completed: false,
    exercises: [
      { name: "Back Squat", prescription: "4x5-8", rest: "120 seg", effort: "RPE 7-8" },
      { name: "DB Romanian Deadlift", prescription: "4x8-10", rest: "90 seg", effort: "RPE 7-8" },
      { name: "DB Bench Press", prescription: "4x8-12", rest: "60-75 seg", effort: "RPE 7-8" },
      { name: "Chest Supported Row", prescription: "4x8-12", rest: "60-75 seg", effort: "RPE 7-8" },
      { name: "DB Lateral Raise", prescription: "3x15", rest: "45 seg", effort: "RPE 8-9" },
      { name: "Band Curl", prescription: "3x20", rest: "45 seg", effort: "RPE 8-9" },
      { name: "Band Tricep Pushdown", prescription: "3x20", rest: "45 seg", effort: "RPE 8-9" },
      { name: "Plank", prescription: "3x60 seg", rest: "30 seg" },
      { name: "Farmer Carry", prescription: "3x40 m", rest: "45 seg" },
    ],
  },
  {
    id: "home-a",
    name: "HOME A",
    location: "Casa",
    focus: "Alterofilia + Condición",
    completed: false,
    exercises: [
      { name: "DB Hang Clean", prescription: "4x6", rest: "75 seg", effort: "RPE 7-8" },
      { name: "DB Push Press", prescription: "4x8", rest: "75 seg", effort: "RPE 7-8" },
      { name: "DB Front Squat", prescription: "4x10", rest: "90 seg", effort: "RPE 7-8" },
      { name: "DB Snatch alternado", prescription: "5x10", rest: "60 seg", effort: "RPE 7-8" },
      { name: "Burpees", prescription: "5x10", rest: "60 seg" },
      { name: "Walking Lunges + chaleco", prescription: "5x12/lado", rest: "60 seg" },
      { name: "Renegade Row", prescription: "5x10", rest: "60 seg" },
      { name: "Russian Twist", prescription: "3x20", rest: "30 seg" },
      { name: "Plank", prescription: "3x60 seg", rest: "30 seg" },
    ],
  },
  {
    id: "gym-b",
    name: "GYM B",
    location: "Gym",
    focus: "Posterior Chain + Atletico",
    durationMin: 60,
    completed: false,
    exercises: [
      { name: "Trap Bar Deadlift", prescription: "4x5-8", rest: "120 seg", effort: "RPE 7-8" },
      { name: "Incline DB Press", prescription: "4x8-12", rest: "60 seg", effort: "RPE 7-8" },
      { name: "Lat Pulldown", prescription: "4x8-12", rest: "60 seg", effort: "RPE 7-8" },
      { name: "Bulgarian Split Squat", prescription: "4x10/lado", rest: "60 seg", effort: "RPE 7-8" },
      { name: "Face Pull", prescription: "4x15", rest: "45 seg", effort: "RPE 8-9" },
      { name: "Farmer Carry", prescription: "EMOM 8 min" },
      { name: "Push-ups", prescription: "EMOM 8 min" },
      { name: "Hanging Knee Raise", prescription: "3x12", rest: "30 seg" },
    ],
  },
  {
    id: "home-b",
    name: "HOME B",
    location: "Casa",
    focus: "Potencia + Core + Brazos",
    completed: false,
    exercises: [
      { name: "DB Thrusters", prescription: "EMOM 12 min" },
      { name: "Burpees", prescription: "EMOM 12 min" },
      { name: "Mountain Climbers", prescription: "EMOM 12 min" },
      { name: "Push-ups", prescription: "4x15", rest: "45 seg" },
      { name: "DB Row", prescription: "4x12/lado", rest: "45 seg" },
      { name: "Goblet Squat", prescription: "4x15", rest: "45 seg" },
      { name: "Band Curl", prescription: "4x20", rest: "30 seg", effort: "RPE 8-9" },
      { name: "Band Tricep Extension", prescription: "4x20", rest: "30 seg", effort: "RPE 8-9" },
      { name: "Dead Bug", prescription: "3x15", rest: "30 seg" },
      { name: "Side Plank", prescription: "3x45 seg/lado", rest: "30 seg" },
    ],
  },
  {
    id: "gym-c",
    name: "GYM C",
    location: "Gym",
    focus: "Hipertrofia + Metabolico",
    durationMin: 60,
    completed: false,
    exercises: [
      { name: "Hip Thrust", prescription: "4x8-12", rest: "90 seg", effort: "RPE 7-8" },
      { name: "Goblet Squat + chaleco", prescription: "4x10", rest: "75 seg", effort: "RPE 7-8" },
      { name: "DB Shoulder Press", prescription: "4x8-12", rest: "60 seg", effort: "RPE 7-8" },
      { name: "Seated Row", prescription: "4x8-12", rest: "60 seg", effort: "RPE 7-8" },
      { name: "Walking Lunges", prescription: "3x12/lado", rest: "45 seg" },
      { name: "Lateral Raise", prescription: "3x15", rest: "45 seg", effort: "RPE 8-9" },
      { name: "Hammer Curl", prescription: "3x15", rest: "45 seg", effort: "RPE 8-9" },
      { name: "Band Tricep Extension", prescription: "3x20", rest: "45 seg", effort: "RPE 8-9" },
      { name: "Dead Bug", prescription: "3x12/lado", rest: "30 seg" },
      { name: "Side Plank", prescription: "3x45 seg", rest: "30 seg" },
    ],
  },
  {
    id: "home-c",
    name: "HOME C",
    location: "Casa",
    focus: "Full Body WOD + Resistencia",
    completed: false,
    exercises: [
      { name: "DB Clean -> Front Squat -> Push Press", prescription: "5x8", rest: "90 seg", effort: "RPE 7-8" },
      { name: "Push-ups", prescription: "5x15", rest: "60 seg" },
      { name: "DB RDL", prescription: "5x15", rest: "60 seg" },
      { name: "Walking Lunges", prescription: "5x12/lado", rest: "60 seg" },
      { name: "Burpees", prescription: "5x10", rest: "60 seg" },
      { name: "Farmer Carry pesado", prescription: "5 min continuos" },
    ],
  },
];

export const progressionPhases = [
  "Principales: RPE 7-8, tecnica limpia.",
  "Accesorios: RPE 8-9 sin fallar constante.",
  "Fuerza: descansar 90-120 seg.",
  "Hipertrofia: descansar 60-75 seg.",
  "Accesorios/core: descansar 30-45 seg.",
  "Nutricion: proteina 1.8-2.2 g/kg, agua 2-3 L, sueno 7h+.",
];

export const strengthProgress = [
  { movement: "Sentadilla", value: "0 kg", trend: "0" },
  { movement: "Press banca", value: "0 kg", trend: "0" },
  { movement: "Peso muerto", value: "0 kg", trend: "0" },
  { movement: "Dominadas", value: "0 kg", trend: "0" },
];

export const todaySession = fitnessSessions[0];
