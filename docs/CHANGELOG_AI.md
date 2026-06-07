## 2026-06-07 11:19

### Sprint 6.8 — Weekly Feedback Engine
- Se añadió `WeeklyReviewEngine` para calcular feedback semanal con score, fortalezas, áreas de foco y siguiente paso.
- La pantalla `Review` ahora muestra analytics semanales comparados contra la semana anterior.
- Se agregó exportación descargable de `Week Review` en Markdown.
- Se mantuvo el flujo local-first para la checklist semanal y el análisis de uso.

### Validación
- Build: PASS
- Lint: PASS
- Typecheck: PASS
- Runtime local: PASS

## 2026-06-07 11:14

### Pre-release audit final
- Se auditaron las superficies principales de BenjaOS: Home, Fitness, Agenda, Brain y Settings.
- Se verificó build / lint / typecheck en verde y navegación web local sin errores de runtime.
- Se documentó que la configuración técnica queda contenida únicamente en `Más → Configuración`.
- Se publicaron auditorías de Supabase, sincronización offline, ownership de datos, seguridad e iPhone deployment.
- Se dejó explícito que el release aún no es GO por falta de validación física en iPhone, Brain parcialmente local y Light Mode principal no homologado.

### Validación
- Build: PASS
- Lint: PASS
- Typecheck: PASS
- Runtime web local: PASS
- iPhone físico: PENDING / NOT VERIFIED

## 2026-06-07 11:48

### Sprint 6 — Executive OS
- Se transformó la Home en `Executive Home` con `Life Score`, `Daily Coach`, recuperación, readiness, agenda y Tete context.
- Se creó `DailyCoachEngine` y `LifeScoreEngine` como capa ejecutiva de recomendación y scoring.
- Se añadió `Brain` como módulo de foundations con notas, ideas, decisiones, objetivos y proyectos.
- `Agenda` sumó un resumen contextual de Tete y `Quick Add Event`.
- La configuración técnica quedó consolidada en `Más → Configuración`.

### Validación
- Build: PASS
- Lint: PASS
- Typecheck: PASS

## 2026-06-07 11:03

### Configuration centralization
- Se retiró el estado técnico de las superficies operativas `Home`, `Fitness` y `Calendar`.
- `Más → Configuración` quedó como único hub para configuración técnica visible al usuario.
- Se agregaron categorías explícitas de configuración: `Permisos`, `HealthKit`, `EventKit`, `Supabase`, `Calendar Celeste`, `Sync` y `Backups`.
- `AppHeader` dejó de exponer el badge de plataforma y `Dashboard` / `Fitness` / `Calendar` dejaron de mostrar estados internos de sincronización.
- `Agenda` ya no expone botón de sincronización manual ni mensajes técnicos de sync en la vista pública.

### Validación
- Build: PASS
- Lint: PASS
- Typecheck: PASS

## 2026-06-07 10:40

### Sprint 5 — Fitness Consolidation
- Se redujo la navegación de Fitness a cuatro superficies: `Today`, `Programs`, `Progress` y `PRs`.
- Se agregó `FitnessHomeConsolidated` con Recovery, Readiness, workout del día, objetivo PR, peso corporal, volumen semanal y consistencia.
- Se integró `ProgramProgressionEngine` con `MesocycleManager` y `DeloadManager` para progresión automática.
- Se agregó `FitnessProgramProgression` para mostrar la progresión por rutina seleccionada.
- Se agregó `FitnessProgressAnalytics` para fuerza, físico y adherencia, conectando también la nueva persistencia `fitness_progress`.
- Se generaron las auditorías y documentos de Sprint 5: `FITNESS_OS_AUDIT`, `FITNESS_UX_FINAL`, `FITNESS_RELEASE_RC`, `DEVICE_VALIDATION_REPORT`, `WORKOUT_INTELLIGENCE_RULES` y `PROGRAM_PROGRESSION_ARCHITECTURE`.
- Se exportaron capturas locales de Fitness en `exports/screenshots/sprint5/`.

### Validación
- Build: PASS
- Lint: PASS
- Typecheck: PASS
- Capturas locales: PASS
- Validación en iPhone físico: PENDING

## 2026-06-06 20:04

### Sprint 1.5.2 — UI homogenization pass
- Se actualizó `AppShell` y el layout global para mejorar el comportamiento responsive y evitar overflow horizontal.
- Se agruparon los módulos del sidebar en Operación, Conocimiento, Gestión y Configuración, con ancho expandido/compacto más claro.
- Se compactó el cockpit del Dashboard con más señales accionables visibles al primer vistazo.
- Se añadió el estado de sistema compacto también en Dashboard, Fitness y Calendar.
- Se homogeneizó el calendario para resaltar a Tete con punto rojo y leyenda/tooltip dedicados.
- Se rehízo la barra inferior móvil con icono + texto para mejorar el uso thumb-friendly.
- Se adaptaron los grids a una estrategia responsive más flexible.

### Validación
- Build: en curso / sin cierre concluyente en esta sesión
- Lint: en curso / sin cierre concluyente en esta sesión
- Typecheck: en curso / sin cierre concluyente en esta sesión
- Lucide icon exports: READY

## 2026-06-05 22:47

### Security + Supabase configuration
- Se creó `docs/SUPABASE_CONFIGURATION.md` y `docs/IOS_SECRETS_SETUP.md` para dejar documentado el flujo seguro de configuración.
- Se movieron las credenciales reales a `.env.local` y `Health_ebnjaOS_v2/Config/Secrets.xcconfig`, ambos ignorados por Git.
- Se eliminó el fallback hardcoded de URL/key en el cliente web de Supabase.
- Se añadió `Health_ebnjaOS_v2/Supabase/Config.swift` como punto único de validación de configuración en iOS.
- Se mantuvo el auto snapshot y el sync bootstrap al cambiar el estado de autorización.

### Validación
- iOS build: PASS
- Web build: PASS
- Lint: PASS
- Typecheck: PASS

## 2026-06-05 22:55

### Critical dashboard and sync stabilization
- Se corrigió el dashboard móvil para iPhone con scroll vertical, layout adaptativo y ancho de contenido controlado.
- Se añadió `HealthSnapshotService` para generar y persistir snapshots locales al terminar la carga de métricas.
- `HealthKitManager` ahora auto-restaura el snapshot cacheado y genera snapshot al completar la carga.
- `SyncManager` dejó de depender de abrir Dashboard manualmente; si no existe snapshot, lo genera antes de sincronizar.
- Se normalizó la configuración Supabase desde `xcconfig`/Info.plist/build settings usando esquema/host/path y anon key.
- Se validó el flujo REST real de Supabase para `health_states`, `fitness_body_metrics` y `fitness_workouts` con read/write/upsert/reload exitosos.

### Observaciones
- HealthKit live data sigue requiriendo validación final en iPhone físico.
- La UI de Dashboard ya no presenta overflow horizontal en iPhone.

## 2026-06-05 21:11

### Final stabilization pass
- Se persistieron las descripciones de uso de HealthKit en `project.yml` para que XcodeGen no las borre al regenerar el proyecto.
- Se añadió el entitlement real de HealthKit al target mediante `Resources/Health_ebnjaOS.entitlements`.
- Se ajustó el dashboard para evitar el clipping del hero y el solapamiento del botón de acción con la tab bar.
- Se eliminó el `.DS_Store` huérfano del proyecto.
- Se volvió a compilar, ejecutar y capturar el simulador iPhone 17 Pro Max después de la estabilización.

### Observaciones
- HealthKit y Supabase siguen requiriendo condiciones de runtime reales para una validación completa.
- La verificación visual exacta del icono en Home Screen del simulador continúa siendo parcial.

## 2026-06-05 21:18

