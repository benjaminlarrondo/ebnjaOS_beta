import { supabase } from "../lib/supabase";
import { getSingleUserId } from "../lib/supabaseSync";
import { setSaving, setSyncError } from "../lib/syncStatus";
import type { CalendarEvent } from "../types/calendar";

const REPO = "benjaminlarrondo/celeste_calendar";
const BASE_JSON_URL = `https://raw.githubusercontent.com/${REPO}/main/archivo_base.json`;
const LOCAL_SYNC_KEY = "ebnjaos-calendar-last-sync";

type CelesteEntry = {
  owner: string;
  exception?: boolean;
  note?: string;
};

type CelesteFile = {
  year?: number;
  days?: Record<string, CelesteEntry>;
};

export type CalendarSyncResult = {
  inserted: number;
  updated: number;
  unchanged: number;
  errors: number;
  lastSyncAt: string;
};

function toIsoDayStart(day: string) {
  return `${day}T09:00:00.000Z`;
}

function toIsoDayEnd(day: string) {
  return `${day}T10:00:00.000Z`;
}

function hashEntry(day: string, entry: CelesteEntry) {
  return JSON.stringify({ day, owner: entry.owner, note: entry.note || "", exception: !!entry.exception });
}

function buildEvent(day: string, entry: CelesteEntry): Omit<CalendarEvent, "id" | "created_at" | "updated_at"> {
  const isMine = entry.owner === "mine";
  const isHers = entry.owner === "hers";
  const title = isMine ? "Entrega (celeste)" : isHers ? "Bloque celeste" : "Evento celeste";
  const hash = hashEntry(day, entry);

  return {
    user_id: getSingleUserId(),
    title,
    description: entry.note || (isMine ? "Turno propio" : "Turno externo"),
    start_time: toIsoDayStart(day),
    end_time: toIsoDayEnd(day),
    location: "",
    source: "github",
    source_id: day,
    source_repo: REPO,
    source_url: BASE_JSON_URL,
    external_updated_at: new Date().toISOString(),
    sync_status: "synced",
    event_type: isMine ? "delivery" : "event",
    metadata: { owner: entry.owner, exception: !!entry.exception, note: entry.note || "", _hash: hash },
  };
}

export function getLastCalendarSyncAt() {
  return localStorage.getItem(LOCAL_SYNC_KEY);
}

export async function syncCelesteCalendar(): Promise<CalendarSyncResult> {
  const userId = getSingleUserId();
  let inserted = 0;
  let updated = 0;
  let unchanged = 0;
  let errors = 0;

  setSaving(true);
  setSyncError(null);

  try {
    const fileRes = await fetch(BASE_JSON_URL, { cache: "no-store" });
    if (!fileRes.ok) throw new Error(`No se pudo leer archivo_base.json (${fileRes.status})`);
    const file = (await fileRes.json()) as CelesteFile;
    const days = file.days || {};

    const { data: existing, error: existingErr } = await supabase
      .from("calendar_events")
      .select("id, source_id, metadata")
      .eq("user_id", userId)
      .eq("source", "github")
      .eq("source_repo", REPO);

    if (existingErr) {
      const msg = existingErr.message.includes("column")
        ? "Faltan campos externos en calendar_events. Ejecuta supabase/calendar_external_fields.sql"
        : existingErr.message;
      throw new Error(msg);
    }

    const bySourceId = new Map((existing || []).map((row) => [row.source_id as string, row]));

    for (const [day, entry] of Object.entries(days)) {
      const payload = buildEvent(day, entry);
      const prev = bySourceId.get(day);

      if (!prev) {
        const { error } = await supabase.from("calendar_events").insert(payload as never);
        if (error) {
          errors += 1;
          continue;
        }
        inserted += 1;
        continue;
      }

      const prevHash = String((prev.metadata as Record<string, unknown> | null)?._hash || "");
      const nextHash = String(payload.metadata?._hash || "");
      if (prevHash === nextHash) {
        unchanged += 1;
        continue;
      }

      const { error } = await supabase
        .from("calendar_events")
        .update({
          ...payload,
          external_updated_at: new Date().toISOString(),
          sync_status: "changed",
        } as never)
        .eq("id", prev.id)
        .eq("user_id", userId);

      if (error) {
        errors += 1;
        continue;
      }
      updated += 1;
    }

    const lastSyncAt = new Date().toISOString();
    localStorage.setItem(LOCAL_SYNC_KEY, lastSyncAt);

    return { inserted, updated, unchanged, errors, lastSyncAt };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    setSyncError(message);
    throw new Error(message, { cause: error });
  } finally {
    setSaving(false);
  }
}
