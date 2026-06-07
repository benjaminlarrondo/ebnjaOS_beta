import type { CalendarEvent } from "../../types/calendar";
import type { CalendarDomainDay } from "../../lib/calendarDomain/calendarDomainTypes";

type DayCell = {
  date: Date;
  inMonth: boolean;
  key: string;
  events: CalendarEvent[];
};

const DOW = ["L", "M", "X", "J", "V", "S", "D"];

function toLocalDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

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
    const key = toLocalDateKey(d);
    cells.push({ date: d, inMonth: false, key, events: [] });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const d = new Date(year, month, day);
    const key = toLocalDateKey(d);
    const dayEvents = events.filter((e) => toLocalDateKey(new Date(e.start_time)) === key);
    cells.push({ date: d, inMonth: true, key, events: dayEvents });
  }

  while (cells.length % 7 !== 0) {
    const d = new Date(year, month + 1, cells.length % 7);
    const key = toLocalDateKey(d);
    cells.push({ date: d, inMonth: false, key, events: [] });
  }

  return cells;
}

export function CalendarMonthGrid({
  month,
  events,
  onDaySelect,
  selectedDay,
  ownershipByDate,
}: {
  month: Date;
  events: CalendarEvent[];
  onDaySelect?: (dayIso: string) => void;
  selectedDay?: string | null;
  ownershipByDate?: Record<string, CalendarDomainDay>;
}) {
  const cells = getMonthMatrix(month, events);
  const todayKey = toLocalDateKey(new Date());

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
        {cells.map((cell) => {
          const celesteDay = ownershipByDate?.[cell.key];
          const isMineDay = celesteDay?.owner === "mine";
          const isTeteDay = celesteDay?.owner === "hers";
          const dotColor = isMineDay ? "#F87171" : isTeteDay ? "rgba(139,145,155,.95)" : "";

          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => {
                onDaySelect?.(cell.key);
              }}
              className={`min-h-[62px] rounded-xl border p-1.5 text-left transition ${
                cell.inMonth ? "" : "opacity-45"
              } ${
                cell.key === todayKey ? "border-primary ring-1 ring-primary/60" : "border-borderc"
              } ${
                cell.events.length > 0 ? "border-l-4 border-l-primary" : ""
              } ${
                selectedDay === cell.key ? "bg-surface2 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]" : ""
              }`}
              title={isMineDay ? "Con Tete" : isTeteDay ? "Charo" : undefined}
            >
              <p className="flex items-center gap-1 text-[11px] font-medium text-textp">
                {cell.date.getDate()}
                {dotColor && <span className="h-1.5 w-1.5 rounded-full" style={{ background: dotColor }} />}
              </p>
              {cell.events.length > 0 && <p className="mt-1 text-[10px] text-texts">{cell.events.length} ev.</p>}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-texts">
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#F87171" }} title="Con Tete" />
          Tete
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(139,145,155,.95)" }} />
          Charo
        </span>
      </div>
    </section>
  );
}
