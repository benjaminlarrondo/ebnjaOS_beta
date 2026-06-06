# CHANGELOG.md

## 2026-06-05

### Security + Supabase configuration
- Se creó `Health_ebnjaOS_v2/Supabase/Config.swift` como punto único de validación de configuración Supabase en iOS.
- Se movieron las credenciales reales a `Health_ebnjaOS_v2/Config/Secrets.xcconfig` y `.env.local`, ambos ignorados por Git.
- Se eliminó el fallback hardcoded de URL/key en el cliente web de Supabase.
- Se añadió `SUPABASE_URL` como variable derivada en `Secrets.xcconfig`, `project.yml` e `Info.plist`.
- Se reactivó el bootstrap de HealthKit al cambiar el estado de autorización para que el snapshot y el sync no dependan de abrir manualmente Dashboard.

### Observations
- HealthKit final verification still requires a physical iPhone.
- Dashboard mobile overflow remains fixed.

# CHANGELOG.md

## 2026-06-05

### Critical dashboard and sync stabilization
- Se corrigió el dashboard móvil para iPhone con scroll vertical, layout adaptativo y ancho de contenido controlado.
- Se añadió `HealthSnapshotService` para generar y persistir snapshots locales al terminar la carga de métricas.
- `HealthKitManager` ahora auto-restaura el snapshot cacheado y genera snapshot al completar la carga.
- `SyncManager` dejó de depender de abrir Dashboard manualmente; si no existe snapshot, lo genera antes de sincronizar.
- Se normalizó la configuración Supabase desde `xcconfig`/Info.plist/build settings usando esquema/host/path y anon key.
- Se validó el flujo REST real de Supabase para `health_states`, `fitness_body_metrics` y `fitness_workouts` con read/write/upsert/reload exitosos.

### Observations
- HealthKit live data still needs final validation on a physical iPhone.
- Dashboard mobile overflow is fixed.

# CHANGELOG.md

# CHANGELOG.md

## 2026-06-05

### Critical dashboard and sync stabilization
- Se corrigió el dashboard móvil para iPhone con scroll vertical, layout adaptativo y ancho de contenido controlado.
- Se añadió `HealthSnapshotService` para generar y persistir snapshots locales al terminar la carga de métricas.
- `HealthKitManager` ahora auto-restaura el snapshot cacheado y genera snapshot al completar la carga.
- `SyncManager` dejó de depender de abrir Dashboard manualmente; si no existe snapshot, lo genera antes de sincronizar.
- Se normalizó la configuración Supabase desde `xcconfig`/Info.plist/build settings usando esquema/host/path y anon key.
- Se validó el flujo REST real de Supabase para `health_states`, `fitness_body_metrics` y `fitness_workouts` con read/write/upsert/reload exitosos.

### Observations
- HealthKit live data still needs final validation on a physical iPhone.
- Dashboard mobile overflow is fixed.

## 2026-06-05

### Final stabilization pass
- Persisted the HealthKit usage descriptions through `project.yml` so they survive XcodeGen regeneration.
- Persisted the HealthKit entitlement in `Resources/Health_ebnjaOS.entitlements`.
- Tightened the dashboard typography and bottom spacing so the hero section and action card remain readable on iPhone.
- Removed the stray `.DS_Store` from the project root to keep the tree clean.
- Rebuilt, relaunched, and re-verified the simulator launch path after the final stabilization pass.

### Observations
- Live HealthKit and Supabase verification still depends on real runtime conditions (device + credentials).
- The build remains clean with one non-blocking AppIntents metadata warning.

### Branding and simulator verification
- Updated the public brand to `Health` with bundle id `com.ebnjaos.health`.
- Added `Logo.imageset` and `DashboardBackground.imageset` to the asset catalog.
- Applied the new dashboard background and tightened the dashboard navigation title layout.
- Verified simulator launch after reinstall and confirmed the dashboard renders cleanly.

### Observations
- Supabase remains `Never Synced` in this session because the runtime credentials are not present in the simulator environment.
- HealthKit state remains `PENDING` in the simulator; the real authorization flow still needs an iPhone device session.

## 2026-06-05

### Health_ebnjaOS_v2 bootstrap
- Created a production-ready SwiftUI iOS 18+ project scaffold.
- Added HealthKit authorization, query, normalization, baseline, recovery, and readiness layers.
- Added Supabase configuration, sync manager, and payload normalization.
- Added Dashboard, Recovery, Readiness, and Sync feature screens.
- Configured HealthKit entitlements and usage strings in `Info.plist`.
- Added tests for baseline, readiness, and Supabase configuration loading.

### Validation
- `xcodebuild -project Health_ebnjaOS_v2.xcodeproj -scheme Health_ebnjaOS_v2 -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build`: PASS
- `xcodebuild -project Health_ebnjaOS_v2.xcodeproj -scheme Health_ebnjaOS_v2 -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build-for-testing`: PASS
- `xcodebuild -project Health_ebnjaOS_v2.xcodeproj -scheme Health_ebnjaOS_v2 -destination 'platform=iOS Simulator,id=3DEF8B62-4E9C-43A4-9E83-C32B0A83DDA5' CODE_SIGNING_ALLOWED=NO test`: PASS

### HealthKit / Supabase readiness
- HealthKit entitlement attached to the target via `Resources/Health_ebnjaOS.entitlements`.
- `Info.plist` includes HealthKit usage descriptions.
- `SupabaseConfig.load()` supports environment and plist-based configuration and now has unit test coverage for the environment path.
- Simulator launch logs may still mention HealthKit entitlement warnings, but the build and test suite succeed end-to-end.
