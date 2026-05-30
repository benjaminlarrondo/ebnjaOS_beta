import { useEffect, useState } from "react";
import { subscribeSyncStatus, type SyncState } from "../lib/syncStatus";

export function useSyncStatus() {
  const [syncState, setSyncState] = useState<SyncState>({
    connected: false,
    saving: false,
    lastSavedAt: null,
    error: null,
  });

  useEffect(() => subscribeSyncStatus(setSyncState), []);

  return syncState;
}
