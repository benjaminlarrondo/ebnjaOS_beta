# HealthKit Companion

Native SwiftUI scaffold for the future Apple Health → Supabase bridge.

## Scope

- HealthKit authorization and read permissions
- Normalization of HealthKit samples
- Sync engine placeholder
- Supabase client placeholder
- Settings screen placeholder

## Phase 3.0B

- Reads real Apple Health data from device HealthKit
- Builds a canonical JSON snapshot locally
- Exports the snapshot for the future Supabase bridge
- Keeps Supabase write and background sync out of scope for now

## Phase 3.0C

- Uploads the canonical snapshot to Supabase
- Upserts into `health_states`, `fitness_body_metrics`, and `fitness_workouts`
- Deduplicates safely by `external_id` and `external_updated_at`
- Produces a sync report for debugging and auditability

## Not included yet

- Complex UI
- Background task scheduling
- Full database schema integration
- App Store production hardening
