import { getSingleUserId } from "../supabaseSync";
import type { HealthFoundationState } from "../health/healthTypes";
import { normalizeHealthState } from "../health/healthStore";
import { pullRows, upsertRows } from "./syncRepository";

const TABLE = "health_states";
const SINGLE_RECORD_ID = "health-single-state-v1";

type HealthStateRow = {
  id: string;
  user_id: string;
  state: unknown;
  updated_at: string;
  created_at?: string;
};

function getLocalHealthUpdatedAt(state: HealthFoundationState) {
  const dailyUpdatedAt = Object.values(state.daily).reduce((latest, day) => {
    if (!day.updatedAt) return latest;
    return day.updatedAt > latest ? day.updatedAt : latest;
  }, state.lastSyncAt || "1970-01-01T00:00:00.000Z");
  return state.lastSyncAt && state.lastSyncAt > dailyUpdatedAt ? state.lastSyncAt : dailyUpdatedAt;
}

export async function pushHealthState(state: HealthFoundationState) {
  const payload: HealthStateRow = {
    id: SINGLE_RECORD_ID,
    user_id: getSingleUserId(),
    state,
    updated_at: new Date().toISOString(),
  };
  await upsertRows<HealthStateRow>(TABLE, [payload], "id");
}

export async function pullHealthStateRow(): Promise<HealthStateRow | null> {
  const rows = await pullRows<HealthStateRow>(TABLE, getSingleUserId(), "id,user_id,state,updated_at,created_at");
  return rows[0] ?? null;
}

export async function pullHealthState(): Promise<HealthFoundationState | null> {
  const row = await pullHealthStateRow();
  return row ? normalizeHealthState(row.state) : null;
}

export async function syncHealthState(local: HealthFoundationState): Promise<HealthFoundationState> {
  const remoteRow = await pullHealthStateRow();
  if (!remoteRow) {
    await pushHealthState(local);
    return local;
  }

  const remoteUpdatedAt = remoteRow.updated_at || "1970-01-01T00:00:00.000Z";
  const localUpdatedAt = getLocalHealthUpdatedAt(local);
  const normalizedRemote = normalizeHealthState(remoteRow.state);

  if (localUpdatedAt > remoteUpdatedAt) {
    await pushHealthState(local);
    return local;
  }

  return normalizedRemote;
}