### Simulator verification update
- Se ejecutó `Health_ebnjaOS_v2` en iPhone 17 Pro Max Simulator.
- Se verificó que el dashboard abre correctamente tras el ajuste de navegación.
- Se validó que el estado visible de Supabase permanece en `Never Synced` sin credenciales runtime.
- Se confirmó que HealthKit sigue en estado `PENDING` en simulador, por lo que la autorización real continúa pendiente de hardware/iPhone físico.

### Observaciones
- El asset catalog está bien configurado, pero la comprobación visual del icono en el Home Screen del simulador sigue siendo parcial por caché / verificación de simulador.

## 2026-06-05 21:12

### Asset catalog alignment
- Se añadió `Logo.imageset` para una referencia visual consistente del branding.
- Se añadió `DashboardBackground.imageset` para vestir el dashboard con un fondo premium oscuro.
- Se actualizó `DashboardView` para usar `DashboardBackground`.
- Se mantuvo `AppIcon.appiconset` y `LaunchLogo.imageset` como parte del branding unificado.

### Validación
- Build: PASS

## 2026-06-05 21:05

### Branding update for Health_ebnjaOS_v2
- Se cambió el bundle identifier a `com.ebnjaos.health`.
- Se configuró el nombre visible de la app como `Health`.
- Se agregó un launch screen compatible con iOS usando:
  - fondo negro
  - icono centrado
- Se agregó un splash en SwiftUI con:
  - texto `ebnjaOS Health`
  - animación de fade-in
- Se validó el build del proyecto después del cambio de branding.

### Validación
- `xcodegen generate`: PASS
- `xcodebuild -project Health_ebnjaOS_v2.xcodeproj -scheme Health_ebnjaOS_v2 -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build`: PASS

## 2026-06-05 21:05

### App Icon set for Health_ebnjaOS_v2
- Se generó `app_icon_master.png` como arte maestro 1024x1024.
- Se creó un `AppIcon.appiconset` completo con variantes para iPhone, iPad y App Store.
- Se configuró `ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon` en el target del proyecto.
- Se validó el build del proyecto con el asset catalog correcto.

### Validación
- `xcodegen generate`: PASS
- `xcodebuild -project Health_ebnjaOS_v2.xcodeproj -scheme Health_ebnjaOS_v2 -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build`: PASS

## 2026-06-05 20:42

### Health_ebnjaOS_v2 bootstrap
- Se creó el proyecto iOS nativo `Health_ebnjaOS_v2` con SwiftUI, iOS 18+, HealthKit y Supabase.
- Se configuró el target principal con:
  - `HealthKit` capability
  - `Health_ebnjaOS.entitlements`
  - `Info.plist` con permisos de uso de HealthKit
- Se añadió soporte de configuración Supabase por entorno/Info.plist.
- Se agregaron tests para:
  - `HealthBaselineEngine`
  - `ReadinessEngine`
  - `SupabaseConfig.load()`
- Se validó el build y la suite de tests.

### Validación
- `xcodebuild -project Health_ebnjaOS_v2.xcodeproj -scheme Health_ebnjaOS_v2 -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build`: PASS
- `xcodebuild -project Health_ebnjaOS_v2.xcodeproj -scheme Health_ebnjaOS_v2 -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build-for-testing`: PASS
- `xcodebuild -project Health_ebnjaOS_v2.xcodeproj -scheme Health_ebnjaOS_v2 -destination 'platform=iOS Simulator,id=3DEF8B62-4E9C-43A4-9E83-C32B0A83DDA5' CODE_SIGNING_ALLOWED=NO test`: PASS

## 2026-06-04 22:40

### Phase 3.2B — Personal Baseline Engine
- Se agregaron:
  - `BaselineCalculator.swift`
  - `BaselineModels.swift`
  - `HealthBaselineEngine.swift`
- La app ahora calcula baselines personales de 30 días para:
  - HRV
  - Resting HR
  - Sleep
- Se agregó la card `Personal Baselines` con:
  - valor actual
  - baseline 30d
  - delta %
  - clasificación
- `HealthRecoveryEngine` ahora usa deltas contra baseline para HRV y Resting HR en vez de valores absolutos.

### Validación
- `xcodebuild -project Health_ebnjaOS/Health_ebnjaOS/Health_ebnjaOS.xcodeproj -scheme Health_ebnjaOS -destination 'platform=macOS' CODE_SIGNING_ALLOWED=NO build`: PASS
- `npm run build`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS

## 2026-06-04 22:30

### Phase 3.2A — Readiness Coach
- Se crearon:
  - `ReadinessModels.swift`
  - `ReadinessEngine.swift`
- Se agregó una capa de coaching diario que transforma `Recovery Score` en:
  - `ReadinessLevel`
  - `TrainingRecommendation`
  - `Why?`
  - `Risk Factors`
- La UI ahora muestra:
  - `Today's Readiness`
  - `Why?`
  - `Risk Factors`
- Se mantuvo intacta la arquitectura existente de:
  - `HealthKitManager`
  - `HealthRecoveryEngine`

### Validación
- Pendiente de ejecución

## 2026-06-04 22:30

### Phase 3.2A — Readiness Coach
- Se crearon:
  - `ReadinessModels.swift`
  - `ReadinessEngine.swift`
- Se agregó una capa de coaching diario que transforma `Recovery Score` en:
  - `ReadinessLevel`
  - `TrainingRecommendation`
  - `Why?`
  - `Risk Factors`
- La UI ahora muestra:
  - `Today's Readiness`
  - `Why?`
  - `Risk Factors`
- Se mantuvo intacta la arquitectura existente de:
  - `HealthKitManager`
  - `HealthRecoveryEngine`

### Validación
- `xcodebuild -project Health_ebnjaOS/Health_ebnjaOS/Health_ebnjaOS.xcodeproj -scheme Health_ebnjaOS -destination 'platform=macOS' CODE_SIGNING_ALLOWED=NO build`: PASS
- `npm run build`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS

## 2026-06-04 22:24

### Phase 3.1B — Recovery Intelligence Engine
- Se creó `HealthRecoveryEngine` para calcular:
  - `Recovery Score` con pesos de Sleep, Training Load, HRV y Resting HR
  - `Readiness` con estados `Recovered`, `Moderate` y `Fatigued`
  - `Training Load` a partir de workouts, active calories y frecuencia semanal
  - `Weekly Trend` como promedio móvil de 7 días
- La UI de `Health_ebnjaOS` ahora muestra cards dedicadas para:
  - Recovery Score
  - Readiness
  - Training Load
  - Weekly Trend

### Validación
- `xcodebuild -project Health_ebnjaOS/Health_ebnjaOS/Health_ebnjaOS.xcodeproj -scheme Health_ebnjaOS -destination 'platform=macOS' CODE_SIGNING_ALLOWED=NO build`: PASS
- `npm run build`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS

## 2026-06-04 21:57

### Phase 3.1A — Advanced Health Metrics
- Se agregaron consultas reales a HealthKit para:
  - `heartRateVariabilitySDNN`
  - `restingHeartRate`
  - `activeEnergyBurned`
  - `workoutType`
- La UI ahora muestra nuevas cards para:
  - HRV
  - Resting HR
  - Active Calories
  - Workouts Last 7 Days
- Se mantuvo intacta la lectura existente de:
  - Weight
  - Sleep
  - Steps

### Validación
- `xcodebuild -project Health_ebnjaOS/Health_ebnjaOS/Health_ebnjaOS.xcodeproj -scheme Health_ebnjaOS -destination 'platform=macOS' CODE_SIGNING_ALLOWED=NO build`: PASS
- `npm run build`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS

## 2026-06-04 21:49

### HealthKit authorization status binding
- Se conectó el estado visible de HealthKit a `permissions.authorizationStatus`.
- La UI ahora puede mostrar `Pending`, `Authorized` o `Denied` según el estado real del manager.

