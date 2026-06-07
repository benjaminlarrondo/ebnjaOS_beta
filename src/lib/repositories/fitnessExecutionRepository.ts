import { getSingleUserId } from "../supabaseSync";
import { mergeLastUpdatedWins, pullRows, upsertRows } from "./syncRepository";
import { fitnessExecutionSeed } from "../fitness/fitnessExecutionSeed";
import type {
  FitnessExerciseRow,
  FitnessExecutionCache,
  FitnessProgramRow,
  FitnessProgressRow,
  FitnessSessionLogRow,
  FitnessSetLogRow,
  FitnessWorkoutDayRow,
  FitnessWorkoutLibrary,
} from "../fitness/fitnessExecutionTypes";

const STORAGE_KEY = "ebnjaos-fitness-execution-v1";

export type LegacyPRRow = {
  movement: string;
  value: number;
  date: string;
};

function nowIso() {
  return new Date().toISOString();
}

function safeUuid(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `00000000-0000-4000-8000-${hex.repeat(4).slice(0, 12)}`;
}

function loadCache(): FitnessExecutionCache {
  const base = buildSeedCache();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return base;

  try {
    const parsed = JSON.parse(raw) as Partial<FitnessExecutionCache>;
    return {
      version: "v1",
      lastSyncedAt: parsed.lastSyncedAt ?? base.lastSyncedAt,
      library: {
        programs: Array.isArray(parsed.library?.programs) ? parsed.library!.programs : base.library.programs,
        workoutDays: Array.isArray(parsed.library?.workoutDays) ? parsed.library!.workoutDays : base.library.workoutDays,
        exercises: Array.isArray(parsed.library?.exercises) ? parsed.library!.exercises : base.library.exercises,
      },
      sessionLogs: Array.isArray(parsed.sessionLogs) ? parsed.sessionLogs : [],
      setLogs: Array.isArray(parsed.setLogs) ? parsed.setLogs : [],
    };
  } catch {
    return base;
  }
}

function saveCache(cache: FitnessExecutionCache) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

function buildSeedCache(): FitnessExecutionCache {
  const userId = getSingleUserId();
  const importedAt = nowIso();
  const programId = safeUuid("fitness-program:benjaos-foundation-cycle");
  const programs: FitnessProgramRow[] = [
    {
      id: programId,
      user_id: userId,
      name: fitnessExecutionSeed.program.name,
      description: fitnessExecutionSeed.program.description,
      active: true,
      created_at: importedAt,
      updated_at: importedAt,
    },
  ];

  const workoutDays: FitnessWorkoutDayRow[] = fitnessExecutionSeed.workoutDays.map((day) => {
    const workoutDayId = safeUuid(`fitness-workout-day:${programId}:${day.day_number}`);
    return {
      id: workoutDayId,
      user_id: userId,
      program_id: programId,
      day_number: day.day_number,
      name: day.name,
      description: day.description,
      created_at: importedAt,
      updated_at: importedAt,
    };
  });

  const exercises: FitnessExerciseRow[] = fitnessExecutionSeed.workoutDays.flatMap((day) => {
    const workoutDayId = safeUuid(`fitness-workout-day:${programId}:${day.day_number}`);
    return day.exercises.map((exercise) => ({
      id: safeUuid(`fitness-exercise:${workoutDayId}:${exercise.sort_order}:${exercise.exercise_name}`),
      user_id: userId,
      workout_day_id: workoutDayId,
      exercise_name: exercise.exercise_name,
      sets: exercise.sets,
      reps: exercise.reps,
      target_weight: exercise.target_weight,
      rest_seconds: exercise.rest_seconds,
      sort_order: exercise.sort_order,
      created_at: importedAt,
      updated_at: importedAt,
    }));
  });

  return {
    version: "v1",
    lastSyncedAt: "",
    library: {
      programs,
      workoutDays,
      exercises,
    },
    sessionLogs: [],
    setLogs: [],
  };
}

function buildSeedRows() {
  const cache = buildSeedCache();
  return cache.library;
}

function mergeLibrary(base: FitnessWorkoutLibrary, remote: FitnessWorkoutLibrary): FitnessWorkoutLibrary {
  return {
    programs: mergeLastUpdatedWins({ local: base.programs, remote: remote.programs, key: (item) => item.id }),
    workoutDays: mergeLastUpdatedWins({ local: base.workoutDays, remote: remote.workoutDays, key: (item) => item.id }),
    exercises: mergeLastUpdatedWins({ local: base.exercises, remote: remote.exercises, key: (item) => item.id }),
  };
}

function mergeRows<T extends { id: string; updated_at?: string }>(base: T[], remote: T[]) {
  return mergeLastUpdatedWins({ local: base, remote, key: (item) => item.id });
}

