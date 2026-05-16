import { useMemo, useState } from "react";
import { PageTitle } from "../../components/layout/PageTitle";
import { db } from "../../lib/store";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { parseWikiRefs, textIncludesRef } from "../../lib/linking";

export default function NotesPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");
  const [, setTick] = useState(0);

  const notes = db.list("notes");
  const tasks = db.list("tasks");
  const events = db.list("events");

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => +new Date(b.updated_at || b.created_at) - +new Date(a.updated_at || a.created_at)),
    [notes],
  );

  const createNote = () => {
    if (!title.trim() && !content.trim()) {
      setStatus("Escribe al menos un título o contenido.");
      return;
    }
    const finalTitle = title.trim() || content.trim().slice(0, 60);
    db.create("notes", {
      title: finalTitle,
      content: content.trim() || finalTitle,
      type: "quick",
      tags: [],
      pinned: false,
    });
    setTitle("");
    setContent("");
    setStatus("Nota creada.");
    setTick((x) => x + 1);
  };

  const removeNote = (id: string) => {
    db.remove("notes", id);
    setTick((x) => x + 1);
  };

  return (
    <div className="space-y-4">
      <PageTitle title="Notes" subtitle="Notas enlazadas con referencias [[...]]" />

      <section className="card space-y-2">
        <h3 className="text-sm font-semibold">Nueva nota</h3>
        <Input placeholder="Título (opcional)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea
          placeholder="Escribe tu nota. Usa [[texto]] para crear referencias."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button type="button" onClick={createNote}>Guardar nota</Button>
        {status && <p className="text-xs text-texts">{status}</p>}
      </section>

      <section className="card space-y-3">
        <h3 className="text-sm font-semibold">Base de notas</h3>
        {sortedNotes.length === 0 && <p className="text-sm text-texts">No hay notas aún.</p>}

        {sortedNotes.map((note) => {
          const refs = parseWikiRefs(`${note.title}\n${note.content}`);
          const relatedTasks = tasks.filter((t) => refs.some((r) => textIncludesRef(`${t.title} ${t.description || ""}`, r))).slice(0, 4);
          const relatedEvents = events.filter((e) => refs.some((r) => textIncludesRef(`${e.title} ${e.description || ""}`, r))).slice(0, 4);
          const relatedNotes = notes
            .filter((n) => n.id !== note.id && refs.some((r) => textIncludesRef(`${n.title} ${n.content || ""}`, r)))
            .slice(0, 4);
          const backlinks = notes
            .filter((n) => n.id !== note.id)
            .filter((n) => parseWikiRefs(`${n.title}\n${n.content}`).some((r) => textIncludesRef(note.title, r)))
            .slice(0, 4);

          return (
            <article key={note.id} className="rounded-xl border border-borderc p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{note.title}</p>
                  <p className="mt-1 whitespace-pre-wrap text-xs text-texts">{note.content}</p>
                </div>
                <button className="btn-ghost" onClick={() => removeNote(note.id)}>Eliminar</button>
              </div>

              {refs.length > 0 && (
                <p className="mt-2 text-xs text-texts">
                  Referencias: {refs.map((r) => `[[${r}]]`).join(", ")}
                </p>
              )}

              <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                <div className="rounded-lg border border-borderc p-2">
                  <p className="font-medium">Backlinks</p>
                  {backlinks.length === 0 ? (
                    <p className="text-texts">Sin backlinks</p>
                  ) : (
                    backlinks.map((n) => <p key={n.id} className="text-texts">• {n.title}</p>)
                  )}
                </div>
                <div className="rounded-lg border border-borderc p-2">
                  <p className="font-medium">Relacionados</p>
                  {relatedNotes.length === 0 && relatedTasks.length === 0 && relatedEvents.length === 0 ? (
                    <p className="text-texts">Sin relacionados</p>
                  ) : (
                    <>
                      {relatedNotes.map((n) => <p key={`n-${n.id}`} className="text-texts">• Nota: {n.title}</p>)}
                      {relatedTasks.map((t) => <p key={`t-${t.id}`} className="text-texts">• Task: {t.title}</p>)}
                      {relatedEvents.map((e) => <p key={`e-${e.id}`} className="text-texts">• Evento: {e.title}</p>)}
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
