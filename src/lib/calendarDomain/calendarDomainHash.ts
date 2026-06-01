import type { CalendarDomainDay } from "./calendarDomainTypes";

function stableStringify(input: unknown): string {
  if (Array.isArray(input)) {
    return `[${input.map((item) => stableStringify(item)).join(",")}]`;
  }
  if (input && typeof input === "object") {
    const objectValue = input as Record<string, unknown>;
    const keys = Object.keys(objectValue).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(objectValue[key])}`).join(",")}}`;
  }
  return JSON.stringify(input);
}

export function hashDayPayload(input: {
  date: string;
  owner: CalendarDomainDay["owner"];
  note: string;
  exception: boolean;
}) {
  return stableStringify(input);
}

export function hashDataset(days: CalendarDomainDay[]) {
  const normalized = [...days]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((day) => ({ date: day.date, hash: day.hash }));
  return stableStringify(normalized);
}

