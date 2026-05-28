import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Flame,
  Moon,
  Target,
} from "lucide-react";
import { Modal } from "../../components/forms/Modal";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { getLastCalendarSyncAt } from "../../services/githubCalendarSync";
import { todaySession } from "../../data/fitnessPlan";
import { db } from "../../lib/store";
import { listGoals } from "../../lib/goals";
import { dashboardModules, quickActionModules } from "../../lib/navigation";

function clampPct(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function compactTime(iso?: string) {
  if (!iso) return "Libre";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ProgressLine({ value, tone = "primary" }: { value: number; tone?: "primary" | "accent" | "warning" }) {
  const color = tone === "accent" ? "bg-accent" : tone === "warning" ? "bg-warning" : "bg-primary";

  return (
    <div className="h-2 rounded-full bg-surface2">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${clampPct(value)}%` }} />
    </div>
  );
}

function StatusMetric({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-borderc bg-white p-3 shadow-sm">
      <p className="text-[11px] font-medium text-texts">{label}</p>
      <p className="mt-2 text-2xl font-semibold leading-none text-textp sm:text-3xl">{value}</p>
      {hint && <p className="mt-2 text-[11px] text-texts">{hint}</p>}
    </div>
  );
}

function ScoreRing({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="grid h-28 w-28 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(var(--color-primary) ${clampPct(value) * 3.6}deg, var(--color-surface-2) 0deg)` }}
    >
      <div className="grid h-[88px] w-[88px] place-items-center rounded-full bg-white text-center shadow-sm">
        <p className="text-2xl font-semibold leading-none text-textp">{clampPct(value)}%</p>
        <p className="mt-1 text-[10px] font-medium text-texts">{label}</p>
      </div>
    </div>
  );
}

function InsightRow({ label, value, tone }: { label: string; value: number; tone: "primary" | "accent" | "warning" }) {
  return (
    <div className="rounded-2xl bg-surface2 p-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-textp">{label}</span>
        <span className="text-texts">{clampPct(value)}%</span>
      </div>
      <ProgressLine value={value} tone={tone} />
    </div>
  );
}

