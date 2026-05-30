import { hydrateAllFromSupabase, probeSupabaseConnection } from "../../lib/supabaseSync";
import { db } from "../../lib/store";

export async function syncSupabaseState() {
  const ok = await probeSupabaseConnection();
  if (!ok) return { ok: false as const, hydrated: false as const };

  const remote = await hydrateAllFromSupabase();
  if (remote) {
    db.hydrateCollections(remote);
    return { ok: true as const, hydrated: true as const };
  }

  return { ok: true as const, hydrated: false as const };
}
