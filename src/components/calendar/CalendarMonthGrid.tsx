import type { CalendarEvent } from "../../types/calendar";

type DayCell = {
  date: Date;
  inMonth: boolean;
  key: string;
  events: CalendarEvent[];
};

const DOW = ["L", "M", "X", "J", "V", "S", "D"];

function getMonthMatrix(base: Date, events: CalendarEvent[]) {
  const year = base.getFullYear();
  const month = base.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = last.getDate();

  const cells: DayCell[] = [];

  for (let i = 0; i < startOffset; i += 1) {
    const d = new Date(year, month, i - startOffset + 1);
    const key = d.toISOString().slice(0, 10);
    cells.push({ date: d, inMonth: false, key, events: [] });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const d = new Date(year, month, day);
    const key = d.toISOString().slice(0, 10);
    const dayEvents = events.filter((e) => new Date(e.start_time).toISOString().slice(0, 10) === key);
    cells.push({ date: d, inMonth: true, key, events: dayEvents });
  }

  while (cells.length % 7 !== 0) {
    const d = new Date(year, month + 1, cells.length % 7);
    const key = d.toISOString().slice(0, 10);
    cells.push({ date: d, inMonth: false, key, events: [] });
  }

  return cells;
}

function dayBg(events: CalendarEvent[]) {
  if (!events.length) return "bg-white";

  const github = events.find((e) => e.source === "github");
  if (!github) return "bg-[#f2f4f7]";

  const owner = String(github.metadata?.owner || "").toLowerCase();
  const exception = Boolean(github.metadata?.exception);

  if (exception) return "bg-[#b7a3e8]/35";
  if (owner === "mine") return "bg-[#f7d7dc]/55";
  if (owner === "hers") return "bg-[#f8efc6]/55";
  return "bg-[#f2f4f7]";
}

export function CalendarMonthGrid({
  month,
  events,
  onDaySelect,
}: {
  month: Date;
  events: CalendarEvent[];
  onDaySelect?: (dayIso: string) => void;
}) {
  const cells = getMonthMatrix(month, events);
  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <section className="card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{month.toLocaleDateString("es-CL", { month: "long", year: "numeric" })}</h3>
        <p className="text-xs text-texts">Vista mensual</p>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {DOW.map((d) => (
          <div key={d} className="text-center text-[11px] text-texts">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => (
          <button
            key={cell.key}
            type="button"
            onClick={() => onDaySelect?.(cell.key)}
            className={`min-h-[54px] rounded-lg border p-1.5 text-left ${dayBg(cell.events)} ${cell.inMonth ? "" : "opacity-45"} ${cell.key === todayKey ? "border-black shadow-[0_0_0_1px_rgba(0,0,0,0.35)]" : "border-borderc"}`}
          >
            <p className="text-[11px] font-medium">{cell.date.getDate()}</p>
            {cell.events.length > 0 && (
              <p className="mt-1 text-[10px] text-texts">{cell.events.length} evento{cell.events.length > 1 ? "s" : ""}</p>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