### Validación
- `xcodebuild -project Health_ebnjaOS/Health_ebnjaOS/Health_ebnjaOS.xcodeproj -scheme Health_ebnjaOS -destination 'platform=macOS' CODE_SIGNING_ALLOWED=NO build`: PASS
- `npm run build`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS

## 2026-06-04 21:46

### HealthKit authorization button wiring
- Se simplificó el botón `Request Health Access` para que invoque únicamente `permissions.requestAuthorization()`.
- Se eliminó el disparo adicional de carga desde UI para dejar la autorización como única responsabilidad del botón.

### Validación
- `xcodebuild -project Health_ebnjaOS/Health_ebnjaOS/Health_ebnjaOS.xcodeproj -scheme Health_ebnjaOS -destination 'platform=macOS' CODE_SIGNING_ALLOWED=NO build`: PASS
- `npm run build`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS

## 2026-06-04 21:44

### Phase 3.0E — First Real Health Data
- Se agregaron consultas reales a HealthKit para:
  - `bodyMass`
  - `stepCount`
  - `sleepAnalysis`
- La UI de `Health_ebnjaOS` ahora muestra:
  - Weight
  - Sleep
  - Steps
- Se añadieron estados de carga, sin datos, éxito y error.
- Se incorporó logging de inicio, éxito y falla para cada query.

### Validación
- `xcodebuild -project Health_ebnjaOS/Health_ebnjaOS/Health_ebnjaOS.xcodeproj -scheme Health_ebnjaOS -destination 'platform=macOS' CODE_SIGNING_ALLOWED=NO build`: PASS
- `npm run build`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS

## 2026-06-04 21:16

### Phase 3.0C — Supabase Bridge
- Se conectó el companion de HealthKit al backend Supabase existente.
- Se implementó:
  - `SupabaseClient` real
  - `pushMetrics()`
  - `pushWorkouts()`
  - `pullLastSync()`
  - `SnapshotUpload`
  - `SyncReport`
- Se garantizó el patrón idempotente usando:
  - `external_id`
  - `external_updated_at`
  - deduplicación previa al upsert
- Se agregó documentación:
  - `docs/HEALTHKIT_SUPABASE_BRIDGE.md`

### Validación
- `cd HealthKitCompanion && swift build`: PASS
- `npm run build`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS

## 2026-06-04 21:30

### Phase 3.0D — HealthKit Authorization
- Se conectó `Health_ebnjaOS` a HealthKit real.
- Se agregaron:
  - `HealthKitManager`
  - `HealthKitPermissions`
  - `HealthKitTypes`
- Se conectó el botón `Request Health Access` al flujo real de autorización.
- Se agregó soporte de estado:
  - `Pending Authorization`
  - `Authorized`
  - `Denied`
- Se añadió el entitlement de HealthKit y la descripción de uso en el proyecto Xcode.

### Validación
- `xcodebuild -project Health_ebnjaOS/Health_ebnjaOS/Health_ebnjaOS.xcodeproj -scheme Health_ebnjaOS -destination 'platform=macOS' CODE_SIGNING_ALLOWED=NO build`: PASS
- `npm run build`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS

## 2026-06-04 21:34

### HealthKit authorization button wiring
- Se simplificó el botón `Request Health Access` para que llame directamente a `permissions.requestAuthorization()`.
- No cambió la lógica de autorización; solo el punto de disparo desde UI.

### Validación
- pendiente de ejecución

## 2026-06-04 21:36

### HealthKit capability setup
- Se verificó y dejó activo el entitlement de HealthKit para el target `Health_ebnjaOS`.
- Se agregaron `NSHealthShareUsageDescription` y `NSHealthUpdateUsageDescription` al `Info.plist` generado por el proyecto.
- El proyecto compila correctamente con la nueva configuración.

### Validación
- `xcodebuild -project Health_ebnjaOS/Health_ebnjaOS/Health_ebnjaOS.xcodeproj -scheme Health_ebnjaOS -destination 'platform=macOS' CODE_SIGNING_ALLOWED=NO build`: PASS

## 2026-06-04 21:32

### HealthKit folder reorganization
- Se movieron los archivos nativos de autorización de HealthKit a `HealthKit/` para mantener una estructura más clara:
  - `HealthKitManager.swift`
  - `HealthKitPermissions.swift`
  - `HealthKitTypes.swift`
- No hubo cambios funcionales; solo orden estructural.

### Validación
- `xcodebuild -project Health_ebnjaOS/Health_ebnjaOS/Health_ebnjaOS.xcodeproj -scheme Health_ebnjaOS -destination 'platform=macOS' CODE_SIGNING_ALLOWED=NO build`: PASS
- `npm run build`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS

## 2026-06-04 21:06

### Phase 3.0B — First Real HealthKit Data
- Se conectó lectura real de Apple Health en el companion nativo con:
  - `requestAuthorization()`
  - `HealthKitManager`
  - `HKAnchoredObjectQuery`
  - `HealthKitNormalizer`
- Se agregaron modelos canónicos:
  - `HealthMetric`
  - `WorkoutRecord`
  - `HealthSnapshot`
- Se agregó un `Debug Dashboard` y exportación local de snapshot JSON.
- Alcance explícitamente excluido:
  - Supabase write
  - Background delivery
  - Observer queries
  - Apple Watch sync

### Validación
- `npm run build`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS

## 2026-06-04 20:57

### Phase 3.0A — HealthKit Companion Bootstrap
- Se creó el scaffold nativo `HealthKitCompanion/` para iPhone.
- Se agregaron los pilares solicitados:
  - `HealthKitManager`
  - `HealthKitPermissions`
  - `HealthKitQueries`
  - `SyncEngine`
  - `SupabaseClient`
  - `HealthMetric`
  - `WorkoutRecord`
  - `SettingsView`
- Se documentó el plan de implementación:
  - `docs/HEALTHKIT_COMPANION_IMPLEMENTATION_PLAN.md`

### Validación
- pendiente de ejecución

## 2026-06-04 20:43

### Final Alignment Cleanup — Phase 3 Ready
- Se limpiaron referencias obsoletas de documentación para reflejar el estado actual:
  - `fitnessPRRepository` como persistencia oficial de PRs
  - `fitness_prs` como source of truth
  - `localStorage` solo como cache offline
- Se dejó preparado el reporte formal:
  - `docs/PHASE3_READINESS_REPORT.md`
- Estado global objetivo:
  - `READY FOR PHASE 3`

### Validación
- `npm run build`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS

## 2026-06-04 20:39

### Roadmap Consolidation
- Se creó `docs/ROADMAP.md` como fuente única de roadmap por fases:
  - Fase 1
  - Fase 2
  - Fase 2.5
  - Fase 3
  - Fase 4
  - Fase 5

### Validación
- pendiente de ejecución

## 2026-06-04 20:36

### Supabase Production Audit
- Se validaron en Supabase:
  - `fitness_prs`
  - `fitness_workouts`
  - `fitness_body_metrics`
  - `health_states`
  - `tracking_states`
  - `calendar_events`
- Se documentó el estado real de:
  - índices
  - upserts
  - deduplicación
  - `external_id`
  - `external_updated_at`
- Se agregó:
  - `docs/SUPABASE_PRODUCTION_AUDIT.md`

### Validación
- pruebas live con Supabase anon select: OK
- `npm run build`: pendiente
- `npm run lint`: pendiente
- `npm run typecheck`: pendiente

## 2026-06-04 20:34

### Fitness Persistence Final Audit
- Se validó el estado real de la persistencia de Fitness:
  - `FitnessPRTracker` ya usa `fitnessPRRepository`
  - `fitnessTrends.ts` ya lee desde el repository
  - `fitness_prs` es la fuente remota
  - `localStorage` quedó como cache offline
- Se documentó la deuda de alineación en:
  - `docs/FITNESS_PERSISTENCE_FINAL_AUDIT.md`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-04 20:23

