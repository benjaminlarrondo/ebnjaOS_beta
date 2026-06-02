import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, ChevronDown, CircleSlash, Dumbbell, Home, RotateCcw, SkipForward } from "lucide-react";
import { PageTitle } from "../../components/layout/PageTitle";
import { SectionCard } from "../../components/cards/SectionCard";
import { Modal } from "../../components/forms/Modal";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Select } from "../../components/ui/select";
import { QuickLogCard } from "../../components/fitness/QuickLogCard";
import { FitnessActivityRings } from "../../components/fitness/FitnessActivityRings";
import { FitnessPRTracker } from "../../components/fitness/FitnessPRTracker";
import { RecoveryCard } from "../../components/fitness/RecoveryCard";
import { StrengthProgressCard } from "../../components/fitness/StrengthProgressCard";
import { WeeklyConsistencyCard } from "../../components/fitness/WeeklyConsistencyCard";
import { WorkoutPlanList } from "../../components/fitness/WorkoutPlanList";
import { WorkoutTodayCard } from "../../components/fitness/WorkoutTodayCard";
import { fitnessSessions, progressionPhases, strengthProgress } from "../../data/fitnessPlan";
import { loadHealthState } from "../../lib/health/healthStore";
import { toDateKey } from "../../lib/health/healthMetrics";
import { db } from "../../lib/store";
import { computeFitnessHealthMetrics } from "./fitnessMetrics";
import type { WorkoutSession } from "../../data/fitnessPlan";

function toStatus(value: number): "good" | "mid" | "low" {
  if (value >= 7) return "good";
  if (value >= 4) return "mid";
  return "low";
}

type TrainingMode = "Gym" | "Casa" | "Descanso";
type PendingCompletion = { session: WorkoutSession; date: string; source: "today" | "week" };

const WEEK_TARGET = 6;
const TYPE_TARGET = 3;

function getWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthKey(dateKey: string) {
  return dateKey.slice(0, 7);
}

function getWeekStart(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d;
}

function getWeekDays(date = new Date()) {
  const start = getWeekStart(date);
  const labels = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
  return labels.map((label, index) => {
    const d = new Date(start);
    d.setDate(start.getDate() + index);
    return {
      label,
      date: getLocalDateKey(d),
      day: String(d.getDate()).padStart(2, "0"),
    };
  });
}

function clampProgress(value: number, max: number) {
  return Math.min(max, Math.max(0, value));
}

function getSessionNotes(session: WorkoutSession) {
  return session.exercises.map((e) => `${e.name}: ${e.prescription}${e.rest ? `, ${e.rest}` : ""}`).join(" | ");
}

