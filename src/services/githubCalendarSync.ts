import { supabase } from "../lib/supabase";
import { getSingleUserId } from "../lib/supabaseSync";
import { setConnected, setSaving, setSyncError } from "../lib/syncStatus";
import type { CalendarEvent } from "../types/calendar";

const REPO = "benjaminlarrondo/celeste_calendar";
const LOCAL_SYNC_KEY = "ebnjaos-calendar-last-sync";
const GITHUB_API_REPO = `https://api.github.com/repos/${REPO}`;
const GH_PAGES_BASE = "https://benjaminlarrondo.github.io/celeste_calendar";

type CelesteEntry = {
  owner: string;
  exception?: boolean;
  note?: string;
};

type CelesteFile = {
  year?: number;
  days?: Record<string, CelesteEntry>;
};

type GitHubContentResponse = {
  sha?: string;
  content?: string;
  encoding?: string;
};

type GitHubTreeResponse = {
  tree?: Array<{ path: string; type: string }>;
};

type GitHubContentListItem = {
  name: string;
  path: string;
  type: string;
  download_url?: string | null;
};

export type CalendarSyncResult = {
  inserted: number;
  updated: number;
  unchanged: number;
  errors: number;
  lastSyncAt: string;
  sourcePath: string;
  detectedDate: string | null;
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

function buildEvent(day: string, entry: CelesteEntry, sourceUrl: string): Omit<CalendarEvent, "id" | "created_at" | "updated_at"> {
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
    source_url: sourceUrl,
    external_updated_at: new Date().toISOString(),
    sync_status: "synced",
    event_type: isMine ? "delivery" : "event",
    metadata: { owner: entry.owner, exception: !!entry.exception, note: entry.note || "", _hash: hash },
  };
}

function decodeBase64Utf8(input: string) {
  const cleaned = input.replace(/\n/g, "");
  return atob(cleaned);
}

async function getDefaultBranch() {
  try {
    const res = await fetch(`${GITHUB_API_REPO}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return "main";
    const json = (await res.json()) as { default_branch?: string };
    return json.default_branch || "main";
  } catch {
    return "main";
  }
}

async function fetchFromContentsApi(branch: string) {
  const url = `${GITHUB_API_REPO}/contents/archivo_base.json?ref=${encodeURIComponent(branch)}&t=${Date.now()}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GitHub API contents fallo (${res.status})`);
  const payload = (await res.json()) as GitHubContentResponse;
  if (!payload.content || payload.encoding !== "base64") {
    throw new Error("Respuesta inválida de GitHub contents");
  }
  const decoded = decodeBase64Utf8(payload.content);
  const file = JSON.parse(decoded) as CelesteFile;
  return {
    file,
    sourceUrl: `https://raw.githubusercontent.com/${REPO}/${branch}/archivo_base.json?sha=${payload.sha || "latest"}`,
  };
}

async function fetchFromContentsApiPath(branch: string, path: string) {
  const url = `${GITHUB_API_REPO}/contents/${path}?ref=${encodeURIComponent(branch)}&t=${Date.now()}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GitHub API contents fallo (${res.status})`);
  const payload = (await res.json()) as GitHubContentResponse;
  if (!payload.content || payload.encoding !== "base64") {
    throw new Error("Respuesta inválida de GitHub contents");
  }
  const decoded = decodeBase64Utf8(payload.content);
  const file = JSON.parse(decoded) as CelesteFile;
  return {
    file,
    sourceUrl: `https://raw.githubusercontent.com/${REPO}/${branch}/${path}?sha=${payload.sha || "latest"}`,
    path,
  };
}

async function fetchFromRaw(branch: string) {
  const sourceUrl = `https://raw.githubusercontent.com/${REPO}/${branch}/archivo_base.json?t=${Date.now()}`;
  const res = await fetch(sourceUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`No se pudo leer archivo_base.json (${res.status})`);
  const file = (await res.json()) as CelesteFile;
  return { file, sourceUrl };
}

function extractDateFromPath(path: string) {
  const m = path.match(/(20\d{2}-\d{2}-\d{2})/);
  if (!m) return null;
  const d = new Date(`${m[1]}T00:00:00Z`);
  return Number.isNaN(+d) ? null : +d;
}