### Fitness PR Repository
- Se creó `src/lib/repositories/fitnessPRRepository.ts`.
- `FitnessPRTracker` dejó de depender de `localStorage` como fuente principal.
- `fitnessTrends.ts` ahora lee el estado PR desde el repository.
- `FitnessPage` hidrata PR state desde Supabase en background.
- La persistencia quedó con:
  - Supabase como fuente principal
  - cache local como respaldo offline

### Validación
- `npm run build`: pendiente
- `npm run lint`: pendiente
- `npm run typecheck`: pendiente

## 2026-06-04 20:02

### Master Alignment Audit — Pre HealthKit Companion
- Se auditaron:
  - estado del git repository
  - tablas y contrato de Supabase
  - Fitness y dependencias de persistencia
  - Apple Health Foundation
  - deduplicación por `external_id`
  - documentación y build integrity
- Resultado:
  - `READY FOR PHASE 3`
- Documento agregado:
  - `docs/MASTER_ALIGNMENT_AUDIT.md`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-04 20:18

### Sprint 2.5A — HealthKit Companion Architecture
- Se diseñó el flujo completo:
  - HealthKit → Companion App → JSON canónico → Supabase → UI
- Se definió la importación inicial de 30 días.
- Se definió delta sync diario y estrategia background sync.
- Se documentó la resolución de conflictos por:
  - `external_id`
  - `external_updated_at`
- Se definió el mapeo HealthKit → tablas actuales.
- Documento agregado:
  - `docs/HEALTHKIT_COMPANION_ARCHITECTURE.md`

### Validación
- `npm run build`: pendiente
- `npm run lint`: pendiente
- `npm run typecheck`: pendiente

## 2026-06-04 20:05

### Sprint 2.4F — Apple Health Remote Repository
- Se conectó `AppleHealthImportRepository` a Supabase.
- La importación Apple Health ahora escribe remotamente en:
  - `health_states`
  - `fitness_body_metrics`
  - `fitness_workouts`
- `localStorage` quedó solo como cache offline.
- Se agregaron lectores de snapshot remoto para validación:
  - `pullAppleHealthRemoteSnapshot()`
  - `hydrateAppleHealthFromRemote()`
- Se añadieron índices únicos recomendados para deduplicar por:
  - `user_id + external_id`
- Documentación añadida:
  - `docs/APPLE_HEALTH_REMOTE_REPOSITORY.md`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-04 19:55

### Sprint 2.4E — Supabase Apple Health Audit
- Se auditó la migración Apple Health para:
  - `fitness_body_metrics`
  - `fitness_workouts`
  - `health_states`
- Se confirmó que el contrato de datos está listo en el repo:
  - `steps_count`
  - `hrv_ms`
  - `resting_hr`
  - `source`
  - `external_id`
  - `external_updated_at`
  - `metadata`
- Se documentó la validación en:
  - `docs/SUPABASE_APPLE_HEALTH_AUDIT.md`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-04 19:44

### Sprint 2.4D — Health Metrics Persistence
- Se extendió el modelo Apple Health para soportar:
  - `steps_count`
  - `hrv_ms`
  - `resting_hr`
- Se actualizó el snapshot de salud para aceptar:
  - `stepsCount`
  - `hrvMs`
  - `restingHr`
- Se reforzó el bridge Apple Health con:
  - `externalId`
  - `externalUpdatedAt`
  - merge por fecha con preservación de métricas parciales
- Se agregó el modelo de datos:
  - `docs/APPLE_HEALTH_DATA_MODEL.md`
- Se agregó la migración SQL:
  - `supabase/apple_health_metrics_persistence.sql`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-01 21:20

### Sprint 2.2D — Supabase First
- Se auditó el flujo real para `Agua`, `Proteína` y `Sueño`:
  - UI: `src/modules/tracking/page.tsx`
  - Hook: `src/hooks/useTrackingEngine.ts`
  - Repositorios: `src/lib/repositories/healthRepository.ts`, `src/lib/repositories/trackingRepository.ts`
  - Persistencia remota: `health_states` y `tracking_states`
- Se corrigió inconsistencia de persistencia por concurrencia en `useTrackingEngine`:
  - serialización de mutaciones con colas (`healthMutationChainRef`, `trackingMutationChainRef`)
  - eliminación de `push` directo con estado stale desde `toggleChecklist`
  - write path: push remoto -> sync remoto -> update de estado UI
- Se generó documentación de sprint:
  - `docs/SUPABASE_FIRST_AUDIT.md`
  - `docs/SUPABASE_DATA_FLOW.md`
  - `docs/MULTI_DEVICE_VALIDATION.md`
- Estado del sprint:
  - READY FOR PHASE 3 (cierre documental final alcanzado)

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-02 22:24

### Sprint 2.3C.2 — Recovery Intelligence
- `Recovery Score` se transformó en un sistema accionable 40/30/15/15:
  - 40% sueño
  - 30% carga de entrenamiento
  - 15% nutrición
  - 15% consistencia
- Estados:
  - `Recuperado`
  - `Moderado`
  - `Fatigado`
- La nueva Recovery Card muestra:
  - score
  - estado
  - recomendación
  - sueño
  - carga
  - nutrición
  - consistencia
- La portada premium reutiliza la misma inteligencia.
- Documentación añadida:
  - `docs/RECOVERY_INTELLIGENCE.md`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-02 22:31

### Ajuste — Recovery Intelligence final
- Se alineó la documentación con la fórmula final `40/30/15/15`.
- Se añadió cálculo real de consistencia desde `fitness_progress_logs`/progreso histórico disponible.
- Se conectó la recuperación a:
  - `health_states`
  - `fitness_workouts`
  - `fitness_progress_logs`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-02 22:11

### Fix — CalendarDomain payload cleanup
- Se corrigió el payload de `calendar_events` para no enviar el campo `domainHash` al esquema de Supabase.
- `domainHash` queda como metadato local del dominio, pero no se escribe como columna remota.
- Archivo afectado:
  - `src/lib/repositories/calendarRepository.ts`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-02 22:21

### Sprint 2.3C.1A — Fitness Information Architecture
- Se reordenó la jerarquía visual de Fitness para priorizar:
  - Fitness Score
  - Rings
  - Streak
  - Heatmap
  - Trends
  - PR Tracker
- Los rings ahora muestran cuatro señales:
  - Training
  - Nutrition
  - Recovery
  - Consistency
- Heatmap quedó por encima de Trends.
- PR Tracker se movió al final de la página.
- Se documentó en `docs/FITNESS_INFORMATION_ARCHITECTURE.md`.

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-02 22:24

### Sprint 2.3C.2 — Recovery Intelligence
- Se convirtió `Recovery Score` en un sistema de recomendación basado en:
  - `sleepHours`
  - `fitness_workouts`
  - `health_states`
- Nuevos estados:
  - `Recuperado`
  - `Moderado`
  - `Fatigado`
- La card de Recovery ahora muestra:
  - score
  - estado
  - recomendación
- La portada premium también usa la misma inteligencia.
- Documentación añadida:
  - `docs/RECOVERY_INTELLIGENCE.md`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

# CHANGELOG_AI.md

## 2026-06-02 01:30

### Sprint 2.2E — Navigation Simplification
- Se simplificó la navegación principal:
  - sidebar final: `Dashboard`, `Calendar`, `Goals`, `Fitness`, `Workspace`, `Settings`
  - `Tracking` cambió su label visible a `Goals` manteniendo la ruta `/tracking`
- Se creó `Workspace` como espacio contenedor para módulos operativos:
  - `Projects`
  - `Tasks`
  - `Notes`
  - `Resources`
- Se actualizó el acceso de configuración:
  - el icono del header ahora navega a `/settings`
  - en mobile, la navegación principal se redujo para priorizar las vistas core
