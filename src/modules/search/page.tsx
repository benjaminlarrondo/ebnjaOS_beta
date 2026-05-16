import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageTitle } from "../../components/layout/PageTitle";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { db } from "../../lib/store";

type SearchType = "all" | "tasks" | "notes" | "events" | "projects" | "resources" | "prompts";

type SearchItem = {
  id: string;
  type: Exclude<SearchType, "all">;
  title: string;
  body: string;
  date: string;
  to: string;
};

function toSearchIndex(): SearchItem[] {
  const data = db.load();
  const items: SearchItem[] = [];

  for (const t of data.tasks) {
    items.push({
      id: t.id,
      type: "tasks",
      title: t.title,
      body: `${t.description || ""} ${t.status} ${t.priority} ${(t.tags || []).join(" ")}`.trim(),
      date: t.updated_at || t.created_at,
      to: "/tasks",
    });
  }

  for (const n of data.notes) {
    items.push({
      id: n.id,
      type: "notes",
      title: n.title,
      body: `${n.content || ""} ${(n.tags || []).join(" ")} ${n.type}`.trim(),
      date: n.updated_at || n.created_at,
      to: "/notes",
    });
  }

  for (const e of data.events) {
    items.push({
      id: e.id,
      type: "events",
      title: e.title,
      body: `${e.description || ""} ${e.source} ${e.event_type || ""}`.trim(),
      date: e.start_time || e.updated_at || e.created_at,
      to: "/calendar",
    });
  }

  for (const p of data.projects) {
    items.push({
      id: p.id,
      type: "projects",
      title: p.title,
      body: `${p.description || ""} ${p.status} ${p.priority} ${(p.tags || []).join(" ")}`.trim(),
      date: p.updated_at || p.created_at,
      to: "/projects",
    });
  }

  for (const r of data.resources) {
    items.push({
      id: r.id,
      type: "resources",
      title: r.title,
      body: `${r.description || ""} ${r.type} ${(r.tags || []).join(" ")} ${r.url || ""}`.trim(),
      date: r.updated_at || r.created_at,
      to: "/resources",
    });
  }

  for (const p of data.prompts) {
    items.push({
      id: p.id,
      type: "prompts",
      title: p.title,
      body: `${p.description || ""} ${p.content || ""} ${(p.tags || []).join(" ")}`.trim(),
      date: p.updated_at || p.created_at,
      to: "/prompts",
    });
  }

  return items.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<SearchType>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const index = useMemo(() => toSearchIndex(), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59`) : null;

    return index.filter((item) => {
      if (type !== "all" && item.type !== type) return false;
      const d = new Date(item.date);
      if (from && d < from) return false;
      if (to && d > to) return false;
      if (!q) return true;
      const hay = `${item.title} ${item.body}`.toLowerCase();
      return hay.includes(q);
    });
  }, [index, query, type, fromDate, toDate]);

  return (
    <div className="space-y-4">
      <PageTitle title="Search" subtitle="Búsqueda global de conocimiento" />

      <section className="card space-y-2">
        <Input
          placeholder="Buscar por texto, idea, proyecto, evento..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="grid gap-2 sm:grid-cols-3">
          <Select value={type} onChange={(e) => setType(e.target.value as SearchType)}>
            <option value="all">Todos</option>
            <option value="tasks">Tasks</option>
            <option value="notes">Notes</option>
            <option value="events">Calendar</option>
            <option value="projects">Projects</option>
            <option value="resources">Resources</option>
            <option value="prompts">Prompts</option>
          </Select>
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <p className="text-xs text-texts">{results.length} resultados</p>
      </section>

      <section className="card space-y-2">
        {results.length === 0 && <p className="text-sm text-texts">Sin resultados para ese filtro.</p>}
        {results.map((item) => (
          <article key={`${item.type}-${item.id}`} className="rounded-xl border border-borderc p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-texts">{item.body || "Sin detalle"}</p>
                <p className="mt-1 text-xs text-texts">
                  {item.type} · {new Date(item.date).toLocaleString("es-CL")}
                </p>
              </div>
              <Link to={item.to} className="btn-ghost">Abrir</Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
