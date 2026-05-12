import { useMemo, useState } from "react";
import { PageTitle } from "../../components/layout/PageTitle";
import { SectionCard } from "../../components/cards/SectionCard";
import { Modal } from "../../components/forms/Modal";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Select } from "../../components/ui/select";
import { FloatingQuickLogButton } from "../../components/fitness/FloatingQuickLogButton";
import { QuickLogCard } from "../../components/fitness/QuickLogCard";
import { RecoveryCard } from "../../components/fitness/RecoveryCard";
import { StrengthProgressCard } from "../../components/fitness/StrengthProgressCard";
import { WeeklyConsistencyCard } from "../../components/fitness/WeeklyConsistencyCard";
import { WorkoutPlanList } from "../../components/fitness/WorkoutPlanList";
import { TodayWorkoutCard } from "../../components/cards/TodayWorkoutCard";
import { fitnessSessions, progressionPhases, strengthProgress } from "../../data/fitnessPlan";
import { db } from "../../lib/store";

function toStatus(value: number): "good" | "mid" | "low" {
  if (value >= 7) return "good";
  if (value >= 4) return "mid";
  return "low";
}

export default function FitnessPage() {
  const [selectedSessionId, setSelectedSessionId] = useState(fitnessSessions[0]?.id || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"workout" | "weight" | "pr" | "recovery">("workout");
  const [value, setValue] = useState("");
  const [, setTick] = useState(0);
  const [status, setStatus] = useState("");

  const state = db.getFitnessState();
  const selectedSession = useMemo(
    () => fitnessSessions.find((s) => s.id === selectedSessionId) ?? fitnessSessions[0],
    [selectedSessionId],
  );

  const today = {
    name: selectedSession.name,
    location: selectedSession.location,
    focus: selectedSession.focus,
    durationMin: selectedSession.durationMin,
    exercises: selectedSession.exercises,
  };

  const workouts = db.list("workouts");

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

  const openQuickLog = (type: "workout" | "weight" | "pr" | "recovery") => {
    setModalType(type);
    setValue("");
    setModalOpen(true);
  };

  const saveQuickLog = () => {
    const n = Number(value);
    if (modalType === "workout") {
      db.setFitnessState({
        sessionsCompleted: state.sessionsCompleted + 1,
        sessionsPending: Math.max(0, state.sessionsPending - 1),
        weeklyStreak: state.weeklyStreak + 1,
        adherencePct: Math.min(100, state.adherencePct + 10),
      });
    }

    if (modalType === "weight" && !Number.isNaN(n) && n >= 0) {
      db.setFitnessState({ bodyWeightKg: n });
    }

    if (modalType === "pr") {
      db.setFitnessState({ prsThisCycle: state.prsThisCycle + 1 });
    }

    if (modalType === "recovery" && !Number.isNaN(n) && n >= 0 && n <= 10) {
      db.setFitnessState({
        recovery: {
          ...state.recovery,
          energy: n,
          fatigue: Math.max(0, 10 - n),
        },
      });
    }

    setModalOpen(false);
    setTick((x) => x + 1);
  };

  const markWorkoutDone = () => {
    const todayDate = new Date().toISOString().slice(0, 10);
    const already = workouts.some((w) => w.date === todayDate && w.title === selectedSession.name);
    if (already) {
      setStatus("Este entrenamiento ya fue marcado hoy.");
      return;
    }

    db.create("workouts", {
      title: selectedSession.name,
      date: todayDate,
      type: "strength",
      duration_minutes: selectedSession.durationMin ?? 45,
      intensity: 7,
      notes: selectedSession.exercises.map((e) => `${e.name}: ${e.prescription}`).join(" | "),
    });

    db.setFitnessState({
      sessionsCompleted: state.sessionsCompleted + 1,
      sessionsPending: Math.max(0, state.sessionsPending - 1),
      weeklyStreak: state.weeklyStreak + 1,
      adherencePct: Math.min(100, state.adherencePct + 10),
    });
    setStatus("Entrenamiento registrado como realizado.");
    setTick((x) => x + 1);
  };

  const recoveryMetrics = {
    sleep: { label: "Sueño", value: state.recovery.sleep, status: toStatus(state.recovery.sleep) },
    energy: { label: "Energía", value: state.recovery.energy, status: toStatus(state.recovery.energy) },
    fatigue: { label: "Fatiga", value: state.recovery.fatigue, status: toStatus(10 - state.recovery.fatigue) },
    mobility: { label: "Movilidad", value: state.recovery.mobility, status: toStatus(state.recovery.mobility) },
  };

  return (
    <div className="space-y-4">
      <PageTitle title="Fitness" subtitle="Entrenamiento, progreso y recovery" />

      <section className="card">
        <h3 className="mb-2 text-sm font-semibold">Sesión activa</h3>
        <Select value={selectedSessionId} onChange={(e) => setSelectedSessionId(e.target.value)}>
          {fitnessSessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.name}
            </option>
          ))}
        </Select>
      </section>

      <TodayWorkoutCard workout={today} cta="Realizado" onCtaClick={markWorkoutDone} />
      {status && <p className="text-xs text-texts">{status}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <WeeklyConsistencyCard
          completed={state.sessionsCompleted}
          pending={state.sessionsPending}
          streak={state.weeklyStreak}
        />
        <RecoveryCard metrics={recoveryMetrics} />
      </div>

      <StrengthProgressCard rows={strengthProgress} />

      <QuickLogCard onAction={openQuickLog} />

      <SectionCard title="Tracking semanal">
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div className="rounded-xl border border-borderc p-2.5"><p className="text-xs text-texts">Peso corporal</p><p className="font-semibold">{state.bodyWeightKg} kg</p></div>
          <div className="rounded-xl border border-borderc p-2.5"><p className="text-xs text-texts">PRs ciclo</p><p className="font-semibold">{state.prsThisCycle}</p></div>
          <div className="rounded-xl border border-borderc p-2.5"><p className="text-xs text-texts">Volumen</p><p className="font-semibold">{state.weeklyVolume}</p></div>
          <div className="rounded-xl border border-borderc p-2.5"><p className="text-xs text-texts">Adherencia</p><p className="font-semibold">{state.adherencePct}%</p></div>
        </div>
      </SectionCard>

      <SectionCard title="Tracking mensual (año completo)">
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
          {monthTracking.map((m) => (
            <div key={m.month} className="rounded-xl border border-borderc p-2.5">
              <p className="text-xs text-texts">{m.month}</p>
              <p className="font-semibold">{m.completed} entrenos</p>
              <p className="text-xs text-texts">Mejor streak: {m.streak} días</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Progresión (6 semanas)">
        <ul className="space-y-1 text-sm text-texts">
          {progressionPhases.map((phase) => (
            <li key={phase}>• {phase}</li>
          ))}
        </ul>
      </SectionCard>

      <WorkoutPlanList sessions={fitnessSessions} />

      <FloatingQuickLogButton onClick={() => openQuickLog("workout")} />

      <Modal open={modalOpen}>
        <h3 className="mb-2 text-sm font-semibold">Registrar {modalType}</h3>
        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={modalType === "weight" ? "Ej: 79.8" : modalType === "recovery" ? "Energía 0-10" : "Valor rápido"} />
        <p className="mt-2 text-xs text-texts">Guardado rápido en 2 taps (mock local).</p>
        <div className="mt-3 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => setModalOpen(false)}>Cancelar</button>
          <Button onClick={saveQuickLog}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
}