function maxDayFromFile(file: CelesteFile) {
  const keys = Object.keys(file.days || {});
  if (keys.length === 0) return null;
  let max = -Infinity;
  for (const k of keys) {
    const d = new Date(`${k}T00:00:00Z`);
    if (!Number.isNaN(+d) && +d > max) max = +d;
  }
  return max === -Infinity ? null : max;
}

async function listJsonCandidates(branch: string) {
  const url = `${GITHUB_API_REPO}/git/trees/${encodeURIComponent(branch)}?recursive=1&t=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/vnd.github+json" } });
  if (!res.ok) return ["archivo_base.json"];
  const payload = (await res.json()) as GitHubTreeResponse;
  const tree = payload.tree || [];
  const json = tree
    .filter((n) => n.type === "blob" && n.path.endsWith(".json"))
    .map((n) => n.path)
    .filter((p) => !p.startsWith("."))
    .sort((a, b) => {
      const da = extractDateFromPath(a) || -Infinity;
      const db = extractDateFromPath(b) || -Infinity;
      return db - da;
    });
  const preferred = json.filter((p) => /archivo|celeste|calendar/i.test(p));
  const merged = Array.from(new Set([...preferred, ...json, "archivo_base.json"]));
  return merged.slice(0, 12);
}

async function fetchLatestCelesteFile() {
  const defaultBranch = await getDefaultBranch();
  const branches = Array.from(new Set([defaultBranch, "main", "master"]));

  for (const branch of branches) {
    try {
      const url = `${GITHUB_API_REPO}/contents/data/versions?ref=${encodeURIComponent(branch)}&t=${Date.now()}`;
      const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/vnd.github+json" } });
      if (res.ok) {
        const list = (await res.json()) as GitHubContentListItem[];
        const states = list
          .filter((i) => i.type === "file" && /^state_\d{8}_\d{6}\.json$/i.test(i.name))
          .sort((a, b) => b.name.localeCompare(a.name));

        const newest = states[0];
        if (newest) {
          const parsed = await fetchFromContentsApiPath(branch, newest.path);
          const m = newest.name.match(/^state_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})\.json$/i);
          const detectedDate = m ? `${m[1]}-${m[2]}-${m[3]}` : null;
          return {
            file: parsed.file,
            sourceUrl: `${GH_PAGES_BASE}/${newest.path}`,
            sourcePath: newest.path,
            detectedDate,
          };
        }
      }
    } catch {
      // fallback to broader scan below
    }
  }

  for (const branch of branches) {
    const candidates = await listJsonCandidates(branch);
    let best:
      | { file: CelesteFile; sourceUrl: string; path: string; score: number; detectedDate: string | null }
      | null = null;

    for (const path of candidates) {
      try {
        const parsed = await fetchFromContentsApiPath(branch, path);
        const byDays = maxDayFromFile(parsed.file);
        const byPath = extractDateFromPath(path);
        const score = byDays || byPath || 0;
        const detectedDate = byDays ? new Date(byDays).toISOString().slice(0, 10) : (byPath ? new Date(byPath).toISOString().slice(0, 10) : null);
        if (!best || score > best.score) best = { ...parsed, score, detectedDate };
      } catch {
        // try next candidate
      }
    }

    if (best) {
      return { file: best.file, sourceUrl: best.sourceUrl, sourcePath: best.path, detectedDate: best.detectedDate };
    }

    try {
      const fallback = await fetchFromContentsApi(branch);
      return { ...fallback, sourcePath: "archivo_base.json", detectedDate: null };
    } catch {
      // fallback below
    }
    try {
      const fallbackRaw = await fetchFromRaw(branch);
      return { ...fallbackRaw, sourcePath: "archivo_base.json", detectedDate: null };
    } catch {
      // try next branch
    }
  }

  throw new Error("No se pudo leer archivo_base.json desde GitHub (contents/raw).");
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
    const { file, sourceUrl, sourcePath, detectedDate } = await fetchLatestCelesteFile();
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
      const payload = buildEvent(day, entry, sourceUrl);
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
    setConnected(true);
    setSyncError(null);

    return { inserted, updated, unchanged, errors, lastSyncAt, sourcePath, detectedDate };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    setConnected(false);
    setSyncError(message);
    throw new Error(message, { cause: error });
  } finally {
    setSaving(false);
  }
}
