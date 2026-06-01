# HEALTH_FOUNDATION.md

## Sprint
`2.2 — Health Foundation`

## Objetivo
Crear una capa unificada de salud para ebnjaOS con persistencia local y arquitectura preparada para integración futura con Apple Health, sin modificar UI de Dashboard ni Objetivos.

## Estructura creada

### `src/lib/health/healthTypes.ts`
Define contratos unificados:
- entidades: `Water`, `Protein`, `Sleep`, `Workout`, `Weight`, `Activity`
- métricas:
  - `water_ml`
  - `protein_g`
  - `sleep_hours`
  - `weight_kg`
  - `workouts_count`
  - `steps_count`
- tipos de estado:
  - `HealthDailyRecord`
  - `HealthFoundationState`
  - `HealthImportPayload`
  - `AppleHealthPort`

### `src/lib/health/healthMetrics.ts`
Catálogo base y utilidades:
- `healthMetricDefinitions`
- `HEALTH_LAYER_KEY`
- helpers:
  - `nowIso`
  - `toDateKey`
  - `makeEmptyHealthDay`
  - `clampPct`

### `src/lib/health/healthStore.ts`
Motor de estado + persistencia:
- `loadHealthState`
- `saveHealthState`
- `getHealthDay`
- `upsertHealthDay`
- `addHealthValue`
- `hydrateFromCurrentModules`
- `applyHealthImportPayload`
- `buildDashboardModels`
- `appleHealthPortPlaceholder` (preparación futura)

## Persistencia
- `localStorage`
- Key: `ebnjaos-health-foundation-v1`
- Estado versionado: `v1`

## Preparación para migración futura
La capa queda lista para que Objetivos/otros módulos lean directamente:
- agua
- proteína
- sueño

Actualmente también soporta:
- peso
- entrenamientos
- pasos

## Dashboard readiness (sin cambios visuales)
Se preparan modelos de dominio para:
- `Sleep`
- `Protein`
- `Workout`
- `Recovery`

Campo: `dashboardModels` dentro de `HealthFoundationState`.

## Compatibilidad
Se mantiene archivo puente:
- `src/lib/healthFoundation.ts`

Reexporta la API nueva para no romper imports previos.

## Apple Health (no implementado)
Solo se define el puerto de integración:
- `AppleHealthPort`
- `appleHealthPortPlaceholder`

Sin permisos, sin sync real, sin dependencias nativas aún.
