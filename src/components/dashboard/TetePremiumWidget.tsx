export function TetePremiumWidget({
  title,
  start,
  end,
}: {
  title: string;
  start: string;
  end: string;
}) {
  return (
    <section className="card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">Tete · premium</p>
        <span className="rounded-full border border-primary/35 bg-primary/10 px-2 py-0.5 text-[11px] text-primary">Bloque vinculado</span>
      </div>
      <h3 className="truncate text-lg font-semibold text-textp">{title}</h3>
      <p className="mt-1 text-xs text-texts">Sincronizado con calendario real de pareja.</p>
      <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
        <p className="rounded-xl border border-borderc bg-surface px-3 py-2 text-texts">
          Inicio: <span className="block text-sm font-medium text-textp">{start}</span>
        </p>
        <p className="rounded-xl border border-borderc bg-surface px-3 py-2 text-texts">
          Término: <span className="block text-sm font-medium text-textp">{end}</span>
        </p>
      </div>
    </section>
  );
}
