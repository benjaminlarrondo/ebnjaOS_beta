import { useState } from "react";
import { PageTitle } from "../../components/layout/PageTitle";
import { CrudList } from "../shared";
import { db } from "../../lib/store";

const categories = ["todos", "trabajo", "arquitectura", "productividad", "fitness", "música", "estudio", "codex", "personal"];

export default function PromptsPage() {
  const [category, setCategory] = useState("todos");
  const [, setTick] = useState(0);
  const prompts = db.list("prompts");
  const filtered = prompts.filter((p) => category === "todos" || p.category === category);

  return (
    <div className="space-y-4">
      <PageTitle title="Prompts" subtitle="Biblioteca reusable" />
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`rounded-full border px-3 py-1 text-xs ${category === c ? "border-primary bg-[#eef1f6] text-primary" : "border-borderc text-texts"}`}>{c}</button>
        ))}
      </div>

      <section className="space-y-2">
        {filtered.map((prompt) => (
          <div key={prompt.id} className="card">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{prompt.title}</p>
                <p className="text-xs text-texts">{prompt.category}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-ghost" onClick={async () => { await navigator.clipboard.writeText(prompt.content); }}>Copiar</button>
                <button className="btn-ghost" onClick={() => { db.update("prompts", prompt.id, { favorite: !prompt.favorite }); setTick((x) => x + 1); }}>{prompt.favorite ? "Favorito" : "Fav"}</button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <CrudList title="prompts" keyName="prompts" fields="prompt" />
    </div>
  );
}
