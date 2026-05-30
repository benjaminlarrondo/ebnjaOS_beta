# CHANGELOG_AI.md

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
