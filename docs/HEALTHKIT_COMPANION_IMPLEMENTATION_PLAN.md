# HEALTHKIT_COMPANION_IMPLEMENTATION_PLAN

## Objective
Build the native iPhone companion that bridges Apple Health and Supabase with a minimal, production-oriented SwiftUI shell.

## Scope

- HealthKitManager
- HealthKitPermissions
- HealthKitQueries
- SyncEngine
- SupabaseClient
- HealthMetric model
- WorkoutRecord model
- SettingsView

## Initial permissions

- bodyMass
- stepCount
- heartRate
- restingHeartRate
- heartRateVariabilitySDNN
- sleepAnalysis
- workoutType

## Architecture

1. Request HealthKit permissions on first launch.
2. Read HealthKit samples with `HKAnchoredObjectQuery`.
3. Observe changes with `HKObserverQuery`.
4. Enable background delivery for supported types.
5. Normalize samples into canonical app models.
6. Upload normalized payloads to Supabase.
7. Keep the UI minimal and status-driven.

## Payload shape

- `metrics`: array of canonical health metrics
- `workouts`: array of workout records
- `source`: `apple_health_companion`
- `capturedAt`: timestamp of import
- `deviceId`: stable device identifier

## Background sync

- Initial import: 30 days
- Delta sync: daily or on observer trigger
- Offline behavior: queue and retry

## Risks

- HealthKit permissions can be denied or partially granted.
- Background delivery behavior varies by user settings and iOS conditions.
- Sync conflicts must be resolved by `externalUpdatedAt`.

## Next step

Wire these files into a runnable Xcode iOS app target and connect the sync engine to real Supabase endpoints.

## Phase 3.0C target

- Bridge the canonical snapshot to Supabase with idempotent upserts.
- Upload to:
  - `health_states`
  - `fitness_body_metrics`
  - `fitness_workouts`
- Produce a `SyncReport` and local JSON export that can be audited before release.
