import { supabase } from "../supabase";

export type SyncMergeInput<T extends { updated_at?: string }> = {
  local: T[];
  remote: T[];
  key: (item: T) => string;
};

export function mergeLastUpdatedWins<T extends { updated_at?: string }>({
  local,
  remote,
  key,
}: SyncMergeInput<T>): T[] {
  const merged = new Map<string, T>();
  for (const item of [...local, ...remote]) {
    const itemKey = key(item);
    const existing = merged.get(itemKey);
    if (!existing) {
      merged.set(itemKey, item);
      continue;
    }
    const existingTs = new Date(existing.updated_at || 0).toISOString();
    const incomingTs = new Date(item.updated_at || 0).toISOString();
    if (incomingTs >= existingTs) merged.set(itemKey, item);
  }
  return Array.from(merged.values());
}

export async function pullRows<T>(table: string, userId: string, select = "*") {
  const { data, error } = await supabase
    .from(table)
    .select(select)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []) as T[];
}

export async function upsertRows<T extends Record<string, unknown>>(table: string, rows: T[], conflict = "id") {
  if (!rows.length) return;
  const { error } = await supabase.from(table).upsert(rows as never, { onConflict: conflict });
  if (error) throw error;
}

export async function pullPushMerge<T extends { updated_at?: string } & Record<string, unknown>>(params: {
  table: string;
  userId: string;
  local: T[];
  key: (item: T) => string;
  conflict?: string;
}) {
  const remote = await pullRows<T>(params.table, params.userId);
  const merged = mergeLastUpdatedWins<T>({
    local: params.local,
    remote,
    key: params.key,
  });
  await upsertRows(params.table, merged, params.conflict || "id");
  return merged;
}
