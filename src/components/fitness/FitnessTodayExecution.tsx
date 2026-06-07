import { useState } from "react";
import { Check, Play, Square } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { FitnessSessionTimer } from "./FitnessSessionTimer";
import { getSessionLogsForDay, getSetLogsForSession, getWorkoutDayById, getWorkoutExercises } from "../../lib/repositories/fitnessExecutionRepository";
import type {
  AdaptiveTrainingRecommendation,
  FitnessExecutionCache,
  FitnessExerciseRow,
  FitnessSessionLogRow,
} from "../../lib/fitness/fitnessExecutionTypes";
import { toDateKey } from "../../lib/health/healthMetrics";

function formatRest(restSeconds: number | null) {
  if (!restSeconds) return "Libre";
  if (restSeconds >= 60) return `${Math.round(restSeconds / 60)} min`;
  return `${restSeconds} seg`;
}

function formatTargetWeight(weight: number | null) {
  if (typeof weight !== "number" || !Number.isFinite(weight) || weight <= 0) return "—";
  return `${Math.round(weight)} kg`;
}

function setKey(exerciseName: string, setNumber: number) {
  return `${exerciseName}::${setNumber}`;
}

type SetDraft = {
  weight: string;
  reps: string;
  completed: boolean;
};

export function FitnessTodayExecution({
  state,
  selectedWorkoutDayId,
  recommendedWorkoutDayId,
  readiness,
  loading = false,
  onSelectWorkoutDay,
  onStartSession,
  onSaveSet,
  onFinishSession,
}: {
  state: FitnessExecutionCache;
  selectedWorkoutDayId: string | null;
  recommendedWorkoutDayId: string | null;
  readiness: AdaptiveTrainingRecommendation;
  loading?: boolean;
  onSelectWorkoutDay: (workoutDayId: string) => void;
  onStartSession: (workoutDayId: string, date: string, notes?: string) => Promise<FitnessSessionLogRow>;
  onSaveSet: (params: { sessionId: string; exerciseName: string; setNumber: number; weight: number; reps: number; completed: boolean }) => Promise<unknown>;
  onFinishSession: (sessionId: string, durationMinutes: number, notes?: string) => Promise<FitnessSessionLogRow>;
}) {
  const todayDateKey = toDateKey();
  const selectedDay = selectedWorkoutDayId ? getWorkoutDayById(state, selectedWorkoutDayId) : null;
  const exercises = selectedDay ? getWorkoutExercises(state, selectedDay.id) : [];
  const daySessions = selectedDay ? getSessionLogsForDay(state, selectedDay.id, todayDateKey) : [];
  const activeSession = daySessions.find((session) => session.status === "active") ?? null;
  const completedSession = daySessions.find((session) => session.status === "completed") ?? null;
  const sessionForDay = activeSession ?? completedSession ?? null;
  const [sessionId, setSessionId] = useState<string | null>(sessionForDay?.id ?? null);
  const [notes, setNotes] = useState(sessionForDay?.notes ?? "");
  const [drafts, setDrafts] = useState<Record<string, SetDraft>>({});
  const [savingSetKey, setSavingSetKey] = useState<string | null>(null);

  const displaySessionId = sessionId ?? activeSession?.id ?? completedSession?.id ?? null;
  const sessionLogs = displaySessionId ? getSetLogsForSession(state, displaySessionId) : [];
  const savedSetMap = new Map<string, { weight: number; reps: number; completed: boolean }>();
  for (const log of sessionLogs) {
    savedSetMap.set(setKey(log.exercise_name, log.set_number), {
      weight: log.weight,
      reps: log.reps,
      completed: log.completed,
    });
  }

  const totalSets = exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const completedSets = sessionLogs.filter((log) => log.completed).length;
  const sessionStartedAt = activeSession?.started_at ?? sessionForDay?.started_at ?? null;
  const sessionDuration = activeSession?.duration ?? sessionForDay?.duration ?? 0;

  const handleStart = async () => {
    if (!selectedDay) return;
    const started = await onStartSession(selectedDay.id, todayDateKey, notes);
    setSessionId(started.id);
  };

  const handleSaveSet = async (exercise: FitnessExerciseRow, setNumber: number) => {
    if (!selectedDay) return;
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const started = await onStartSession(selectedDay.id, todayDateKey, notes);
      currentSessionId = started.id;
      setSessionId(started.id);
    }

    const key = setKey(exercise.exercise_name, setNumber);
    const draft = drafts[key] ?? savedSetMap.get(key);
    const parsedWeight = Number(draft && "weight" in draft ? (draft as SetDraft).weight : exercise.target_weight ?? 0);
    const parsedReps = Number(draft && "reps" in draft ? (draft as SetDraft).reps : exercise.reps);
    setSavingSetKey(key);
    try {
      await onSaveSet({
        sessionId: currentSessionId!,
        exerciseName: exercise.exercise_name,
        setNumber,
        weight: Number.isFinite(parsedWeight) ? parsedWeight : 0,
        reps: Number.isFinite(parsedReps) ? parsedReps : exercise.reps,
        completed: true,
      });
      setDrafts((prev) => ({
        ...prev,
        [key]: {
          weight: String(Number.isFinite(parsedWeight) ? parsedWeight : exercise.target_weight ?? 0),
          reps: String(Number.isFinite(parsedReps) ? parsedReps : exercise.reps),
          completed: true,
        },
      }));
    } finally {
      setSavingSetKey(null);
    }
  };

  const handleFinish = async () => {
    const targetId = sessionId ?? activeSession?.id ?? completedSession?.id;
    if (!targetId) return;
    const finishedAt = new Date().getTime();
    const started = sessionStartedAt ? new Date(sessionStartedAt).getTime() : finishedAt;
    const durationMinutes = Math.max(1, Math.round((finishedAt - started) / 60000));
    await onFinishSession(targetId, durationMinutes, notes);
  };

  return (
    <section className="space-y-3">
      <div className="grid gap-3 xl:grid-cols-[1.45fr_1fr]">
        <article className="card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Fitness → Today</p>
              <h3 className="text-base font-semibold text-textp">{selectedDay?.name ?? "Selecciona un día de entrenamiento"}</h3>
              <p className="mt-1 text-xs text-texts">{selectedDay?.description ?? "La librería de entrenamiento vive en Supabase."}</p>
            </div>
            <span className="pill-soft">{selectedDay ? `Day ${selectedDay.day_number}` : "—"}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`pill-soft ${readiness.readiness > 80 ? "text-[#2b6b45]" : readiness.readiness >= 60 ? "text-primary" : "text-warning"}`}>
              Readiness {readiness.readiness}%
            </span>
            <span className="pill-soft">{readiness.recommendation}</span>
            <span className="pill-soft">{selectedDay?.id === recommendedWorkoutDayId ? "Recommended" : "Custom plan"}</span>
            <span className="pill-soft">Sets {completedSets}/{totalSets}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {!sessionId ? (
              <Button type="button" onClick={handleStart} disabled={!selectedDay || loading} className="gap-2">
                <Play className="h-4 w-4" />
                Iniciar entrenamiento
              </Button>
            ) : (
              <Button type="button" onClick={handleFinish} disabled={loading} className="gap-2">
                <Square className="h-4 w-4" />
                Finalizar entrenamiento
              </Button>
            )}
            <button type="button" className="btn-ghost" onClick={() => selectedDay && onSelectWorkoutDay(selectedDay.id)}>
              Mantener rutina
            </button>
          </div>

          <div className="mt-3">
            <label className="mb-2 block text-xs text-texts" htmlFor="fitness-session-notes">
              Notas de sesión
            </label>
            <Textarea
              id="fitness-session-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Sensaciones, cargas, ajustes, molestias..."
              className="min-h-20"
            />
          </div>
        </article>

        <FitnessSessionTimer startedAt={sessionStartedAt} durationMinutes={sessionDuration} />
      </div>

      <section className="card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Ejercicios</p>
            <h3 className="text-sm font-semibold text-textp">Series, peso objetivo y carga real</h3>
          </div>
          <span className="pill-soft">{exercises.length} movimientos</span>
        </div>

        <div className="mt-3 space-y-3">
          {exercises.length ? (
            exercises.map((exercise) => (
              <article key={`${selectedDay?.id}-${exercise.id}`} className="rounded-2xl border border-borderc bg-surface p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-textp">{exercise.exercise_name}</p>
                    <p className="mt-1 text-xs text-texts">
                      {exercise.sets} series · {exercise.reps} reps · {formatRest(exercise.rest_seconds)} · Objetivo {formatTargetWeight(exercise.target_weight)}
                    </p>
                  </div>
                  <span className="rounded-full border border-borderc px-2 py-1 text-[11px] text-texts">Sort {exercise.sort_order}</span>
                </div>

                <div className="mt-3 space-y-2">
                  {Array.from({ length: exercise.sets }, (_, index) => {
                    const setNumber = index + 1;
                    const key = setKey(exercise.exercise_name, setNumber);
                    const saved = savedSetMap.get(key);
                    const draft = drafts[key];
                    const weightValue = draft?.weight ?? (saved?.weight !== undefined ? String(saved.weight) : exercise.target_weight !== null ? String(exercise.target_weight) : "");
                    const repsValue = draft?.reps ?? (saved?.reps !== undefined ? String(saved.reps) : String(exercise.reps));
                    const completed = draft?.completed ?? saved?.completed ?? false;

                    return (
                      <div key={key} className="grid gap-2 rounded-xl border border-borderc bg-bg p-2 sm:grid-cols-[1fr_110px_110px_auto] sm:items-center">
                        <div>
                          <p className="text-xs font-medium text-textp">Set {setNumber}</p>
                          <p className="text-[11px] text-texts">{exercise.exercise_name}</p>
                        </div>
                        <Input
                          type="number"
                          inputMode="decimal"
                          placeholder="Peso"
                          value={weightValue}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [key]: {
                                weight: event.target.value,
                                reps: prev[key]?.reps ?? repsValue,
                                completed,
                              },
                            }))
                          }
                          className="h-9"
                        />
                        <Input
                          type="number"
                          inputMode="numeric"
                          placeholder="Reps"
                          value={repsValue}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [key]: {
                                weight: prev[key]?.weight ?? weightValue,
                                reps: event.target.value,
                                completed,
                              },
                            }))
                          }
                          className="h-9"
                        />
                        <button
                          type="button"
                          className={`btn-ghost min-h-0 px-3 py-2 text-xs ${completed ? "border-[#2a4730] text-[#2b6b45]" : ""}`}
                          onClick={() => void handleSaveSet(exercise, setNumber)}
                          disabled={loading || savingSetKey === key}
                        >
                          {completed ? <Check className="mr-1 inline h-3.5 w-3.5" /> : null}
                          {savingSetKey === key ? "Guardando..." : completed ? "Hecho" : "Guardar"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-borderc bg-surface/60 p-4 text-sm text-texts">
              No hay ejercicios para el día seleccionado.
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