function normalizeRemoteLibrary(
  programs: FitnessProgramRow[],
  workoutDays: FitnessWorkoutDayRow[],
  exercises: FitnessExerciseRow[],
): FitnessWorkoutLibrary {
  const sortedPrograms = [...programs].sort((a, b) => a.name.localeCompare(b.name));
  const sortedWorkoutDays = [...workoutDays].sort((a, b) => a.day_number - b.day_number || a.name.localeCompare(b.name));
  const sortedExercises = [...exercises].sort((a, b) => a.workout_day_id.localeCompare(b.workout_day_id) || a.sort_order - b.sort_order);

  return {
    programs: sortedPrograms,
    workoutDays: sortedWorkoutDays,
    exercises: sortedExercises,
  };
}

async function pullRemoteLibrary() {
  const [programs, workoutDays, exercises, sessionLogs, setLogs] = await Promise.all([
    pullRows<FitnessProgramRow>("fitness_programs", getSingleUserId(), "*"),
    pullRows<FitnessWorkoutDayRow>("fitness_workout_days", getSingleUserId(), "*"),
    pullRows<FitnessExerciseRow>("fitness_exercises", getSingleUserId(), "*"),
    pullRows<FitnessSessionLogRow>("fitness_session_logs", getSingleUserId(), "*"),
    pullRows<FitnessSetLogRow>("fitness_set_logs", getSingleUserId(), "*"),
  ]);

  return {
    programs,
    workoutDays,
    exercises,
    sessionLogs,
    setLogs,
  };
}

async function seedRemoteLibrary() {
  const userId = getSingleUserId();
  const importedAt = nowIso();
  const seedLibrary = buildSeedRows();

  await Promise.allSettled([
    upsertRows("fitness_programs", seedLibrary.programs, "id"),
    upsertRows("fitness_workout_days", seedLibrary.workoutDays, "id"),
    upsertRows("fitness_exercises", seedLibrary.exercises, "id"),
  ]);

  return {
    programs: seedLibrary.programs.map((row) => ({ ...row, user_id: userId, created_at: row.created_at ?? importedAt, updated_at: row.updated_at ?? importedAt })),
    workoutDays: seedLibrary.workoutDays.map((row) => ({ ...row, user_id: userId, created_at: row.created_at ?? importedAt, updated_at: row.updated_at ?? importedAt })),
    exercises: seedLibrary.exercises.map((row) => ({ ...row, user_id: userId, created_at: row.created_at ?? importedAt, updated_at: row.updated_at ?? importedAt })),
  };
}

export function loadFitnessExecutionCache() {
  return loadCache();
}

export function getActiveFitnessProgram(state: FitnessExecutionCache) {
  return state.library.programs.find((program) => program.active) ?? state.library.programs[0] ?? null;
}

export function getWorkoutDayById(state: FitnessExecutionCache, workoutDayId: string) {
  return state.library.workoutDays.find((day) => day.id === workoutDayId) ?? null;
}

export function getWorkoutExercises(state: FitnessExecutionCache, workoutDayId: string) {
  return state.library.exercises.filter((exercise) => exercise.workout_day_id === workoutDayId).sort((a, b) => a.sort_order - b.sort_order);
}

export function getSessionLogsForDay(state: FitnessExecutionCache, workoutDayId: string, date: string) {
  return state.sessionLogs.filter((session) => session.workout_day_id === workoutDayId && session.date === date);
}

export function getSetLogsForSession(state: FitnessExecutionCache, sessionId: string) {
  return state.setLogs
    .filter((set) => set.session_id === sessionId)
    .sort((a, b) => a.exercise_name.localeCompare(b.exercise_name) || a.set_number - b.set_number);
}

export async function hydrateFitnessExecutionStateFromRemote(): Promise<FitnessExecutionCache> {
  const cache = loadCache();

  try {
    const remote = await pullRemoteLibrary();
    let remoteLibrary = normalizeRemoteLibrary(remote.programs, remote.workoutDays, remote.exercises);

    if (!remoteLibrary.programs.length || !remoteLibrary.workoutDays.length || !remoteLibrary.exercises.length) {
      const seeded = await seedRemoteLibrary();
      remoteLibrary = normalizeRemoteLibrary(seeded.programs, seeded.workoutDays, seeded.exercises);
    }

    const mergedLibrary = mergeLibrary(cache.library, remoteLibrary);
    const mergedSessions = mergeRows(cache.sessionLogs, remote.sessionLogs ?? []);
    const mergedSetLogs = mergeRows(cache.setLogs, remote.setLogs ?? []);

    const next: FitnessExecutionCache = {
      version: "v1",
      lastSyncedAt: nowIso(),
      library: mergedLibrary,
      sessionLogs: mergedSessions,
      setLogs: mergedSetLogs,
    };

    saveCache(next);
    return next;
  } catch {
    return cache;
  }
}

