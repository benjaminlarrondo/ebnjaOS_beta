import { useState } from "react";
import { Plus } from "lucide-react";
import { PageTitle } from "../../components/layout/PageTitle";
import { FocusCard } from "../../components/cards/FocusCard";
import { TodayTasksCard } from "../../components/cards/TodayTasksCard";
import { UpcomingEventsCard } from "../../components/cards/UpcomingEventsCard";
import { TodayWorkoutCard } from "../../components/cards/TodayWorkoutCard";
import { QuickNoteCard } from "../../components/cards/QuickNoteCard";
import { WeeklyProgressCard } from "../../components/cards/WeeklyProgressCard";
import { QuickActionsCard } from "../../components/cards/QuickActionsCard";
import { SectionCard } from "../../components/cards/SectionCard";
import { Modal } from "../../components/forms/Modal";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { CalendarOverviewCard } from "../../components/calendar/CalendarOverviewCard";
import { getLastCalendarSyncAt } from "../../services/githubCalendarSync";
import { todaySession } from "../../data/fitnessPlan";
import { db } from "../../lib/store";

export default function DashboardPage() {
  const [, setTick] = useState(0);
  const [focusOpen, setFocusOpen] = useState(false);
  const [focusDraft, setFocusDraft] = useState("");

  const data = db.load();
  const todayTasks = data.tasks.filter((t) => t.status === "today");

  return (
    <div className="space-y-4">
      <PageTitle title="Dashboard" subtitle="Centro de control personal" />

      <FocusCard
        focus={data.focus}
        onEdit={() => {
          setFocusDraft(data.focus);
          setFocusOpen(true);
        }}
      />

      <TodayTasksCard tasks={todayTasks} />

      <UpcomingEventsCard events={data.events} />

      <CalendarOverviewCard events={data.events} lastSyncAt={getLastCalendarSyncAt()} />

      <div className="grid gap-3 sm:grid-cols-2">
        <TodayWorkoutCard
          workout={{
            name: todaySession.name,
            location: todaySession.location,
            focus: todaySession.focus,
            durationMin: todaySession.durationMin,
            exercises: todaySession.exercises.map((e) => e.name),
          }}
          cta="Ver entrenamiento"
          ctaTo="/fitness"
        />
        <QuickNoteCard note={data.notes[0]} />
      </div>

      <WeeklyProgressCard
        workoutsPct={data.fitnessState.adherencePct || 0}
        tasksPct={Math.min(100, data.tasks.filter((t) => t.status === "done").length * 10)}
        sleepPct={Math.round(((data.fitnessState.recovery.sleep || 0) / 10) * 100)}
      />

      <QuickActionsCard />

      <SectionCard title="Últimos recursos guardados">
        <div className="space-y-1">
          {data.resources.slice(0, 2).map((r) => (
            <p key={r.id} className="text-sm">{r.title}</p>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Últimos prompts usados">
        <div className="space-y-1">
          {data.prompts.slice(0, 2).map((p) => (
            <p key={p.id} className="text-sm">{p.title}</p>
          ))}
        </div>
      </SectionCard>

      <button className="fixed bottom-20 right-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-primary text-white shadow-lg lg:hidden" aria-label="Quick add">
        <Plus className="h-5 w-5" />
      </button>

      <Modal open={focusOpen}>
        <h3 className="mb-2 text-sm font-semibold">Editar foco del día</h3>
        <Input value={focusDraft} maxLength={120} onChange={(e) => setFocusDraft(e.target.value)} placeholder="Define tu foco" />
        <p className="mt-1 text-xs text-texts">{focusDraft.length}/120</p>
        <div className="mt-3 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => setFocusOpen(false)}>Cancelar</button>
          <Button onClick={() => {
            db.upsertFocus(focusDraft.trim().slice(0, 120));
            setFocusOpen(false);
            setTick((x) => x + 1);
          }}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
}
