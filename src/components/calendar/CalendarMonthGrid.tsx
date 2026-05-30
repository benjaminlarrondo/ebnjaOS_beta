import type { CalendarEvent } from "../../types/calendar";
import { isSofiaDay, type CelesteCalendarState } from "../../lib/celesteCalendar";

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

export function CalendarMonthGrid({
  month,
  events,
  onDaySelect,
  selectedDay,
  celesteState,
}: {
  month: Date;
  events: CalendarEvent[];
  onDaySelect?: (dayIso: string) => void;
  selectedDay?: string | null;
  celesteState?: CelesteCalendarState;
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
            onClick={() => {
              onDaySelect?.(cell.key);
            }}
            className={`min-h-[62px] rounded-xl border bg-surface p-1.5 text-left transition ${
              cell.inMonth ? "" : "opacity-45"
            } ${
              cell.key === todayKey ? "border-primary ring-1 ring-primary/40" : "border-borderc"
            } ${
              cell.events.length > 0 ? "border-l-4 border-l-primary" : ""
            } ${
              selectedDay === cell.key ? "bg-[#151920]" : ""
            }`}
          >
            <p className="text-[11px] font-medium text-textp">{cell.date.getDate()}</p>
            {isSofiaDay(cell.key, celesteState) && (
              <span
                aria-label="Tete"
                title="Con Tete"
                className="mx-auto mt-1 block h-[6px] w-[6px] rounded-[999px]"
                style={{ background: "#F87171" }}
              />
            )}
            {cell.events.length > 0 && <p className="mt-1 text-[10px] text-texts">{cell.events.length} ev.</p>}
          </button>
        ))}
      </div>
      <div className="mt-3 text-xs text-texts">
        <span style={{ color: "#F87171" }}>●</span> Tete
      </div>
    </section>
  );
}
