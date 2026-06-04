# APPLE_HEALTH_BACKFILL

## Objetivo
Preparar la importación histórica Apple Health sin Swift ni HealthKit.

## Qué resuelve
- Importación de rango arbitrario:
  - `startDate`
  - `endDate`
- Preparación de datasets:
  - Sleep
  - Weight
  - Steps
  - HRV
  - Resting HR
  - Workouts
- Evita duplicados con:
  - `external_id`
  - `external_updated_at`

## Capa implementada
- `src/lib/health/appleHealth/AppleHealthBackfillService.ts`

## Flujo
Apple Health Backfill Service  
↓  
Apple Health Import Batch  
↓  
Apple Health Import Repository  
↓  
Health Foundation  
↓  
Supabase-ready state

## Destinos
- `health_states`
- `fitness_body_metrics`
- `fitness_workouts`

## Estrategia anti-duplicados
- Cada sample recibe `sourceId` estable.
- Cada sample recibe `externalUpdatedAt`.
- El backfill mergea por fecha y conserva el registro con timestamp más nuevo.

## Veredicto
- La base ya queda lista para importar histórico, pero la fuente Apple Health real todavía no está conectada.

## Readiness
- **PARTIAL**