export async function createFitnessSession(workoutDayId: string, date: string, notes = "") {
  const importedAt = nowIso();
  const sessionId = safeUuid(`fitness-session:${getSingleUserId()}:${workoutDayId}:${date}`);
  const session: FitnessSessionLogRow = {
    id: sessionId,
    user_id: getSingleUserId(),
    workout_day_id: workoutDayId,
    date,
    duration: 0,
    notes,
    status: "active",
    started_at: importedAt,
    completed_at: null,
    created_at: importedAt,
    updated_at: importedAt,
  };

  try {
    await upsertRows("fitness_session_logs", [session], "id");
  } catch {
    // offline fallback
  }

  const cache = loadCache();
  const next: FitnessExecutionCache = {
    ...cache,
    lastSyncedAt: importedAt,
    sessionLogs: mergeRows(cache.sessionLogs, [session]),
  };
  saveCache(next);
  return session;
}

export async function updateFitnessSetLog(params: {
  sessionId: string;
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}) {
  const importedAt = nowIso();
  const row: FitnessSetLogRow = {
    id: safeUuid(`fitness-set:${getSingleUserId()}:${params.sessionId}:${params.exerciseName}:${params.setNumber}`),
    user_id: getSingleUserId(),
    session_id: params.sessionId,
    exercise_name: params.exerciseName,
    set_number: params.setNumber,
    weight: params.weight,
    reps: params.reps,
    completed: params.completed,
    created_at: importedAt,
    updated_at: importedAt,
  };

  try {
    await upsertRows("fitness_set_logs", [row], "id");
  } catch {
    // offline fallback
  }

  const cache = loadCache();
  const next: FitnessExecutionCache = {
    ...cache,
    lastSyncedAt: importedAt,
    setLogs: mergeRows(cache.setLogs, [row]),
  };
  saveCache(next);
  return row;
}

export async function completeFitnessSession(sessionId: string, durationMinutes: number, notes = "") {
  const cache = loadCache();
  const existing = cache.sessionLogs.find((session) => session.id === sessionId);
  const completedAt = nowIso();
  const workoutDay = existing ? cache.library.workoutDays.find((day) => day.id === existing.workout_day_id) ?? null : null;
  const row: FitnessSessionLogRow = {
    id: sessionId,
    user_id: existing?.user_id ?? getSingleUserId(),
    workout_day_id: existing?.workout_day_id ?? "",
    date: existing?.date ?? completedAt.slice(0, 10),
    duration: Math.max(0, Math.round(durationMinutes)),
    notes: notes || existing?.notes || "",
    status: "completed",
    started_at: existing?.started_at ?? completedAt,
    completed_at: completedAt,
    created_at: existing?.created_at ?? completedAt,
    updated_at: completedAt,
  };

  try {
    await upsertRows("fitness_session_logs", [row], "id");
  } catch {
    // offline fallback
  }

  const next: FitnessExecutionCache = {
    ...cache,
    lastSyncedAt: completedAt,
    sessionLogs: mergeRows(cache.sessionLogs, [row]),
  };
  saveCache(next);

  const dayExercises = workoutDay ? cache.library.exercises.filter((exercise) => exercise.workout_day_id === workoutDay.id) : [];
  const plannedVolume = dayExercises.reduce((sum, exercise) => {
    const targetWeight = Number(exercise.target_weight) || 0;
    const reps = Number(exercise.reps) || 0;
    const sets = Number(exercise.sets) || 0;
    return sum + targetWeight * reps * sets;
  }, 0);
  const sessionSetLogs = next.setLogs.filter((set) => set.session_id === row.id && set.completed);
  const actualVolume = sessionSetLogs.reduce((sum, set) => sum + (Number(set.weight) || 0) * (Number(set.reps) || 0), 0);
  const progressRow: FitnessProgressRow = {
    id: safeUuid(`fitness-progress:${row.id}`),
    user_id: row.user_id,
    date: row.date,
    workout_day_id: row.workout_day_id || null,
    workout_name: workoutDay?.name ?? row.workout_day_id,
    readiness: null,
    planned_volume: plannedVolume,
    actual_volume: actualVolume,
    status: "completed",
    notes: row.notes || "",
    created_at: completedAt,
    updated_at: completedAt,
  };

  try {
    await upsertRows("fitness_progress", [progressRow], "id");
  } catch {
    // offline fallback
  }

  return row;
}

export async function loadLegacyPRRows(): Promise<LegacyPRRow[]> {
  try {
    const rows = await pullRows<{ movement: string; value: number; date: string }>("fitness_prs", getSingleUserId(), "movement,value,date");
    return rows.map((row) => ({
      movement: row.movement,
      value: Number(row.value) || 0,
      date: row.date,
    }));
  } catch {
    return [];
  }
}

export async function loadFitnessProgressRows(): Promise<FitnessProgressRow[]> {
  try {
    return await pullRows<FitnessProgressRow>("fitness_progress", getSingleUserId(), "*");
  } catch {
    return [];
  }
}

export function buildExecutionStateSummary(state: FitnessExecutionCache) {
  return {
    programCount: state.library.programs.length,
    dayCount: state.library.workoutDays.length,
    exerciseCount: state.library.exercises.length,
    activeSessions: state.sessionLogs.filter((session) => session.status === "active").length,
    completedSessions: state.sessionLogs.filter((session) => session.status === "completed").length,
    setLogCount: state.setLogs.length,
  };
}