export default function FitnessPage() {
  const [fitnessTab, setFitnessTab] = useState<"resumen" | "rutina" | "recovery" | "historial">("rutina");
  const [trainingMode, setTrainingMode] = useState<TrainingMode>("Gym");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"workout" | "weight" | "pr" | "recovery" | "notes" | "weights">("workout");
  const [value, setValue] = useState("");
  const [weightInputs, setWeightInputs] = useState<Record<string, string>>({});
  const [pendingCompletion, setPendingCompletion] = useState<PendingCompletion | null>(null);
  const [weekPlannerOpen, setWeekPlannerOpen] = useState(false);
  const [weeklyTrackingOpen, setWeeklyTrackingOpen] = useState(false);
  const [monthlyOpen, setMonthlyOpen] = useState(false);
  const [, setTick] = useState(0);
  const [status, setStatus] = useState("");

  const state = db.getFitnessState();
  const workouts = db.list("workouts");
  const todayDateKey = toDateKey();
  const healthState = loadHealthState();
  const workoutsToday = workouts.filter((workout) => workout.date === todayDateKey).length;
  const recentWorkouts = workouts.filter((workout) => {
    const d = new Date(`${workout.date}T12:00:00`);
    const now = new Date();
    const diff = Math.round((+now - +d) / 86400000);
    return diff >= 0 && diff <= 3;
  }).length;
  const healthMetrics = computeFitnessHealthMetrics(
    healthState,
    todayDateKey,
    workoutsToday,
    state.recovery.fatigue || 0,
    recentWorkouts,
  );
  const currentWeek = getWeekKey();
  const gymSessions = useMemo(() => fitnessSessions.filter((s) => s.location === "Gym"), []);
  const homeSessions = useMemo(() => fitnessSessions.filter((s) => s.location === "Casa"), []);
  const nextGym = gymSessions[state.nextGymIndex % gymSessions.length] ?? gymSessions[0];
  const nextHome = homeSessions[state.nextHomeIndex % homeSessions.length] ?? homeSessions[0];
  const suggestedSession = trainingMode === "Gym" ? nextGym : trainingMode === "Casa" ? nextHome : undefined;
  const weekDays = useMemo(() => getWeekDays(), []);
  const completedThisWeek = clampProgress(state.sessionsCompleted, WEEK_TARGET);
  const gymCompleted = clampProgress(state.gymCompleted, TYPE_TARGET);
  const homeCompleted = clampProgress(state.homeCompleted, TYPE_TARGET);
  const adherencePct = Math.round((completedThisWeek / WEEK_TARGET) * 100);
  const weekStatus =
    completedThisWeek >= WEEK_TARGET ? "Semana completa" : completedThisWeek >= 4 ? "Muy bien encaminado" : completedThisWeek >= 2 ? "En progreso" : "Arranque pendiente";

  useEffect(() => {
    if (state.resetMode !== "auto") return;
    if (!state.weekKey || state.weekKey === currentWeek) return;
    const timer = window.setTimeout(() => {
      db.setFitnessState({
        sessionsCompleted: 0,
        sessionsPending: WEEK_TARGET,
        weeklyStreak: 0,
        adherencePct: 0,
        gymCompleted: 0,
        homeCompleted: 0,
        weekKey: currentWeek,
        weeklyTracking: {
          ...state.weeklyTracking,
          week: currentWeek,
          gymCompleted: 0,
          homeCompleted: 0,
          totalSessions: 0,
          adherencePct: 0,
        },
      });
      setTick((x) => x + 1);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [currentWeek, state.resetMode, state.weekKey, state.weeklyTracking]);

  const monthTracking = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const byMonth = Array.from({ length: 12 }, () => [] as string[]);
    const normalized = workouts
      .map((w) => w.date)
      .filter((d) => d.startsWith(`${year}-`))
      .sort();

    for (const date of normalized) {
      const m = Number(date.slice(5, 7)) - 1;
      if (m >= 0 && m < 12) byMonth[m].push(date);
    }

    return monthNames.map((name, index) => {
      const dates = [...new Set(byMonth[index])].sort();
      let bestStreak = 0;
      let currentStreak = 0;
      let prev: Date | null = null;

      for (const d of dates) {
        const day = new Date(`${d}T00:00:00`);
        if (!prev) {
          currentStreak = 1;
        } else {
          const diffDays = Math.round((+day - +prev) / 86400000);
          currentStreak = diffDays === 1 ? currentStreak + 1 : 1;
        }
        bestStreak = Math.max(bestStreak, currentStreak);
        prev = day;
      }

      return {
        month: name,
        completed: dates.length,
        streak: bestStreak,
      };
    });
  }, [workouts]);

  const monthlyWeightProgress = useMemo(() => {
    const months = new Map<string, { month: string; entries: number; total: number; best: number }>();
    for (const log of state.exerciseWeightLogs) {
      const total = log.exercises.reduce((sum, exercise) => sum + exercise.weightKg, 0);
      const current = months.get(log.month) ?? { month: log.month, entries: 0, total: 0, best: 0 };
      current.entries += 1;
      current.total += total;
      current.best = Math.max(current.best, total);
      months.set(log.month, current);
    }
    return Array.from(months.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
      .map((m) => ({ ...m, avg: m.entries ? Math.round(m.total / m.entries) : 0 }));
  }, [state.exerciseWeightLogs]);

  const maxMonthlyLoad = Math.max(1, ...monthlyWeightProgress.map((m) => m.avg));

  const getScheduleEntry = (date: string) =>
    state.weeklySchedule.find((entry) => entry.date === date) ?? {
      date,
      mode: "Descanso" as TrainingMode,
      sessionId: "",
      completed: false,
    };

  const openQuickLog = (type: "workout" | "weight" | "pr" | "recovery" | "notes") => {
    setModalType(type);
    setValue(type === "notes" ? state.weeklyTracking.notes : "");
    setModalOpen(true);
  };

  const openCompletionModal = (session: WorkoutSession, date: string, source: PendingCompletion["source"]) => {
    const existingLog = state.exerciseWeightLogs.find((log) => log.date === date && log.sessionId === session.id);
    const nextInputs = Object.fromEntries(
      session.exercises.map((exercise) => {
        const previous = existingLog?.exercises.find((x) => x.name === exercise.name)?.weightKg;
        return [exercise.name, previous ? String(previous) : ""];
      }),
    );
    setPendingCompletion({ session, date, source });
    setWeightInputs(nextInputs);
    setModalType("weights");
    setModalOpen(true);
  };

  const resetWeek = () => {
    db.setFitnessState({
      sessionsCompleted: 0,
      sessionsPending: WEEK_TARGET,
      weeklyStreak: 0,
      adherencePct: 0,
      gymCompleted: 0,
      homeCompleted: 0,
      weekKey: currentWeek,
      weeklyTracking: {
        ...state.weeklyTracking,
        week: currentWeek,
        gymCompleted: 0,
        homeCompleted: 0,
        totalSessions: 0,
        adherencePct: 0,
      },
    });
    setStatus("Semana reiniciada.");
    setTick((x) => x + 1);
  };

  const saveQuickLog = () => {
    const n = Number(value);
    if (modalType === "workout") {
      markWorkoutDone();
      setModalOpen(false);
      return;
    }

    if (modalType === "weight" && !Number.isNaN(n) && n >= 0) {
      db.setFitnessState({ bodyWeightKg: n, weeklyTracking: { ...state.weeklyTracking, week: currentWeek, weight: n } });
    }

    if (modalType === "pr") {
      db.setFitnessState({ prsThisCycle: state.prsThisCycle + 1 });
    }

    if (modalType === "recovery" && !Number.isNaN(n) && n >= 0 && n <= 10) {
      db.setFitnessState({
        sleepAvg: state.sleepAvg,
        recovery: {
          ...state.recovery,
          energy: n,
          fatigue: Math.max(0, 10 - n),
        },
        weeklyTracking: { ...state.weeklyTracking, week: currentWeek, energy: n },
      });
    }

    if (modalType === "notes") {
      db.setFitnessState({ weeklyTracking: { ...state.weeklyTracking, week: currentWeek, notes: value } });
    }

    setModalOpen(false);
    setTick((x) => x + 1);
  };

  const markWorkoutDone = () => {
    if (!suggestedSession) {
      setStatus("Descanso registrado. No se avanza la secuencia.");
      return;
    }

    const todayDate = getLocalDateKey();
    openCompletionModal(suggestedSession, todayDate, "today");
  };

  const saveCompletedWorkout = () => {
    if (!pendingCompletion) return;

    const { session, date } = pendingCompletion;
    const already = workouts.some((w) => w.date === date && w.title === session.name);

    if (!already) {
      db.create("workouts", {
        title: session.name,
        date,
        type: "strength",
        duration_minutes: session.durationMin ?? 45,
        intensity: 7,
        notes: getSessionNotes(session),
      });
    }

    const sessionWasCounted = already || state.weeklySchedule.some((entry) => entry.date === date && entry.completed);
    const nextCompleted = sessionWasCounted ? completedThisWeek : clampProgress(completedThisWeek + 1, WEEK_TARGET);
    const nextGymCompleted = sessionWasCounted || session.location !== "Gym" ? gymCompleted : clampProgress(gymCompleted + 1, TYPE_TARGET);
    const nextHomeCompleted = sessionWasCounted || session.location !== "Casa" ? homeCompleted : clampProgress(homeCompleted + 1, TYPE_TARGET);
    const nextAdherence = Math.round((nextCompleted / WEEK_TARGET) * 100);
    const nextSchedule = [
      ...state.weeklySchedule.filter((entry) => entry.date !== date),
      { date, mode: session.location, sessionId: session.id, completed: true },
    ].sort((a, b) => a.date.localeCompare(b.date));
    const nextWeightLog = {
      id: `${date}-${session.id}`,
      date,
      week: getWeekKey(new Date(`${date}T12:00:00`)),
      month: getMonthKey(date),
      sessionId: session.id,
      sessionName: session.name,
      location: session.location,
      exercises: session.exercises.map((exercise) => ({
        name: exercise.name,
        prescription: exercise.prescription,
        weightKg: Number(weightInputs[exercise.name]) || 0,
      })),
    };
    const nextWeightLogs = [
      ...state.exerciseWeightLogs.filter((log) => !(log.date === date && log.sessionId === session.id)),
      nextWeightLog,
    ].sort((a, b) => a.date.localeCompare(b.date));

    db.setFitnessState({
      sessionsCompleted: nextCompleted,
      sessionsPending: Math.max(0, WEEK_TARGET - nextCompleted),
      weeklyStreak: sessionWasCounted ? state.weeklyStreak : state.weeklyStreak + 1,
      adherencePct: nextAdherence,
      nextGymIndex: !sessionWasCounted && session.location === "Gym" ? (state.nextGymIndex + 1) % gymSessions.length : state.nextGymIndex,
      nextHomeIndex: !sessionWasCounted && session.location === "Casa" ? (state.nextHomeIndex + 1) % homeSessions.length : state.nextHomeIndex,
      lastSessionDate: date,
      lastSessionName: session.name,
      weekKey: currentWeek,
      gymCompleted: nextGymCompleted,
      homeCompleted: nextHomeCompleted,
      weeklySchedule: nextSchedule,
      exerciseWeightLogs: nextWeightLogs,
      weeklyTracking: {
        ...state.weeklyTracking,
        week: currentWeek,
        gymCompleted: nextGymCompleted,
        homeCompleted: nextHomeCompleted,
        totalSessions: nextCompleted,
        adherencePct: nextAdherence,
      },
    });
    setStatus(`${session.name} registrado con pesos. ${already ? "Se actualizaron las cargas." : "Secuencia actualizada."}`);
    setModalOpen(false);
    setPendingCompletion(null);
    setTick((x) => x + 1);
  };

  const updateWeekDay = (date: string, patch: Partial<{ mode: TrainingMode; sessionId: string; completed: boolean }>) => {
    const current = getScheduleEntry(date);
    const nextEntry = { ...current, ...patch };
    const nextSchedule = [
      ...state.weeklySchedule.filter((entry) => entry.date !== date),
      nextEntry,
    ].sort((a, b) => a.date.localeCompare(b.date));
    db.setFitnessState({ weeklySchedule: nextSchedule });
    setTick((x) => x + 1);

    if (patch.completed && nextEntry.sessionId) {
      const session = fitnessSessions.find((s) => s.id === nextEntry.sessionId);
      if (session) openCompletionModal(session, date, "week");
    }
  };

  const skipWorkout = () => {
    if (!suggestedSession) {
      setStatus("Dia de descanso activo.");
      return;
    }
    db.setFitnessState({
      nextGymIndex: suggestedSession.location === "Gym" ? (state.nextGymIndex + 1) % gymSessions.length : state.nextGymIndex,
      nextHomeIndex: suggestedSession.location === "Casa" ? (state.nextHomeIndex + 1) % homeSessions.length : state.nextHomeIndex,
    });
    setStatus(`${suggestedSession.name} saltado. Queda listo el siguiente ${suggestedSession.location}.`);
    setTick((x) => x + 1);
  };

  const updateWeeklyMetric = (key: keyof typeof state.weeklyTracking, raw: string) => {
    const nextValue = key === "notes" ? raw : Number(raw);
    db.setFitnessState({
      weeklyTracking: {
        ...state.weeklyTracking,
        week: currentWeek,
        [key]: Number.isNaN(nextValue) ? 0 : nextValue,
      },
    });
    setTick((x) => x + 1);
  };

  const recoveryMetrics = {
    sleep: { label: "Sueño", value: state.recovery.sleep, status: toStatus(state.recovery.sleep) },
    energy: { label: "Energía", value: state.recovery.energy, status: toStatus(state.recovery.energy) },
    fatigue: { label: "Fatiga", value: state.recovery.fatigue, status: toStatus(10 - state.recovery.fatigue) },
    mobility: { label: "Movilidad", value: state.recovery.mobility, status: toStatus(state.recovery.mobility) },
  };
  const latestLoadAvg = monthlyWeightProgress[monthlyWeightProgress.length - 1]?.avg ?? 0;
  return (
    <div className="page-shell">
      <PageTitle title="Fitness" subtitle={`Score ${healthMetrics.fitnessScore}% · Recovery ${healthMetrics.recoveryScore}%`} />
      <section className="card">
        <div className="grid grid-cols-4 gap-1">
          {[
            { id: "resumen", label: "Resumen" },
            { id: "rutina", label: "Rutina" },
            { id: "recovery", label: "Recovery" },
            { id: "historial", label: "Historial" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFitnessTab(tab.id as "resumen" | "rutina" | "recovery" | "historial")}
              className={`rounded-xl border px-2 py-1.5 text-xs transition ${
                fitnessTab === tab.id
                  ? "border-primary/35 bg-primary/15 font-medium text-primary"
                  : "border-transparent text-texts"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {fitnessTab === "resumen" && <section className="card">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Resumen ejecutivo</p>
            <h3 className="mt-1 text-xl font-semibold">{suggestedSession ? suggestedSession.name : "Descanso"}</h3>
            <p className="text-xs text-texts">{suggestedSession ? suggestedSession.focus : "Recuperacion activa o pausa total"}</p>
          </div>
          <span className="pill-soft text-primary">{weekStatus}</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-sm sm:grid-cols-5">
          <div className="surface-tile">
            <p className="text-xs text-texts">Sesiones</p>
            <p className="metric-value mt-2">{completedThisWeek}/{WEEK_TARGET}</p>
          </div>
          <div className="surface-tile">
            <p className="text-xs text-texts">Peso</p>
            <p className="metric-value mt-2">{state.weeklyTracking.weight || state.bodyWeightKg || 0} kg</p>
          </div>
          <div className="surface-tile">
            <p className="text-xs text-texts">Cargas</p>
            <p className="metric-value mt-2">{latestLoadAvg} kg</p>
          </div>
          <div className="surface-tile">
            <p className="text-xs text-texts">Fitness Score</p>
            <p className="metric-value mt-2">{healthMetrics.fitnessScore}%</p>
          </div>
          <div className="surface-tile">
            <p className="text-xs text-texts">Recovery Score</p>
            <p className="metric-value mt-2">{healthMetrics.recoveryScore}%</p>
          </div>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg">
          <div className="h-full rounded-full bg-primary" style={{ width: `${adherencePct}%` }} />
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <label className="text-xs text-texts sm:col-span-1">
            Hoy
            <Select className="mt-1" value={trainingMode} onChange={(e) => setTrainingMode(e.target.value as TrainingMode)}>
              <option value="Gym">Gym</option>
              <option value="Casa">Home</option>
              <option value="Descanso">Descanso</option>
            </Select>
          </label>
          <div className="inner-card">
            <p className="flex items-center gap-1 text-xs text-texts"><Dumbbell className="h-3.5 w-3.5" /> Proximo GYM</p>
            <p className="text-sm font-semibold">{nextGym.name}</p>
          </div>
          <div className="inner-card">
            <p className="flex items-center gap-1 text-xs text-texts"><Home className="h-3.5 w-3.5" /> Proximo HOME</p>
            <p className="text-sm font-semibold">{nextHome.name}</p>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button type="button" onClick={markWorkoutDone} className="btn-primary flex items-center justify-center gap-2 text-xs">
            <Check className="h-4 w-4" />
            Completado
          </button>
          <button type="button" onClick={skipWorkout} className="btn-ghost flex items-center justify-center gap-2 text-xs">
            <SkipForward className="h-4 w-4" />
            Saltar
          </button>
          <button type="button" onClick={() => openQuickLog("weight")} className="btn-ghost text-xs">Peso</button>
          <button type="button" onClick={() => openQuickLog("notes")} className="btn-ghost text-xs">Notas</button>
          <button type="button" className="btn-ghost flex items-center justify-center gap-1 text-xs sm:col-span-4" onClick={resetWeek}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset semana
          </button>
        </div>
        {status && <p className="mt-2 text-xs text-texts">{status}</p>}
      </section>}

      {fitnessTab === "rutina" && <section className="card">
        <div className="mb-3">
          <p className="eyebrow">Fitness Home</p>
          <h3 className="text-sm font-semibold text-textp">Score diario y recuperación</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="inner-card">
            <p className="text-xs text-texts">Fitness Score</p>
            <p className="mt-1 text-xl font-semibold text-textp">{healthMetrics.fitnessScore}%</p>
            <p className="text-xs text-texts">Entreno, sueño, proteína y recovery</p>
          </div>
          <div className="inner-card">
            <p className="text-xs text-texts">Recovery Score</p>
            <p className="mt-1 text-xl font-semibold text-textp">{healthMetrics.recoveryScore}%</p>
            <p className="text-xs text-texts">Sueño, fatiga manual y entrenamiento reciente</p>
          </div>
        </div>
      </section>}

      {fitnessTab === "rutina" && <section className="card">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-textp">Rutina visible hoy</h3>
          <span className="text-xs text-texts">{suggestedSession?.location ?? "Descanso"}</span>
        </div>
        {suggestedSession ? (
          <div className="grid gap-1.5 text-xs text-texts">
            {suggestedSession.exercises.map((exercise) => (
              <p key={exercise.name} className="rounded-xl border border-borderc bg-surface px-2 py-1.5">
                <span className="text-textp">{exercise.name}</span> · {exercise.prescription}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-texts">No hay rutina asignada para hoy.</p>
        )}
      </section>}

      {fitnessTab === "rutina" && <WorkoutTodayCard session={suggestedSession} onStart={markWorkoutDone} />}

      {fitnessTab === "rutina" && (
        <FitnessActivityRings
          workoutScore={healthMetrics.workoutScore}
          nutritionScore={healthMetrics.nutritionScore}
          recoveryScore={healthMetrics.recoveryScore}
        />
      )}

      {fitnessTab === "rutina" && <FitnessPRTracker />}

      {fitnessTab === "rutina" && (
        <div className="grid gap-2.5 sm:grid-cols-2">
          <WeeklyConsistencyCard
            completed={completedThisWeek}
            pending={Math.max(0, WEEK_TARGET - completedThisWeek)}
            streak={state.weeklyStreak}
          />
          <section className="card">
            <h3 className="text-sm font-semibold text-textp">Historial reciente</h3>
            {monthlyWeightProgress.length ? (
              <div className="mt-2 space-y-1.5">
                {monthlyWeightProgress.slice(-3).map((month) => (
                  <p key={month.month} className="text-xs text-texts">
                    {month.month}: <span className="font-semibold text-textp">{month.avg} kg promedio</span> · pico {month.best} kg
                  </p>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-texts">Sin historial suficiente aún. Registra cargas para activar tendencia.</p>
            )}
          </section>
        </div>
      )}

      {fitnessTab === "rutina" && <section className="card">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-textp">Seleccionar rutina</h3>
          <span className="text-xs text-texts">Visible y directa</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {fitnessSessions.map((session) => (
            <div
              key={session.id}
              className={`rounded-xl border p-2 ${suggestedSession?.id === session.id ? "border-primary/50 bg-primary/10" : "border-borderc bg-surface"}`}
            >
              <p className="text-sm font-semibold text-textp">{session.name}</p>
              <p className="text-xs text-texts">{session.focus}</p>
              <p className="mt-1 text-[11px] text-textm">{session.durationMin ?? 45} min</p>
            </div>
          ))}
        </div>
      </section>}

      {fitnessTab === "recovery" && <div className="grid gap-2.5 sm:grid-cols-2">
        <RecoveryCard metrics={recoveryMetrics} />
        <WeeklyConsistencyCard
          completed={completedThisWeek}
          pending={Math.max(0, WEEK_TARGET - completedThisWeek)}
          streak={state.weeklyStreak}
        />
      </div>}

      {fitnessTab === "rutina" && <section className="card">
        <button
          type="button"
          onClick={() => setWeekPlannerOpen((v) => !v)}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={weekPlannerOpen}
          aria-controls="week-planner-panel"
        >
          <div>
            <p className="eyebrow">Semana actual</p>
            <h3 className="text-sm font-semibold">Plan y sesiones realizadas</h3>
          </div>
          <div className="flex items-center gap-2 text-texts">
            <CalendarDays className="h-4 w-4" />
            <ChevronDown className={`h-4 w-4 transition-transform ${weekPlannerOpen ? "rotate-180" : "rotate-0"}`} />
          </div>
        </button>
        {weekPlannerOpen && (
          <div id="week-planner-panel" className="mt-2.5 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
            {weekDays.map((day) => {
              const entry = getScheduleEntry(day.date);
              const availableSessions = entry.mode === "Gym" ? gymSessions : entry.mode === "Casa" ? homeSessions : [];
              return (
                <div key={day.date} className={`rounded-2xl border p-3 ${entry.completed ? "border-primary/40 bg-primary/5" : "border-borderc"}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">{day.label}</p>
                      <p className="text-[11px] text-texts">{day.day}</p>
                    </div>
                    <button
                      type="button"
                      className={`rounded-full px-2 py-1 text-[10px] ${entry.completed ? "bg-primary text-white" : "bg-bg text-texts"}`}
                      onClick={() => {
                        if (!entry.sessionId) {
                          setStatus("Selecciona una rutina antes de marcar completado.");
                          return;
                        }
                        updateWeekDay(day.date, { completed: true });
                      }}
                    >
                      {entry.completed ? "Hecho" : "Completar"}
                    </button>
                  </div>
                  <Select
                    className="mb-2 text-xs"
                    value={entry.mode}
                    onChange={(e) => updateWeekDay(day.date, { mode: e.target.value as TrainingMode, sessionId: "", completed: false })}
                  >
                    <option value="Descanso">Descanso</option>
                    <option value="Gym">Gym</option>
                    <option value="Casa">Home</option>
                  </Select>
                  <Select
                    className="text-xs"
                    value={entry.sessionId}
                    disabled={entry.mode === "Descanso"}
                    onChange={(e) => updateWeekDay(day.date, { sessionId: e.target.value, completed: false })}
                  >
                    <option value="">Rutina</option>
                    {availableSessions.map((session) => (
                      <option key={session.id} value={session.id}>{session.name}</option>
                    ))}
                  </Select>
                </div>
              );
            })}
          </div>
        )}
      </section>}

      {fitnessTab === "historial" && <section className="card">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold">Progreso de cargas</h3>
            <p className="text-xs text-texts">Promedio mensual de kilos registrados por sesion</p>
          </div>
          <span className="rounded-full bg-bg px-2 py-1 text-[11px] text-texts">{state.exerciseWeightLogs.length} logs</span>
        </div>
        {monthlyWeightProgress.length ? (
          <div className="space-y-2">
            {monthlyWeightProgress.map((month) => (
              <div key={month.month} className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-2 text-xs">
                <span className="font-medium">{month.month}</span>
                <div className="h-3 overflow-hidden rounded-full bg-bg">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(8, (month.avg / maxMonthlyLoad) * 100)}%` }} />
                </div>
                <span className="text-right text-texts">{month.avg} kg</span>
              </div>
            ))}
            <p className="text-xs text-texts">Mejor sesion: {Math.max(...monthlyWeightProgress.map((m) => m.best))} kg totales registrados.</p>
          </div>
        ) : (
          <p className="text-sm text-texts">Guarda pesos al cerrar un entrenamiento para iniciar el comparativo mensual.</p>
        )}
      </section>}

      {fitnessTab === "historial" && <section className="card">
        <button
          type="button"
          onClick={() => setWeeklyTrackingOpen((v) => !v)}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={weeklyTrackingOpen}
          aria-controls="weekly-tracking-panel"
        >
          <div>
            <h3 className="text-sm font-semibold">Tracking semanal</h3>
            <p className="mt-1 text-xs text-texts">Medidas, energia, proteina y notas</p>
          </div>
          <ChevronDown className={`h-4 w-4 text-texts transition-transform ${weeklyTrackingOpen ? "rotate-180" : "rotate-0"}`} />
        </button>
        {weeklyTrackingOpen && (
          <div id="weekly-tracking-panel" className="mt-3">
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              {[
                ["weight", "Peso", "kg"],
                ["waist", "Cintura", "cm"],
                ["chest", "Pecho", "cm"],
                ["arm", "Brazo", "cm"],
                ["leg", "Pierna", "cm"],
                ["sleepAvg", "Sueno", "h"],
                ["energy", "Energia", "/10"],
                ["protein", "Proteina", "g"],
              ].map(([key, label, unit]) => (
                <label key={key} className="text-xs text-texts">
                  {label}
                  <Input
                    className="mt-1"
                    type="number"
                    inputMode="decimal"
                    value={String(state.weeklyTracking[key as keyof typeof state.weeklyTracking] || "")}
                    onChange={(e) => updateWeeklyMetric(key as keyof typeof state.weeklyTracking, e.target.value)}
                    placeholder={unit}
                  />
                </label>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <div className="inner-card"><p className="text-xs text-texts">Gym cumplido</p><p className="font-semibold">{gymCompleted}/{TYPE_TARGET}</p></div>
              <div className="inner-card"><p className="text-xs text-texts">Home cumplido</p><p className="font-semibold">{homeCompleted}/{TYPE_TARGET}</p></div>
              <div className="inner-card"><p className="text-xs text-texts">Sesiones</p><p className="font-semibold">{completedThisWeek}/{WEEK_TARGET}</p></div>
              <div className="inner-card"><p className="text-xs text-texts">Adherencia</p><p className="font-semibold">{adherencePct}%</p></div>
            </div>
            <Textarea
              className="mt-3"
              value={state.weeklyTracking.notes}
              onChange={(e) => updateWeeklyMetric("notes", e.target.value)}
              placeholder="Notas de la semana"
            />
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-xs text-texts">Semana {state.weeklyTracking.week || currentWeek}</p>
              <Select className="max-w-36" value={state.resetMode} onChange={(e) => db.setFitnessState({ resetMode: e.target.value as "manual" | "auto" }) && setTick((x) => x + 1)}>
                <option value="manual">Reset manual</option>
                <option value="auto">Reset auto</option>
              </Select>
            </div>
          </div>
        )}
      </section>}

      {fitnessTab === "historial" && <section className="card">
        <button
          type="button"
          onClick={() => setMonthlyOpen((v) => !v)}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={monthlyOpen}
          aria-controls="monthly-tracking-panel"
        >
          <div>
            <h3 className="text-sm font-semibold">Tracking mensual</h3>
            <p className="mt-1 text-xs text-texts">Año completo, desplegable</p>
          </div>
          <ChevronDown className={`h-4 w-4 text-texts transition-transform ${monthlyOpen ? "rotate-180" : "rotate-0"}`} />
        </button>
        {monthlyOpen && (
          <div id="monthly-tracking-panel" className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
            {monthTracking.map((m) => (
              <div key={m.month} className="inner-card">
                <p className="text-xs text-texts">{m.month}</p>
                <p className="font-semibold">{m.completed} entrenos</p>
                <p className="text-xs text-texts">Mejor streak: {m.streak} dias</p>
              </div>
            ))}
          </div>
        )}
      </section>}

      {fitnessTab === "historial" && <StrengthProgressCard rows={strengthProgress} />}

      {fitnessTab === "historial" && <QuickLogCard onAction={openQuickLog} />}

      {fitnessTab === "historial" && <SectionCard title="Progresión (6 semanas)">
        <ul className="space-y-1 text-sm text-texts">
          {progressionPhases.map((phase) => (
            <li key={phase} className="flex gap-2"><CircleSlash className="mt-0.5 h-3.5 w-3.5 shrink-0" />{phase}</li>
          ))}
        </ul>
      </SectionCard>}

      {fitnessTab === "historial" && <WorkoutPlanList sessions={fitnessSessions} highlightedId={suggestedSession?.id} />}

      <Modal open={modalOpen}>
        <h3 className="mb-2 text-sm font-semibold">
          {modalType === "weights" ? `Cerrar ${pendingCompletion?.session.name ?? "entrenamiento"}` : `Registrar ${modalType}`}
        </h3>
        {modalType === "weights" && pendingCompletion ? (
          <div className="max-h-[65vh] space-y-2 overflow-y-auto pr-1">
            <p className="text-xs text-texts">Fecha: {pendingCompletion.date}. Ingresa el peso usado por ejercicio; deja 0 o vacio si fue peso corporal.</p>
            {pendingCompletion.session.exercises.map((exercise) => (
              <label key={exercise.name} className="grid grid-cols-[1fr_5.5rem] items-center gap-2 inner-card text-xs">
                <span>
                  <span className="block font-medium text-textp">{exercise.name}</span>
                  <span className="text-texts">{exercise.prescription}</span>
                </span>
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={weightInputs[exercise.name] ?? ""}
                  onChange={(e) => setWeightInputs((prev) => ({ ...prev, [exercise.name]: e.target.value }))}
                  placeholder="kg"
                />
              </label>
            ))}
          </div>
        ) : modalType === "notes" ? (
          <Textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder="Notas de la semana" />
        ) : (
          <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={modalType === "weight" ? "Ej: 79.8" : modalType === "recovery" ? "Energia 0-10" : "Valor rapido"} />
        )}
        <p className="mt-2 text-xs text-texts">{modalType === "weights" ? "Esto alimenta consistencia, tracking semanal y comparativo mensual." : "Guardado rápido en 2 taps (mock local)."}</p>
        <div className="mt-3 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => setModalOpen(false)}>Cancelar</button>
          <Button onClick={modalType === "weights" ? saveCompletedWorkout : saveQuickLog}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
}
