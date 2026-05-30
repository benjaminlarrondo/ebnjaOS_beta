import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

type ActionItem = {
  id: string;
  label: string;
  run: () => void;
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const actions = useMemo<ActionItem[]>(
    () => [
      { id: "new-task", label: "Nueva tarea", run: () => window.dispatchEvent(new CustomEvent("ebnja:quick-capture-open", { detail: { type: "task" } })) },
      { id: "new-event", label: "Nuevo evento", run: () => window.dispatchEvent(new CustomEvent("ebnja:quick-capture-open", { detail: { type: "event" } })) },
      { id: "new-note", label: "Nueva nota", run: () => window.dispatchEvent(new CustomEvent("ebnja:quick-capture-open", { detail: { type: "note" } })) },
      { id: "new-fitness", label: "Registrar fitness", run: () => window.dispatchEvent(new CustomEvent("ebnja:quick-capture-open", { detail: { type: "fitness" } })) },
      { id: "search", label: "Buscar", run: () => navigate("/search") },
    ],
    [navigate],
  );

  useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeydown);
    const onOpen = () => setOpen(true);
    window.addEventListener("ebnja:open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKeydown);
      window.removeEventListener("ebnja:open-command-palette", onOpen);
    };
  }, []);

  const filtered = query.trim()
    ? actions.filter((action) => action.label.toLowerCase().includes(query.trim().toLowerCase()))
    : actions;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/55 p-4" onClick={() => setOpen(false)}>
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-borderc bg-surface p-3" onClick={(event) => event.stopPropagation()}>
        <div className="mb-2 flex items-center gap-2 rounded-xl border border-borderc px-3 py-2">
          <Search className="h-4 w-4 text-texts" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Comando..."
            className="w-full bg-transparent text-sm text-textp outline-none placeholder:text-textm"
          />
          <span className="text-[11px] text-textm">Esc</span>
        </div>
        <div className="space-y-1">
          {filtered.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => {
                action.run();
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-xl border border-transparent px-3 py-2 text-left text-sm text-textp transition hover:border-primary/20 hover:bg-primary/10 hover:text-primary"
            >
              <span>{action.label}</span>
              <span className="text-[11px] text-textm">↵</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
