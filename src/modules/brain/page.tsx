import { useMemo, useState } from "react";
import { Search, Sparkles, StickyNote, FolderKanban, Target, CircleCheckBig } from "lucide-react";
import { PageTitle } from "../../components/layout/PageTitle";
import { db } from "../../lib/store";
import { listGoals } from "../../lib/goals";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";

function matchesBrainSignal(text: string, signals: string[]) {
  const lower = text.toLowerCase();
  return signals.some((signal) => lower.includes(signal));
}

export default function BrainPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");
  const [, setTick] = useState(0);

  const notes = db.list("notes");
  const projects = db.load().projects;
  const goals = listGoals();

  const ideas = useMemo(
    () => notes.filter((note) => matchesBrainSignal(`${note.title} ${note.content}`, ["idea", "idea:", "brain"])).slice(0, 6),
    [notes],
  );
  const decisions = useMemo(
    () => notes.filter((note) => matchesBrainSignal(`${note.title} ${note.content}`, ["decisión", "decision", "decide"])).slice(0, 6),
    [notes],
  );

  const createBrainNote = () => {
    if (!title.trim() && !content.trim()) {
      setStatus("Escribe un título o contenido para guardar.");
      return;
    }
    db.create("notes", {
      title: title.trim() || content.trim().slice(0, 60),
      content: content.trim() || title.trim(),
      type: "quick",
      tags: ["brain"],
      pinned: false,
    });
    setTitle("");
    setContent("");
    setStatus("Captura guardada.");
    setTick((value) => value + 1);
  };

  return (
    <div className="page-shell space-y-4">
      <PageTitle title="Brain" subtitle="Notas, ideas, decisiones, objetivos y proyectos." />

      <section className="card space-y-3">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl border border-borderc bg-surface2 p-3 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="eyebrow">Captura rápida</p>
            <h3 className="text-base font-semibold text-textp">Nueva idea o nota</h3>
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <Input placeholder="Título" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Textarea placeholder="Idea, decisión o referencia rápida" value={content} onChange={(event) => setContent(event.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={createBrainNote}>Guardar</Button>
          {status && <p className="text-xs text-texts">{status}</p>}
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="card space-y-3">
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Ideas</h3>
          </div>
          {ideas.length === 0 ? (
            <p className="text-sm text-texts">Sin ideas capturadas aún.</p>
          ) : (
            ideas.map((note) => (
              <article key={note.id} className="rounded-xl border border-borderc bg-surface2 p-3">
                <p className="text-sm font-medium text-textp">{note.title}</p>
                <p className="mt-1 text-xs text-texts">{note.content}</p>
              </article>
            ))
          )}
        </section>

        <section className="card space-y-3">
          <div className="flex items-center gap-2">
            <CircleCheckBig className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Decisiones</h3>
          </div>
          {decisions.length === 0 ? (
            <p className="text-sm text-texts">Sin decisiones registradas.</p>
          ) : (
            decisions.map((note) => (
              <article key={note.id} className="rounded-xl border border-borderc bg-surface2 p-3">
                <p className="text-sm font-medium text-textp">{note.title}</p>
                <p className="mt-1 text-xs text-texts">{note.content}</p>
              </article>
            ))
          )}
        </section>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <section className="card space-y-3">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Proyectos</h3>
          </div>
          {projects.length === 0 ? (
            <p className="text-sm text-texts">No hay proyectos aún.</p>
          ) : (
            projects.slice(0, 6).map((project) => (
              <article key={project.id} className="rounded-xl border border-borderc bg-surface2 p-3">
                <p className="text-sm font-medium text-textp">{project.title}</p>
                <p className="mt-1 text-xs text-texts">{project.description || "Sin descripción"}</p>
              </article>
            ))
          )}
        </section>

        <section className="card space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Goals</h3>
          </div>
          {goals.length === 0 ? (
            <p className="text-sm text-texts">Sin objetivos activos.</p>
          ) : (
            goals.slice(0, 6).map((goal) => (
              <article key={goal.id} className="rounded-xl border border-borderc bg-surface2 p-3">
                <p className="text-sm font-medium text-textp">{goal.title}</p>
                <p className="mt-1 text-xs text-texts">{goal.area} · {goal.progress}/{goal.target}</p>
              </article>
            ))
          )}
        </section>

        <section className="card space-y-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Notas rápidas</h3>
          </div>
          {notes.length === 0 ? (
            <p className="text-sm text-texts">Sin notas todavía.</p>
          ) : (
            notes.slice(0, 6).map((note) => (
              <article key={note.id} className="rounded-xl border border-borderc bg-surface2 p-3">
                <p className="text-sm font-medium text-textp">{note.title}</p>
                <p className="mt-1 text-xs text-texts">{note.content}</p>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