- Archivos nuevos/modificados:
  - `src/lib/navigation.ts`
  - `src/components/layout/Sidebar.tsx`
  - `src/components/layout/AppHeader.tsx`
  - `src/app/router.tsx`
  - `src/modules/workspace/page.tsx`
  - `src/modules/tracking/page.tsx`
  - `src/components/dashboard/TrackingTodayWidget.tsx`
  - `docs/NAVIGATION_SIMPLIFICATION.md`
- Capturas generadas:
  - `~/Desktop/ebnjaOS_AUDIT_rev_06/screenshots/desktop/dashboard-desktop.png`
  - `~/Desktop/ebnjaOS_AUDIT_rev_06/screenshots/desktop/goals-desktop.png`
  - `~/Desktop/ebnjaOS_AUDIT_rev_06/screenshots/desktop/workspace-desktop.png`
  - `~/Desktop/ebnjaOS_AUDIT_rev_06/screenshots/mobile/dashboard-mobile.png`
  - `~/Desktop/ebnjaOS_AUDIT_rev_06/screenshots/mobile/goals-mobile.png`
  - `~/Desktop/ebnjaOS_AUDIT_rev_06/screenshots/mobile/workspace-mobile.png`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-02 00:00

### Sprint 2.2D — Root Cause Fix
- Se corrigió el origen de la inconsistencia Supabase-first:
  - `src/hooks/useTrackingEngine.ts` ya no reconstruye salud desde snapshots stale para writes.
  - `src/hooks/useHealthState.ts` centraliza la hidratación de salud para evitar lecturas directas en render.
  - `src/lib/repositories/healthRepository.ts` ahora compara `updated_at` remoto contra la versión local antes de decidir qué estado gana.
- Dashboard y Fitness dejan de leer `loadHealthState()` directo en render:
  - `src/modules/dashboard/page.tsx`
  - `src/modules/fitness/page.tsx`
- Los controles de agua/proteína pasaron a incremento por delta para evitar perder clicks rápidos:
  - `src/modules/tracking/page.tsx`
- Documentación generada:
  - `docs/ROOT_CAUSE_FIX.md`
  - `docs/SUPABASE_FIRST_FINAL_VALIDATION.md`
- Estado actual:
  - solución aplicada
  - validación real completada con `Agua = 3000`
  - `write test`: PASS
  - `reload test`: PASS
  - `cross browser`: PASS

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-01 20:20

### Sprint 2.2C — Persistence Foundation
- Se implementó `Repository Layer`:
  - `src/lib/repositories/syncRepository.ts`
  - `src/lib/repositories/trackingRepository.ts`
  - `src/lib/repositories/healthRepository.ts`
  - `src/lib/repositories/calendarRepository.ts`
- Tracking persistido en Supabase:
  - tabla `tracking_states`
  - single-record pattern (`tracking-single-state-v1`)
- Health persistido en Supabase:
  - tabla `health_states`
  - single-record pattern (`health-single-state-v1`)
- Calendar conectado a persistencia remota:
  - `CalendarDomainStore` sincroniza con `calendar_events`
  - merge `lastUpdated wins`
- Single-user mode sin login obligatorio:
  - `src/lib/supabaseSync.ts` ahora habilita queries por conectividad real de tabla, no por sesión auth estricta
  - mantiene `VITE_SINGLE_USER_ID`
- Fallback offline mantenido:
  - `localStorage` sigue como cache de continuidad.
- Se añadió migración SQL:
  - `supabase/persistence_foundation.sql`
- Documentación:
  - `docs/PERSISTENCE_FOUNDATION.md`
  - `docs/SUPABASE_DATA_MODEL.md`
- Capturas:
  - `persistence-flow.png`
  - `supabase-sync.png`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-01 20:08

### Supabase Readiness Audit
- Auditoría completa de preparación Supabase antes de migración total de persistencia.
- Se revisó:
  - configuración de entorno (`.env`, cliente, vite base)
  - conectividad API (`rest`/`auth settings`)
  - estado de auth en app (session-gated)
  - tablas, columnas e índices (foco en `calendar_events`)
  - RLS y políticas (`schema.sql` y `single-user-anon-setup.sql`)
  - uso actual por módulos (qué escribe remoto vs qué queda local)
- Documentos generados:
  - `docs/SUPABASE_READINESS_AUDIT.md`
  - `docs/PERSISTENCE_FOUNDATION_PLAN.md`
- Estado emitido:
  - READY FOR PHASE 3

## 2026-06-01 20:01

### Sprint 2.3 — Fitness 2.0
- Se fortaleció motor de métricas fitness:
  - `src/modules/fitness/fitnessMetrics.ts`
  - `Fitness Score` 0-100
  - `Recovery Score` 0-100 (sueño + fatiga manual + entrenamiento reciente)
- Nuevo componente de anillos:
  - `src/components/fitness/FitnessActivityRings.tsx`
  - anillos: Entreno, Nutrición, Recuperación
- Nuevo PR Tracker con persistencia local:
  - `src/components/fitness/FitnessPRTracker.tsx`
  - key localStorage: `ebnjaos-fitness-pr-v1`
  - ejercicios: Deadlift, Back Squat, Front Squat, Clean, Bench Press
  - salida: último PR, variación mensual, tendencia simple
- Reordenamiento de Fitness Home en pestaña principal:
  1) Fitness Score
  2) Recovery Score
  3) Rutina de hoy
  4) Activity Rings
  5) PR Tracker
  6) Historial/consistencia
- Card de dashboard `Fitness` actualizada:
  - `src/components/dashboard/FitnessWidget.tsx`
  - muestra Fitness Score + Recovery Score + rutina de hoy
  - integración en `src/modules/dashboard/page.tsx`
- Documentación del sprint:
  - `docs/FITNESS_2_0.md`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-01 19:47

### Celeste Calendar Persistence — definitivo (Fase A + B)
- Se creó dominio canónico local para calendario celeste:
  - `src/lib/calendarDomain/calendarDomainTypes.ts`
  - `src/lib/calendarDomain/calendarDomainStore.ts`
  - `src/lib/calendarDomain/calendarDomainHash.ts`
  - `src/lib/calendarDomain/calendarDomainSelectors.ts`
- Nueva persistencia local:
  - key `ebnjaos-calendar-domain-v1`
  - campos: `schemaVersion`, `lastSuccessfulSyncAt`, `sourceFingerprint`, `daysByDate`, `eventsBySourceId`, `syncMeta`.
- Se implementó `CelesteSyncAdapter`:
  - `src/services/celeste/CelesteSyncAdapter.ts`
  - endpoint primario + fallback raw `main/master`
  - normalización por `days[YYYY-MM-DD]`
  - hash estable por `date+owner+note+exception`
  - snapshot con `fetchedAt`, `sourceUrl`, `datasetHash`.
- `githubCalendarSync` migrado a local-first:
  - guarda snapshot en dominio local sin requerir Supabase
  - fallback degradado mantiene cache previa (no borra datos).
- Calendar migrado:
  - ownership/dots desde `CalendarDomainStore` (ya no desde `celesteState` remoto en memoria)
  - merge de eventos manuales + eventos derivados de dominio.
- Dashboard Tete migrado:
  - próximo bloque y estado diario desde `CalendarDomainStore` (no solo `db.events`).
- Sync de arranque:
  - `syncManager` ejecuta `syncCelesteCalendar()` en background.
- Documentación:
  - `docs/CELESTE_PERSISTENCE_IMPLEMENTATION.md`
- Capturas:
  - `calendar-domain-desktop.png`
  - `dashboard-tete-domain.png`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-01 19:34

### Sprint 2.2A — Health Integration Layer
- Objetivos migra `Agua`, `Proteína` y `Sueño` para leer/escribir desde `healthStore`:
  - `src/hooks/useTrackingEngine.ts`
  - `state` combinado (`tracking + health`) para mantener scoring sin romper compatibilidad.
