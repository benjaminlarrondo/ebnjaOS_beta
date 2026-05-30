export function CalendarViewToggle({ view, onChange }: { view: "month" | "week" | "list"; onChange: (view: "month" | "week" | "list") => void }) {
  const options: Array<["month" | "week" | "list", string]> = [
    ["month", "Mes"],
    ["week", "Semana"],
    ["list", "Lista"],
  ];

  return (
    <div className="flex rounded-2xl border border-borderc bg-surface p-1">
      {options.map(([key, label]) => (
        <button key={key} onClick={() => onChange(key)} className={`rounded-xl border px-3 py-1.5 text-xs transition ${view === key ? "border-primary/35 bg-primary/15 text-primary" : "border-transparent text-texts"}`}>
          {label}
        </button>
      ))}
    </div>
  );
}
