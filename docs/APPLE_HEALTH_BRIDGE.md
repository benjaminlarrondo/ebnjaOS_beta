# APPLE_HEALTH_BRIDGE

## Objetivo
Definir el puente de datos para integrar Apple Health más adelante sin reescribir la app.

## Arquitectura propuesta
Apple Health  
↓  
Apple Health Bridge  
↓  
HealthImportPayload  
↓  
HealthFoundation / Repositories  
↓  
Supabase (`health_states`, `fitness_body_metrics`)  
↓  
UI

## Principios
- No implementar Swift / iOS / HealthKit todavía.
- Mantener la UI actual intacta.
- Usar un contrato canónico de importación.
- Reconciliar por `date + source + external_id`.
- Permitir cache local solo como respaldo.

## Contrato de importación
El bridge debe emitir un payload por día con:
- `date`
- `waterMl`
- `proteinG`
- `sleepHours`
- `weightKg`
- `stepsCount`
- `hrvMs`
- `restingHr`
- `workoutsCount`

## Fuente canónica recomendada
- `health_states` para métricas diarias unificadas.
- `fitness_body_metrics` para métricas de cuerpo/recuperación.
- `fitness_workouts` para sesiones y entrenamiento.

## Estrategia de reconciliación
- `date` como clave base.
- `external_id` para evitar duplicados.
- `updated_at` / `external_updated_at` para resolver conflictos.
- `metadata` para guardar origen Apple Health sin contaminar la UI.

## Flujo futuro
1. iPhone lee Apple Health.
2. Bridge transforma a payload canónico.
3. Repository hace upsert remoto.
4. Store hidrata la UI.
5. Dashboard/Fitness consumen solo el estado normalizado.

## Riesgos
- Duplicación si no se definen bien `external_id` y `source`.
- Diferencias de timezone en `date`.
- Conflictos entre cache local y remoto si no se usa `updated_at`.

## Go / No-Go
- **GO para preparar backend y contratos.**
- **NO-GO para implementar Apple Health real** hasta que existan las migraciones y el bridge canónico.