- Dashboard integra nueva card `Health Today`:
  - `src/components/dashboard/HealthTodayWidget.tsx`
  - `src/modules/dashboard/page.tsx`
- Fitness incorpora capa de scoring basada en Health:
  - nuevo `src/modules/fitness/fitnessMetrics.ts`
  - integración en `src/modules/fitness/page.tsx`
  - muestra `Fitness Score` y `Recovery Score`.
- Documentación del sprint:
  - `docs/HEALTH_INTEGRATION.md`
- Capturas generadas:
  - `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_04/screenshots/health-dashboard.png`
  - `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_04/screenshots/health-objectives.png`
  - `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_04/screenshots/fitness-score.png`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-01 19:20

### Health Foundation Layer
- Se consolidó modelo unificado de salud:
  - Water
  - Protein
  - Sleep
  - Workout
  - Weight
  - Activity
- Nueva estructura base:
  - `src/lib/health/healthTypes.ts`
  - `src/lib/health/healthMetrics.ts`
  - `src/lib/health/healthStore.ts`
- Persistencia local:
  - estado versionado `v1`
  - key `ebnjaos-health-foundation-v1`
- Se añadió hydration desde infraestructura actual:
  - Tracking (agua/proteína/sueño)
  - Workouts locales (entrenamientos)
- Se preparó integración futura Apple Health:
  - contrato `AppleHealthPort`
  - placeholder no operativo (`appleHealthPortPlaceholder`)
- Se mantiene compatibilidad por reexport:
  - `src/lib/healthFoundation.ts`
- Sin cambios visuales en Dashboard ni Objetivos.
- Documentación creada:
  - `docs/HEALTH_FOUNDATION.md`
- Captura generada:
  - `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_03/screenshots/health-architecture-desktop.png`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-01 19:14

### Sprint 2.1B — Consistency Engine
- Implementado `Heatmap 30 días` con escala de intensidad 0/25/50/75/100:
  - `src/components/tracking/TrackingHeatmap.tsx`
- Implementado `Streak Engine`:
  - 🔥 Streak actual
  - 🏆 Mejor histórico
  - 📈 Consistencia 30 días
  - `src/components/tracking/TrackingStreakStats.tsx`
- Implementado `Weekly Progress` con barra minimalista:
  - `src/components/tracking/TrackingWeeklyProgress.tsx`
- Implementado `Trend 30 días` con sparkline SVG:
  - `src/components/tracking/TrackingTrendChart.tsx`
- Integración en página Objetivos (`/tracking`):
  - `src/modules/tracking/page.tsx`
- Se documentó en:
  - `docs/CONSISTENCY_ENGINE.md`
- Capturas generadas:
  - `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_02/screenshots/heatmap-desktop.png`
  - `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_02/screenshots/heatmap-mobile.png`
  - `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_02/screenshots/streak-desktop.png`
  - `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_02/screenshots/streak-mobile.png`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-01 19:07

### Sprint 2.1A.1 — Objectives UX Refinement
- FAB móvil corregido para evitar solapamiento de contenido:
  - ajuste de `bottom` en `GlobalQuickCapture`
  - mayor `safe area` inferior en `app-main`.
- Score card de Objetivos refinada (más compacta):
  - `% diario`
  - `x/y hábitos`.
- Familia refinada:
  - sin visualización de `0%`
  - estados textuales `Sin bloque Tete hoy` / `Tete ✓`.
- Salud refinada:
  - Agua 3L con atajos `+250ml` y `+500ml`
  - Proteína 135g con atajos `+25g` y `+50g`
  - Sueño 8h con input rápido.
- Dashboard:
  - card de Objetivos simplificada a `Score`, `Hábitos`, `Salud`.
- Capturas generadas:
  - `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_01/screenshots/objectives-refined-desktop.png`
  - `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_01/screenshots/objectives-refined-mobile.png`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-01 19:04

### Auditoría externa — empaquetado automático
- Se implementó script de empaquetado post-sprint:
  - `scripts/package-audit-rev.mjs`
- Nuevo comando:
  - `npm run audit:package`
- El flujo genera automáticamente:
  - `~/Desktop/ebnjaOS_AUDIT_rev_XX/`
  - `~/Desktop/ebnjaOS_AUDIT_rev_XX.zip`
- Incluye evidencia para auditoría externa:
  - screenshots desktop/mobile
  - implementación
  - auditoría técnica
  - changelog
  - status
  - `MANIFEST.json`
- Se documentó el procedimiento en:
  - `docs/AUDIT_PACKAGING.md`
- Primera ejecución verificada:
  - `~/Desktop/ebnjaOS_AUDIT_rev_01`
  - `~/Desktop/ebnjaOS_AUDIT_rev_01.zip`

## 2026-06-01 19:02

### Objetivos MVP — consolidación funcional
- Se unificó cálculo de Objetivos en utilidades compartidas (`src/lib/tracking.ts`):
  - `computeObjectiveDailyScore`
  - `computeObjectiveWeekSummary`
- Se eliminó duplicación de fórmula en Dashboard y página de Objetivos.
- Se dejó base explícita para próxima fase:
  - promedio semanal
  - completion rate semanal
  - días listos para streak (`>=80`)
- `Objetivos` mantiene persistencia local y feedback inmediato.

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-01 18:56

### Sprint 2.1A — Objetivos MVP
- Se mantuvo infraestructura interna de Tracking:
  - ruta `/tracking`
  - `TrackingPage`
  - persistencia `localStorage`
- Se actualizó experiencia visual a `Objetivos`:
  - Sidebar: `🎯 Objetivos` (misma ruta `/tracking`)
  - Página: Header `Objetivos` + `Score semanal`
  - Dashboard: card `Objetivos` con `General`, `Salud`, `Desarrollo`, `Familia`
- Se implementó sección `Familia` integrada con calendario:
  - Si el día corresponde a Benja (`owner = mine`), queda completado automáticamente.
- Se consolidó sección `Salud` para mostrar `Comidas` como objetivo único visual (manteniendo modelo interno granular).
- Se agregó documentación:
  - `docs/OBJECTIVES_MVP.md`
- Capturas generadas en carpeta incremental:
  - `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_05/screenshots/objectives-desktop.png`
  - `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_05/screenshots/objectives-mobile.png`
  - `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_05/screenshots/dashboard-objectives-card.png`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-05-30 21:05

### Sprint P0.5 — Clean Network Layer
- Implementado `NetworkStatusLayer`:
  - `src/services/sync/networkStatusLayer.ts`
- Implementado manejo silencioso:
  - `src/services/sync/backgroundErrorHandling.ts`
- Endurecido `githubCalendarSync`:
  - fuente principal desde GitHub Pages (`archivo_base.json`)
  - fallback a raw GitHub (`main/master`)
  - reducción de dependencia a `api.github.com` para evitar `403`
- Endurecido `supabaseSync`:
  - nueva guarda `canRunSupabaseQueries()`
  - sin sesión autenticada => no queries
- `syncManager` actualizado a ejecución silenciosa (sin romper UX).
- `Calendar` boot ajustado para no disparar sync agresivo en foreground.
- Documentación añadida:
  - `docs/NETWORK_LAYER_AUDIT.md`
  - `docs/FALLBACK_STRATEGY.md`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK
- `npm test`: no disponible (Missing script: `test`)
- Auditoría producción en `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_02`:
  - `console_errors = 0`
  - `runtime_errors = 0`
  - `failed_fetch = 0`
  - `failed_assets = 0`
  - `failed_api_calls = 10` (pendiente revalidar post-deploy)

## 2026-05-30 20:37

