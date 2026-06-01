import { hashDataset, hashDayPayload } from "../../lib/calendarDomain/calendarDomainHash";
import type { CalendarDomainDay, CalendarDomainState } from "../../lib/calendarDomain/calendarDomainTypes";
import { safeJsonFetch } from "../sync/backgroundErrorHandling";

const PRIMARY_URL = "https://benjaminlarrondo.github.io/celeste_calendar/archivo_base.json";
const RAW_MAIN_URL = "https://raw.githubusercontent.com/benjaminlarrondo/celeste_calendar/main/archivo_base.json";
const RAW_MASTER_URL = "https://raw.githubusercontent.com/benjaminlarrondo/celeste_calendar/master/archivo_base.json";

type CelesteRawDay = {
  owner?: unknown;
  note?: unknown;
  exception?: unknown;
};

type CelesteRawState = {
  year?: unknown;
  days?: Record<string, CelesteRawDay>;
};

export type CelesteSnapshot = {
  fetchedAt: string;
  sourceUrl: string;
  sourceKind: CalendarDomainState["syncMeta"]["sourceKind"];
  datasetHash: string;
  days: CalendarDomainDay[];
};

function isDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toOwner(value: unknown): CalendarDomainDay["owner"] {
  if (value === "mine" || value === "hers" || value === "neutral") return value;
  return "neutral";
}

function normalizeDays(raw: CelesteRawState["days"], fetchedAt: string): CalendarDomainDay[] {
  if (!raw || typeof raw !== "object") return [];
  const out: CalendarDomainDay[] = [];
  for (const [date, day] of Object.entries(raw)) {
    if (!isDateKey(date)) continue;
    const owner = toOwner(day?.owner);
    const note = typeof day?.note === "string" ? day.note : "";
    const exception = typeof day?.exception === "boolean" ? day.exception : false;
    const hash = hashDayPayload({ date, owner, note, exception });
    out.push({
      date,
      owner,
      note,
      exception,
      source: "celeste_calendar",
      sourceId: date,
      hash,
      fetchedAt,
    });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchFrom(url: string) {
  return safeJsonFetch<CelesteRawState>(`${url}?t=${Date.now()}`, { cache: "no-store" });
}

export async function fetchCelesteSnapshot(): Promise<CelesteSnapshot> {
  const fetchedAt = new Date().toISOString();
  const candidates: Array<{ url: string; kind: CelesteSnapshot["sourceKind"] }> = [
    { url: PRIMARY_URL, kind: "gh_pages" },
    { url: RAW_MAIN_URL, kind: "raw_main" },
    { url: RAW_MASTER_URL, kind: "raw_master" },
  ];

  for (const candidate of candidates) {
    const payload = await fetchFrom(candidate.url);
    if (!payload?.days || typeof payload.days !== "object") continue;
    const days = normalizeDays(payload.days, fetchedAt);
    if (!days.length) continue;
    return {
      fetchedAt,
      sourceUrl: candidate.url,
      sourceKind: candidate.kind,
      datasetHash: hashDataset(days),
      days,
    };
  }

  throw new Error("No se pudo leer celeste_calendar desde fuentes públicas.");
}

