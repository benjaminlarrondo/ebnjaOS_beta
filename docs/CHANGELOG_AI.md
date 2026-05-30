# CHANGELOG_AI.md

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
