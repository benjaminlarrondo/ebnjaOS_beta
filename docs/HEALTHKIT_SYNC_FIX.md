# HEALTHKIT_SYNC_FIX.md

## Scope
- Fix dashboard overflow on iPhone.
- Add automatic snapshot generation and cache persistence.
- Remove the dependency on manually opening Dashboard before sync.
- Normalize Supabase config from xcconfig / build settings / Info.plist.
- Validate the REST bridge against the real Supabase project.

## What changed
- Dashboard now uses a vertical `ScrollView`, a compact responsive grid, and an explicit iPhone-safe content width.
- Snapshot generation is handled by `HealthSnapshotService.generateSnapshot(from:)` and persisted to Application Support.
- `HealthKitManager` now restores cached snapshots at launch and auto-generates a snapshot after loading metrics.
- `SyncManager` now self-heals by loading HealthKit data and generating a snapshot if none exists.
- Supabase config now reads `SUPABASE_URL` and `SUPABASE_ANON_KEY` from build configuration instead of hardcoded Swift values.

## Supabase validation
- `health_states`
  - READ: PASS
  - WRITE: PASS
  - UPSERT: PASS
  - RELOAD: PASS
- `fitness_body_metrics`
  - READ: PASS
  - WRITE: PASS
  - UPSERT: PASS
  - RELOAD: PASS
- `fitness_workouts`
  - READ: PASS
  - WRITE: PASS
  - UPSERT: PASS
  - RELOAD: PASS

## Logging
- Snapshot generated
- Metrics loaded
- Sync started
- Sync completed
- Sync failed

## Notes
- `fitness_body_metrics` and `fitness_workouts` use deterministic UUID ids derived from user + external id so REST upserts stay idempotent.
- Workout `type` is normalized to the value accepted by the remote constraint (`strength` for strength sessions).

