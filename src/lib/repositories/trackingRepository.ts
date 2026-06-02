import { getSingleUserId } from "../supabaseSync";
import type { TrackingState } from "../tracking";
import { pullRows, upsertRows } from "./syncRepository";

const TABLE = "tracking_states";
const SINGLE_RECORD_ID = "tracking-single-state-v1";

type TrackingStateRow = {
  id: string;
  user_id: string;
  state: TrackingState;
  updated_at: string;
  created_at?: string;
};

export async function pushTrackingState(state: TrackingState) {
  const payload: TrackingStateRow = {
    id: SINGLE_RECORD_ID,
    user_id: getSingleUserId(),
    state,
    updated_at: new Date().toISOString(),
  };
  await upsertRows<TrackingStateRow>(TABLE, [payload], "id");
}

export async function pullTrackingState(): Promise<TrackingState | null> {
  const rows = await pullRows<TrackingStateRow>(TABLE, getSingleUserId(), "id,user_id,state,updated_at,created_at");
  return rows[0]?.state ?? null;
}

export async function syncTrackingState(local: TrackingState): Promise<TrackingState> {
  const remote = await pullTrackingState();
  if (remote) return remote;
  await pushTrackingState(local);
  return local;
}