export default function DashboardPage() {
  const [, setTick] = useState(0);
  const [focusOpen, setFocusOpen] = useState(false);
  const [focusDraft, setFocusDraft] = useState("");

  const data = db.load();
  const now = new Date();
  const todayKey = now.toDateString();
  const todayLabel = now.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "short" });
  const todayTasks = data.tasks.filter((t) => t.status === "today");
  const doneTasks = data.tasks.filter((t) => t.status === "done").length;
  const nextEvent = [...data.events].sort((a, b) => +new Date(a.start_time) - +new Date(b.start_time))[0];
  const todayEvents = data.events
    .filter((event) => new Date(event.start_time).toDateString() === todayKey)
    .sort((a, b) => +new Date(a.start_time) - +new Date(b.start_time));
  const nextWeekEvents = data.events.filter((event) => {
    const date = new Date(event.start_time);
    const end = new Date();
    end.setDate(now.getDate() + 7);
    return date >= now && date <= end;
  });
  const goals = listGoals();
  const activeGoals = goals.filter((g) => g.status === "active");
  const fitness = data.fitnessState;
  const fitnessPct = clampPct(fitness.adherencePct || (fitness.sessionsCompleted / 6) * 100);
  const sleepPct = clampPct(((fitness.recovery.sleep || fitness.sleepAvg || 0) / 10) * 100);
  const energyPct = clampPct(((fitness.recovery.energy || 0) / 10) * 100);
  const recoveryScore = clampPct((sleepPct + energyPct) / 2);
  const focusScore = clampPct(todayTasks.length === 0 ? 100 : Math.max(20, 100 - todayTasks.length * 18));
  const dayScore = clampPct((fitnessPct + recoveryScore + focusScore) / 3);
  const focusPreview = data.focus || "Define el foco central del dia";
  const topPriority = todayTasks[0]?.title || activeGoals[0]?.title || "Dia despejado";
  const lastSyncAt = getLastCalendarSyncAt();
  const primaryActions = quickActionModules.slice(0, 4);
  const secondaryModules = dashboardModules.filter((module) => !primaryActions.some((action) => action.id === module.id)).slice(0, 6);

  return (
    <div className="space-y-5 pb-4">
      <section className="overflow-hidden rounded-[28px] border border-borderc bg-surface p-5 shadow-md sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="eyebrow">{todayLabel}</p>
              <span className="rounded-full bg-surface2 px-2.5 py-1 text-[11px] font-medium text-texts">Centro operativo</span>
            </div>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-none text-textp sm:text-5xl">Cockpit del dia</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-texts">{focusPreview}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/tasks" className="btn-primary">Abrir foco</Link>
              <Link to="/calendar" className="btn-ghost">Agenda</Link>
              <Link to="/fitness" className="btn-ghost">Entreno</Link>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-[24px] bg-surface2 p-4 lg:w-72">
            <ScoreRing value={dayScore} label="dia" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-texts">Estado</p>
              <p className="mt-2 text-xl font-semibold leading-tight text-textp">{dayScore >= 70 ? "En control" : "Priorizar energia"}</p>
              <p className="mt-2 text-xs leading-5 text-texts">{todayTasks.length} focos · {todayEvents.length} eventos · {fitness.sessionsCompleted}/6 fitness</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
          <StatusMetric label="Foco" value={todayTasks.length} hint={topPriority} />
          <StatusMetric label="Agenda" value={todayEvents.length} hint={nextEvent?.title || "Libre"} />
          <StatusMetric label="Fitness" value={`${fitness.sessionsCompleted}/6`} hint={todaySession.name} />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-surface2 p-2 text-primary"><Target className="h-4 w-4" /></span>
            <span className="text-xs text-texts">{doneTasks} done</span>
          </div>
          <p className="text-xs font-medium text-texts">Prioridad</p>
          <p className="mt-2 text-lg font-semibold leading-snug text-textp">{topPriority}</p>
        </div>
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-surface2 p-2 text-primary"><CalendarDays className="h-4 w-4" /></span>
            <span className="text-xs text-texts">{compactTime(nextEvent?.start_time)}</span>
          </div>
          <p className="text-xs font-medium text-texts">Proximo bloque</p>
          <p className="mt-2 text-lg font-semibold leading-snug text-textp">{nextEvent?.title || "Sin eventos"}</p>
        </div>
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-surface2 p-2 text-primary"><Moon className="h-4 w-4" /></span>
            <span className="text-xs text-texts">{recoveryScore}%</span>
          </div>
          <p className="text-xs font-medium text-texts">Recovery</p>
          <p className="mt-2 text-lg font-semibold leading-snug text-textp">{recoveryScore >= 70 ? "Listo para empujar" : "Cuidar energia"}</p>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Link to="/fitness" className="card block transition active:scale-[0.99]">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Fitness</p>
              <h2 className="mt-2 text-2xl font-semibold leading-tight text-textp">{todaySession.name}</h2>
              <p className="mt-1 text-sm text-texts">{todaySession.focus}</p>
            </div>
            <span className="rounded-full bg-surface2 p-3 text-primary"><Dumbbell className="h-5 w-5" /></span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="metric-value">{fitness.sessionsCompleted}</p>
              <p className="mt-1 text-xs text-texts">sesiones</p>
            </div>
            <div>
              <p className="metric-value">{fitness.gymCompleted}</p>
              <p className="mt-1 text-xs text-texts">gym</p>
            </div>
            <div>
              <p className="metric-value">{fitness.homeCompleted}</p>
              <p className="mt-1 text-xs text-texts">home</p>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs text-texts">
              <span>Semana</span>
              <span>{fitness.sessionsCompleted}/6</span>
            </div>
            <ProgressLine value={fitnessPct} tone="accent" />
          </div>
        </Link>

        <Link to="/calendar" className="card block transition active:scale-[0.99]">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Calendario</p>
              <h2 className="mt-2 text-2xl font-semibold leading-tight text-textp">{todayEvents.length} hoy</h2>
              <p className="mt-1 text-sm text-texts">{nextWeekEvents.length} eventos en 7 dias</p>
            </div>
            <span className="rounded-full bg-surface2 p-3 text-primary"><CalendarDays className="h-5 w-5" /></span>
          </div>
          <div className="space-y-3">
            {(todayEvents.length ? todayEvents : nextEvent ? [nextEvent] : []).slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center gap-3 rounded-2xl bg-surface2 p-3">
                <span className="text-xs font-semibold text-primary">{compactTime(event.start_time)}</span>
                <p className="min-w-0 truncate text-sm font-medium text-textp">{event.title}</p>
              </div>
            ))}
            {!nextEvent && <p className="rounded-2xl bg-surface2 p-3 text-sm text-texts">Agenda libre.</p>}
          </div>
          <p className="mt-4 text-xs text-texts">Sync {lastSyncAt ? compactTime(lastSyncAt) : "pendiente"}</p>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Focus</p>
              <h2 className="mt-1 text-xl font-semibold text-textp">Prioridades</h2>
            </div>
            <button
              type="button"
              className="btn-ghost px-3 py-1.5 text-xs"
              onClick={() => {
                setFocusDraft(data.focus);
                setFocusOpen(true);
              }}
            >
              Editar
            </button>
          </div>
          <p className="text-sm leading-6 text-textp">{focusPreview}</p>
          <div className="mt-4 space-y-2">
            {todayTasks.slice(0, 3).map((task) => (
              <Link key={task.id} to="/tasks" className="flex items-center justify-between gap-3 rounded-2xl bg-surface2 p-3">
                <span className="min-w-0 truncate text-sm font-medium text-textp">{task.title}</span>
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              </Link>
            ))}
            {todayTasks.length === 0 && <p className="rounded-2xl bg-surface2 p-3 text-sm text-texts">Sin tareas fijadas para hoy.</p>}
          </div>
        </section>

        <section className="card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="eyebrow">Insights</p>
              <h2 className="mt-1 text-xl font-semibold text-textp">Pulso semanal</h2>
            </div>
            <Flame className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            <InsightRow label="Fitness" value={fitnessPct} tone="accent" />
            <InsightRow label="Recovery" value={recoveryScore} tone="primary" />
            <InsightRow label="Objetivos" value={Math.min(100, activeGoals.length * 20)} tone="warning" />
          </div>
        </section>
      </div>

      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="eyebrow">Acciones</p>
            <h2 className="mt-1 text-xl font-semibold text-textp">Movimiento rapido</h2>
          </div>
          <CheckCircle2 className="h-5 w-5 text-primary" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {primaryActions.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.id} to={module.path} className="rounded-2xl border border-borderc bg-white p-3 text-sm font-medium text-textp shadow-sm transition active:scale-[0.99]">
                <Icon className="mb-3 h-4 w-4 text-primary" />
                {module.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-textp">Sistema</h2>
          <Link to="/settings" className="flex items-center gap-1 text-xs font-medium text-primary">
            Mas <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {secondaryModules.map((module) => (
            <Link key={module.id} to={module.path} className="btn-ghost text-center">
              {module.label}
            </Link>
          ))}
        </div>
      </section>

      <Modal open={focusOpen}>
        <h3 className="mb-2 text-sm font-semibold">Editar foco del dia</h3>
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