### Sprint 2.1A — Tracking Today MVP
- Tracking se consolidó en vista principal `Hoy`, sin heatmap/streaks/insights en este sprint.
- Se implementó score diario visible (0-100) con progreso de hábitos completados (`x / 11`).
- Se actualizó la estructura de hábitos:
  - Salud: Agua, Desayuno, Almuerzo, Snack, Cena, Proteína, Entrenamiento, Sueño.
  - Focus: PMP, PyMO, Music.
- Interacción por tap/click con toggle instantáneo y guardado automático en `localStorage`.
- Dashboard actualizado con card compacta de Tracking:
  - Score
  - Hábitos completados
- Se documentó implementación en `docs/TRACKING_TODAY_IMPLEMENTATION.md`.
- Se generaron capturas:
  - `tracking-today-desktop.png`
  - `tracking-today-mobile.png`
  - `dashboard-tracking-card.png`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK
- `npm test`: no disponible (Missing script: `test`)

## 2026-05-30 19:52

### P0 — GitHub Pages routing (404 = 0 en deep links)
- Se identificó causa raíz de 404 en rutas profundas bajo GitHub Pages estático.
- Se implementó solución de entradas estáticas por ruta para evitar 404 HTTP:
  - Nuevo script: `scripts/prepare-gh-pages-routes.mjs`
  - Integración en build: `package.json` (`vite build && node scripts/prepare-gh-pages-routes.mjs`)
- Se documentó auditoría y resolución en `docs/GITHUB_PAGES_ROOT_CAUSE.md`.

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK
- `npm run preview` + smoke rutas profundas: OK (200 en `/calendar`, `/tracking`, `/fitness`, `/tasks`, `/notes`, `/projects`, `/settings`)
- `npm test`: no disponible (Missing script: `test`)

### Deploy + reauditoría producción
- Push aplicado en `main` con commit `b46bf15`.
- Tras propagación de GitHub Pages, rutas críticas auditadas en producción con resultado `200`:
  - `/calendar`, `/tracking`, `/fitness`, `/tasks`, `/notes`, `/projects`, `/settings`
- Evidencia guardada en:
  - `docs/GITHUB_PAGES_ROOT_CAUSE.md`
  - `docs/github_pages_route_validation.json`

## 2026-05-30 11:22

### Ejecutado
- Se creó `src/components/layout/GlobalHeader.tsx` como Header Global reutilizable para toda la app.
- `AppLayout` ahora consume `GlobalHeader`, formalizando la capa de estado global en el header.
- Sidebar consolidado como navegación pura:
  - ancho `220px`
  - comportamiento sticky
  - sin estado operativo embebido.
- Se creó `src/components/dashboard/TetePremiumWidget.tsx` y se integró en Dashboard.
- Calendar mantiene puntos rojos Tete (`owner === "mine"`) y se eliminó texto repetitivo de eventos en tarjetas de próximos eventos (se quitó la repetición de `source`).
- Se mantiene orientación objetivo por módulo:
  - Sidebar = Navegación
  - Header = Estado global
  - Dashboard = Operación diaria
  - Calendar = Visibilidad Tete
  - Fitness = Acción inmediata

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

### QA Capturas
- Se generó paquete completo en: `~/Desktop/ebnjaOS_QA_154B`
- Total PNG: 66
- Cobertura: Desktop (1920/1512/1366), iPhone Pro Max, iPhone Pro, iPhone SE.

## 2026-05-30 11:55

### Ejecutado
- `AppLayout` ahora usa `AppHeader` como header global único para todos los módulos.
- Se consolidó estado de plataforma en el header (badge + popover), manteniendo sidebar como navegación pura.
- Dashboard se compactó para reducir altura total y concentrar operación diaria en bloque compacto.
- Fitness 2.0 abre por defecto en pestaña `Rutina` y expone ejercicios completos sin truncado.
- FAB móvil actualizado para safe area real y convivencia con bottom navigation.
- Se generó paquete final de capturas en `~/Desktop/ebnjaOS_UI_FREEZE` junto a `FREEZE_REPORT.md`.

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

### QA Freeze
- Carpeta: `~/Desktop/ebnjaOS_UI_FREEZE`
- Capturas totales: 72 PNG
- Capturas objetivo freeze: `home-desktop.png`, `calendar-desktop.png`, `fitness-desktop.png`, `home-mobile.png`, `calendar-mobile.png`, `fitness-mobile.png`

## 2026-05-30 11:58

### RC1 — UI Freeze and platform stabilization
- Se ejecutó auditoría técnica completa y se documentó en `docs/TECH_AUDIT.md`.
- Se ejecutó auditoría UX/UI responsive y se documentó en `docs/UI_AUDIT.md`.
- Se validó checklist funcional completo en `docs/FUNCTIONAL_CHECKLIST.md`.
- Se analizó performance de build y recomendaciones en `docs/PERFORMANCE_REPORT.md`.
- Se generaron release notes en `docs/RC1_RELEASE_NOTES.md`.
- Se generó paquete QA RC1 en `~/Desktop/ebnjaOS_RC1_QA` y `QA_REPORT.md`.
- Limpieza RC1:
  - Eliminados componentes huérfanos/legacy: `Header`, `GlobalHeader`, `HeroWidget`, `FocusWidget`.
  - Se mantiene arquitectura UI consolidada con `AppHeader`, Sidebar navegación pura y Fitness orientado a rutina visible.

### Validación final
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-05-30 12:01

### Fix crítico calendario Tete
- Se auditó la fuente oficial de `celeste_calendar` y se documentó en `docs/TETE_CALENDAR_AUDIT.md`.
- Se corrigió la representación mensual para usar estado oficial del endpoint (no derivado de eventos).
- Se reemplazó render de puntos rojos por fondos por día:
  - `owner === "mine"` → conmigo (`rgba(214,167,177,.35)`)
  - `owner === "hers"` → Tete (`rgba(231,212,133,.35)`)
- Se dejó `hoy` con outline amarillo.
- Se eliminó lógica heurística y simbología previa de puntos rojos.
- Se validó mayo 2026 automáticamente y se reportó en `docs/TETE_VALIDATION.md`.

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-05-30 13:33

### FASE 2.1 PREPARATION
- Sidebar reordenado según orden oficial:
  - Dashboard
  - Calendar
  - Fitness
  - Tracking
  - Tasks
  - Projects
  - Notes
  - Resources
  - Settings
- Renombre funcional Goals → Tracking:
  - Ruta oficial nueva: `/tracking`
  - Compatibilidad: `/goals` redirige a `/tracking`
  - Navegación y títulos actualizados al nuevo módulo.
- Estructura base de Tracking creada (sin estadísticas reales aún):
  - `TrackingHealthCard`
  - `TrackingGrowthCard`
  - `TrackingWeeklyScore`
  - `TrackingHeatmap`
  - `TrackingTrendChart`
- Se excluyó lógica Tete en Tracking (sin score/hábitos/métricas Tete).
- No se modificaron Dashboard ni Calendar en esta tarea.

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-05-30 14:00

### Sprint 2.1A — Tracking Engine MVP
- Tracking pasó de placeholders a módulo funcional de uso diario.
- Implementado engine local en `src/lib/tracking.ts` con persistencia `localStorage`.
- Implementado hook `useTrackingEngine` para acciones y selectores derivados.
- Tracking ahora incluye:
  - Vista Hoy (score + checklist interactivo)
  - Vista Semana (heatmap + tendencia)
  - Vista Salud (Agua, Comidas, Proteína, Entreno, Sueño)
  - Vista Focus (PMP, PyMO, Music)
- Se agregó card compacta “Tracking Hoy” en Dashboard.
- Se documentó en `docs/TRACKING_IMPLEMENTATION.md`.

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-05-30 19:12

### Background sync and non-blocking boot
- Eliminada pantalla de arranque bloqueante en `src/app/App.tsx`.
- Nuevo flujo de boot:
  1) render inmediato de UI
  2) sincronización en background vía `startBackgroundSync()`
