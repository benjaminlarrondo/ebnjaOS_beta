export type CelesteOwner = "mine" | "hers" | "neutral";

export type CelesteDay = {
  owner: CelesteOwner;
  exception?: boolean;
  note?: string;
};

export type CelesteCalendarState = {
  year: number;
  days: Record<string, CelesteDay>;
};

function toOwner(value: unknown): CelesteOwner {
  if (value === "mine" || value === "hers" || value === "neutral") return value;
  return "neutral";
}

export function normalizeCelesteState(input: unknown): CelesteCalendarState | null {
  if (!input || typeof input !== "object") return null;
  const source = input as { year?: unknown; days?: unknown };
  if (!source.days || typeof source.days !== "object") return null;

  const days: Record<string, CelesteDay> = {};
  for (const [key, value] of Object.entries(source.days as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) continue;
    if (!value || typeof value !== "object") continue;
    const entry = value as { owner?: unknown; exception?: unknown; note?: unknown };
    days[key] = {
      owner: toOwner(entry.owner),
      exception: typeof entry.exception === "boolean" ? entry.exception : false,
      note: typeof entry.note === "string" ? entry.note : "",
    };
  }

  const inferredYear = Number(Object.keys(days)[0]?.slice(0, 4));
  const year = typeof source.year === "number" ? source.year : (Number.isFinite(inferredYear) ? inferredYear : new Date().getFullYear());
  return { year, days };
}

export function getCelesteDay(dateIso: string, state?: CelesteCalendarState): CelesteDay | null {
  if (!state) return null;
  return state.days[dateIso] ?? null;
}

export function isSofiaDay(dateIso: string, state?: CelesteCalendarState): boolean {
  const day = getCelesteDay(dateIso, state);
  return day?.owner === "hers";
}
