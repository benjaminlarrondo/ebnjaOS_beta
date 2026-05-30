# TRACKING_MIGRATION_PLAN.md

## Fase 1 — Eliminar duplicidades

- Mantener `/goals -> /tracking` como compatibilidad temporal.
- Identificar y listar todos los consumidores de `lib/goals`.
- Congelar nuevas mejoras en `modules/goals` para evitar divergencia.
- Unificar nomenclatura de producto hacia Tracking en navegación y copy operativo.

## Fase 2 — Consolidar Tracking

- Crear modelo de dominio Tracking (salud + growth).
- Implementar capa base:
  - hooks de tracking
  - store de tracking
  - tipos de tracking
- Conectar `src/modules/tracking/page.tsx` a datos reales (reemplazar placeholders).
- Reapuntar Dashboard/Settings al dominio Tracking.

## Fase 3 — Implementar Tracking Engine

- Implementar motor de hábitos y scoring:
  - adherencia semanal
  - adherencia mensual
  - score salud
  - score growth
- Implementar series temporales para heatmap/trend chart.
- Definir integraciones futuras (eventos, fitness, agenda inteligente) sin reintroducir duplicidad.

---

## Árbol resumido (estado actual)

Tracking
├── Componentes
│   ├── TrackingHealthCard
│   ├── TrackingGrowthCard
│   ├── TrackingWeeklyScore
│   ├── TrackingHeatmap
│   └── TrackingTrendChart
├── Hooks
│   └── (pendiente / no definido aún)
├── Store
│   └── (pendiente / no definido aún)
├── Tipos
│   └── (pendiente / no definido aún)
└── Integraciones
    ├── Router: /tracking (activo)
    ├── Compatibilidad: /goals -> /tracking
    └── Datos legacy: lib/goals (aún vigente en dashboard/settings)