- Nuevo motor de sync desacoplado en `src/services/sync/`:
  - `syncManager.ts`
  - `supabaseSync.ts`
  - `calendarSync.ts`
  - `githubSync.ts`
- Nuevo hook reutilizable: `src/hooks/useSyncStatus.ts`.
- `PlatformStatusBadge` actualizado para estados no bloqueantes:
  - `🟡 SINCRONIZANDO`
  - `🟢 ACTUALIZADO`
  - `🔴 ERROR`
- Auditoría técnica documentada en `docs/BOOT_AUDIT.md`.

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK
- `preview` smoke-check: sin pantalla "Cargando ebnjaOS..."

## 2026-05-30 19:16

### P0 — Fix GitHub Pages routing
- Verificada configuración de router/basename/base:
  - `src/app/router.tsx` usa `import.meta.env.BASE_URL`
  - `vite.config.ts` usa `base: "/ebnjaOS_beta/"`
- Implementado fallback SPA para GitHub Pages:
  - `public/404.html` captura deep links y redirige al root del proyecto
  - `index.html` restaura ruta original para React Router
- Documentado en `docs/GITHUB_ROUTING_FIX.md`.

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK
- `preview` localhost: `/`, `/calendar`, `/tracking` OK en desktop/iPhone

## 2026-06-02 21:45

### Sprint 2.3B.1 — Fitness Home Premium
- Se agregó una nueva portada premium para Fitness en `src/modules/fitness/page.tsx`.
- Nuevo componente reusable:
  - `src/components/fitness/FitnessHomePremium.tsx`
- La portada muestra:
  - Fitness Score
  - Recovery Score
  - Streak actual
  - Último entrenamiento
  - Sueño
  - Entrenamiento reciente
  - Próximo workout
- La implementación usa estado real ya persistido por ebnjaOS, sin mock data.
- Se documentó en `docs/FITNESS_HOME_PREMIUM.md`.

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-02 22:00

### Sprint 2.3B.2 — Fitness Consistency Layer
- Se integró una capa de consistencia visual para Fitness reutilizando componentes ya existentes de `Tracking`.
- Nuevos archivos:
  - `src/modules/fitness/fitnessConsistency.ts`
  - `src/components/fitness/FitnessConsistencyLayer.tsx`
- La capa muestra:
  - Heatmap 30 días
  - Streak actual
  - Mejor streak
  - Consistencia 30 días
  - Weekly Progress
  - Trend 30 días
- La implementación usa datos reales de `health_states` y `fitness_workouts` sin duplicar lógica.
- Se documentó en `docs/FITNESS_CONSISTENCY_LAYER.md`.

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-02 22:52

### Sprint 2.3C.3 — Trend Cards Premium
- Se añadió un bloque ejecutivo de 5 Trend Cards para Fitness:
  - Peso
  - Sueño
  - Proteína
  - Agua
  - Fuerza
- Cada card muestra:
  - valor actual
  - tendencia 30 días
  - variación
  - sparkline
- La implementación consume datos reales de:
  - `health_states`
  - `fitness_progress_logs`
  - `fitness_prs`
  - `fitness_body_metrics`
- Documentación añadida en `docs/TREND_CARDS_PREMIUM.md`.

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-02 22:46

### Sprint 2.3D — Fitness UX Audit
- Se realizó una auditoría visual completa del módulo Fitness para preparar UI Freeze v1.
- Se documentaron capturas y hallazgos en `docs/FITNESS_UX_AUDIT.md`.
- Resultado general:
  - Desktop: buena jerarquía, pero con scroll alto.
  - Mobile: sin overflow horizontal, pero con densidad elevada.
- Bloques marcados para revisión:
  - Recovery Intelligence
  - Heatmap
  - Trend Cards
  - PR Tracker

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-04 18:54

### Sprint 2.3E — Fitness UI Freeze V1
- Se cerraron los hallazgos abiertos de la auditoría visual de Fitness.
- Cambios aplicados:
  - Recovery Intelligence quedó unificado en una sola experiencia dedicada.
  - Heatmap adaptativo: compacto en historiales cortos y completo en historiales suficientes.
  - Trend Cards responsive: menos texto secundario en mobile.
  - PR Tracker colapsable para reducir densidad y scroll.
- Nueva documentación en `docs/FITNESS_UI_FREEZE_V1.md`.

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-04 19:08

### Sprint 2.4A — Apple Health Readiness
- Se auditó el soporte actual para Apple Health sin refactorizar la app.
- Resultado:
  - Sleep: parcialmente soportado
  - Weight: parcialmente soportado
  - Steps: soportado en modelo local, no en persistencia remota
  - HRV: faltante
  - Resting HR: faltante
  - Workouts: soportado
- Se documentaron:
  - gaps
  - migraciones SQL necesarias
  - bridge Apple Health futuro
- Nuevos docs:
  - `docs/APPLE_HEALTH_READINESS_AUDIT.md`
  - `docs/APPLE_HEALTH_BRIDGE.md`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-05 23:09

### Fix — undefined health state guard
- `getHealthDay()` now tolerates an undefined `HealthFoundationState` and returns a safe empty record instead of reading `daily[date]` directly.
- This closes the remaining production crash path surfaced on GitHub Pages when the health snapshot is not fully hydrated yet.

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-05 23:04

### Fix — GitHub Pages crash guard
- Se endureció la normalización de `health_states` para aceptar payloads remotos incompletos o legacy sin romper el render.
- Se protegieron accesos directos a `daily[...]` y `daysByDate[...]` con fallbacks seguros.
- Se mantuvo la experiencia del dashboard y del fitness, evitando el `Unexpected Application Error` observado en GitHub Pages.

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-05 10:37

### Sprint 3.3A — Supabase DEV Sync
- Se agregó la capa `Health_ebnjaOS/HealthKit/` para sincronización DEV con Supabase:
  - `SupabaseConfig.swift`
  - `SupabaseService.swift`
  - `SyncManager.swift`
  - `HealthSyncModels.swift`
  - `HealthSyncNormalizer.swift`
- `HealthKitManager` ahora expone un `HealthSyncSnapshot` listo para normalización y sync remoto.
- `ContentView` incorporó un bloque de `Sync Status` con:
  - `Never Synced`
  - `Syncing`
  - `Success`
  - `Error`
- La configuración de Supabase se resuelve desde:
  - Environment
  - Info.plist
  - sin hardcodear credenciales
- El sync usa upsert idempotente con:
  - `external_id`
  - `external_updated_at`

### Validación
- `xcodebuild ... build`: OK
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-04 19:31

### Sprint 2.4B — Apple Health Data Foundation
- Se creó la capa `src/lib/health/appleHealth/` con:
  - `AppleHealthImportPayload.ts`
  - `HealthMetricsNormalizer.ts`
  - `AppleHealthImportRepository.ts`
- La capa deja listo el contrato de importación para Apple Health sin tocar Swift/iOS/HealthKit todavía.
- Permite:
  - normalizar payloads diarios
  - cachear imports en localStorage
  - aplicar la importación a la Health Foundation existente

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK

## 2026-06-04 19:37

### Sprint 2.4C — Historical Backfill Foundation
- Se creó `src/lib/health/appleHealth/AppleHealthBackfillService.ts`.
- El servicio soporta rango arbitrario:
  - `startDate`
  - `endDate`
- Prepara datasets para:
  - Sleep
  - Weight
  - Steps
  - HRV
  - Resting HR
  - Workouts
- La importación evita duplicados con `sourceId` y `externalUpdatedAt`.
- Nueva documentación:
  - `docs/APPLE_HEALTH_BACKFILL.md`

### Validación
- `npm run build`: OK
- `npm run lint`: OK
- `npm run typecheck`: OK
