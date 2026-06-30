# DATA_OWNERSHIP_MATRIX

## Fecha
2026-06-07 11:24

## Estado ejecutivo
🟡 PARTIAL

## Matriz actual

| Dominio | Ownership objetivo | Estado actual |
|---|---|---|
| Fitness Data | Supabase | READY |
| Brain Data | Supabase | PARTIAL |
| Health Metrics | HealthKit + Supabase snapshots | PARTIAL |
| Calendar Events | Apple Calendar | PARTIAL |
| TETE | Calendar Celeste → Supabase | READY |
| Backups | iCloud | PARTIAL |

## Fecha
2026-06-07 11:14

## Regla principal
- Supabase es la fuente única de verdad del sistema.
- iCloud queda para backup / exportación / recuperación.
- HealthKit y EventKit son fuentes de origen externas.

## Matriz

| Dominio | Ownership objetivo | Estado actual | Observación |
|---|---|---|---|
| Fitness Data | Supabase | READY | Programs, workout days, exercises, sessions, sets, PRs y progress snapshots ya tienen persistencia remota. |
| Brain Data | Supabase | PARTIAL | Notes se sincronizan, pero goals/projects aún dependen de store/localStorage. |
| Health Metrics | HealthKit + Supabase snapshots | PARTIAL | El pipeline y snapshots existen; falta la validación física en iPhone. |
| Calendar Events | Apple Calendar / EventKit | PARTIAL | La vista Agenda es contextual y la ruta existe, pero la validación física de EventKit no quedó cerrada aquí. |
| TETE | Calendar Celeste → Supabase | READY | La capa de resumen contextual está alineada al endpoint existente. |
| Backups | iCloud | PARTIAL | Hay export/import local; iCloud como backup real aún queda para la fase nativa. |

## Nota de auditoría
- El sistema web ya presenta una separación razonable entre dominio y UI.
- La principal deuda de ownership está en Brain y en la verificación física de Calendar / HealthKit.
