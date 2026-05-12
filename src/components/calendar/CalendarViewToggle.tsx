export function CalendarViewToggle({ view, onChange }: { view: "month" | "week" | "list"; onChange: (view: "month" | "week" | "list") => void }) {
  const options: Array<["month" | "week" | "list", string]> = [
    ["month", "Mes"],
    ["week", "Semana"],
    ["list", "Lista"],
  ];

  return (
    <div className="flex gap-2">
      {options.map(([key, label]) => (
        <button key={key} onClick={() => onChange(key)} className={`rounded-full border px-3 py-1 text-xs ${view === key ? "border-primary bg-[#eef1f6] text-primary" : "border-borderc text-texts"}`}>
          {label}
        </button>
      ))}
    </div>
  );
}
