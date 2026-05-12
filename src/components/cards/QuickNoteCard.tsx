import type { Note } from "../../types/note";
export function QuickNoteCard({ note }: { note?: Note }) {
  return <div className="rounded-xl border border-borderc p-3"><p className="text-sm font-medium">Nota rapida</p><p className="mt-1 text-sm text-texts">{note?.content || "Guarda tu primera nota"}</p></div>;
}
