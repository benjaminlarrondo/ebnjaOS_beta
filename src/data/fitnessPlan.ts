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
    id: "s1",
    name: "Sesión 1 — Lower + Push",
    location: "Gym",
    focus: "Pierna + empuje",
    durationMin: 60,
    completed: false,
    exercises: [
      { name: "Sentadilla libre", prescription: "1x5 pesado + 3x8 backoff", effort: "RIR 1-2" },
      { name: "Press banca plano", prescription: "1x5 pesado + 3x8", effort: "RIR 1-2" },
      { name: "Prensa", prescription: "3x12" },
      { name: "Press inclinado mancuerna", prescription: "3x10" },
      { name: "Peso muerto rumano", prescription: "3x10" },
      { name: "Fondos asistidos", prescription: "3x12" },
      { name: "Elevaciones laterales", prescription: "3x15" },
      { name: "Caminata inclinada", prescription: "10 min" },
    ],
  },
  {
    id: "s2",
    name: "Sesión 2 — Brazos + Core",
    location: "Casa",
    focus: "Brazos y core",
    completed: false,
    exercises: [
      { name: "Curl mancuerna", prescription: "5x12" },
      { name: "Curl martillo", prescription: "5x12" },
      { name: "Tríceps banda", prescription: "5x15" },
      { name: "Push-ups", prescription: "5x20" },
      { name: "Plancha", prescription: "5x1 min" },
      { name: "Hollow hold", prescription: "5x40 seg" },
      { name: "Russian twist", prescription: "5x20" },
      { name: "Zona 2", prescription: "20 min" },
    ],
  },
  {
    id: "s3",
    name: "Sesión 3 — Upper Strength",
    location: "Gym",
    focus: "Fuerza tren superior",
    durationMin: 60,
    completed: false,
    exercises: [
      { name: "Dominadas asistidas/lastradas", prescription: "1x5 + 3x8" },
      { name: "Press militar", prescription: "1x5 + 3x8" },
      { name: "Remo barra", prescription: "4x8" },
      { name: "Jalón pecho", prescription: "3x12" },
      { name: "Farmer carry", prescription: "5 vueltas" },
    ],
  },
  {
    id: "s4",
    name: "Sesión 4 — WOD Hipertrofia",
    location: "Casa",
    focus: "Acondicionamiento + core",
    format: "EMOM 40 min",
    completed: false,
    exercises: [
      { name: "Min 1", prescription: "Goblet squat x15" },
      { name: "Min 2", prescription: "Push press x12" },
      { name: "Min 3", prescription: "Remo mancuerna x12 por lado" },
      { name: "Min 4", prescription: "Burpees x12" },
      { name: "Min 5", prescription: "Descanso" },
      { name: "Core", prescription: "Crunch 25 · Dead bug 20 · Side plank 45 seg" },
    ],
  },
  {
    id: "s5",
    name: "Sesión 5 — Posterior Chain",
    location: "Gym",
    focus: "Cadena posterior",
    durationMin: 60,
    completed: false,
    exercises: [
      { name: "Peso muerto convencional", prescription: "1x5 + 3x6" },
      { name: "Front squat", prescription: "4x8" },
      { name: "Hip thrust", prescription: "4x10" },
      { name: "Curl femoral", prescription: "4x12" },
      { name: "Assault bike o remo", prescription: "8 min" },
    ],
  },
  {
    id: "s6",
    name: "Sesión 6 — Recovery + Abs",
    location: "Casa",
    focus: "Movilidad + core",
    completed: false,
    exercises: [
      { name: "Movilidad", prescription: "Caderas · tobillos · T-spine · hombros" },
      { name: "Bird dog", prescription: "4x15" },
      { name: "Side plank", prescription: "4x45 seg" },
      { name: "Hollow hold", prescription: "4x40 seg" },
      { name: "Caminata", prescription: "30-40 min" },
    ],
  },
  {
    id: "s7",
    name: "Sesión 7 — Full Body Heavy",
    location: "Gym",
    focus: "Fuerza full body",
    durationMin: 60,
    completed: false,
    exercises: [
      { name: "Sentadilla frontal", prescription: "1x5 + 3x8" },
      { name: "Press inclinado", prescription: "1x5 + 3x8" },
      { name: "Dominadas", prescription: "4x8" },
      { name: "Remo pecho apoyado", prescription: "4x10" },
      { name: "Farmer carry pesado", prescription: "5 vueltas" },
    ],
  },
];

export const progressionPhases = [
  "Semanas 1-2: adaptación técnica, 1-2 reps en reserva.",
  "Semanas 3-4: subir cargas, cerca del fallo.",
  "Semana 5: PR controlados.",
  "Semana 6: descarga, bajar volumen 40%.",
];

export const strengthProgress = [
  { movement: "Sentadilla", value: "0 kg", trend: "0" },
  { movement: "Press banca", value: "0 kg", trend: "0" },
  { movement: "Peso muerto", value: "0 kg", trend: "0" },
  { movement: "Dominadas", value: "0 kg", trend: "0" },
];

export const todaySession = fitnessSessions[0];
