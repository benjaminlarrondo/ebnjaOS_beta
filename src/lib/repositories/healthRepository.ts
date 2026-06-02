import { getSingleUserId } from "../supabaseSync";
import type { HealthFoundationState } from "../health/healthTypes";
import { pullRows, upsertRows } from "./syncRepository";

const TABLE = "health_states";
const SINGLE_RECORD_ID = "health-single-state-v1";

type HealthStateRow = {
  id: string;
  user_id: string;
  state: HealthFoundationState;
  updated_at: string;
  created_at?: string;
};

export async function pushHealthState(state: HealthFoundationState) {
  const payload: HealthStateRow = {
    id: SINGLE_RECORD_ID,
    user_id: getSingleUserId(),
    state,
    updated_at: new Date().toISOString(),
  };
  await upsertRows<HealthStateRow>(TABLE, [payload], "id");
}

export async function pullHealthState(): Promise<HealthFoundationState | null> {
  const rows = await pullRows<HealthStateRow>(TABLE, getSingleUserId(), "id,user_id,state,updated_at,created_at");
  return rows[0]?.state ?? null;
}

export async function syncHealthState(local: HealthFoundationState): Promise<HealthFoundationState> {
  const remote = await pullHealthState();
  if (remote) return remote;
  await pushHealthState(local);
  return local;
}
