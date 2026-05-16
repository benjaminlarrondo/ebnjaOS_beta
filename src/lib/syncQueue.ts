import type { SupaCollection } from "./supabaseSync";

export type SyncQueueItem = {
  id: string;
  op: "upsert" | "delete";
  key: SupaCollection;
  row?: Record<string, unknown>;
  rowId?: string;
  error: string;
  created_at: string;
};

const KEY = "ebnjaos-sync-queue-v1";

function uid() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

export function listSyncQueue(): SyncQueueItem[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SyncQueueItem[];
  } catch {
    return [];
  }
}

function save(items: SyncQueueItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function enqueueSyncFailure(input: Omit<SyncQueueItem, "id" | "created_at">) {
  const items = listSyncQueue();
  items.unshift({ ...input, id: uid(), created_at: now() });
  save(items.slice(0, 200));
}

export function clearSyncQueue() {
  save([]);
}

export function removeSyncQueueItem(id: string) {
  save(listSyncQueue().filter((i) => i.id !== id));
}
