# NAVIGATION_SIMPLIFICATION.md

## Fecha
2026-06-02

## Objetivo
Simplificar la navegación principal de ebnjaOS sin tocar persistencia, Supabase ni tablas.

## Mapa anterior
- `Inicio` -> `/`
- `Calendario` -> `/calendar`
- `Fitness` -> `/fitness`
- `Objetivos` -> `/tracking`
- `Tareas` -> `/tasks`
- `Proyectos` -> `/projects`
- `Notas` -> `/notes`
- `Recursos` -> `/resources`
- `Ajustes` -> `/settings`

## Mapa nuevo
- `Dashboard` -> `/`
- `Calendar` -> `/calendar`
- `Goals` -> `/tracking`
- `Fitness` -> `/fitness`
- `Workspace` -> `/workspace`
- `Settings` -> `/settings`

## Workspace interno
- `Projects` -> `/projects`
- `Tasks` -> `/tasks`
- `Notes` -> `/notes`
- `Resources` -> `/resources`

## Cambios aplicados
- `src/lib/navigation.ts`
  - renombre visual `Tracking -> Goals`
  - creación de `Workspace`
  - ocultación de `Tasks`, `Projects`, `Notes`, `Resources` del sidebar principal
  - `Settings` queda visible en sidebar y accesible desde header
- `src/components/layout/Sidebar.tsx`
  - simplificación del sidebar a seis entradas
- `src/components/layout/AppHeader.tsx`
  - acceso directo a `/settings` desde el icono de engranaje
- `src/app/router.tsx`
  - nueva ruta `/workspace`
- `src/modules/tracking/page.tsx`
  - título visible `Goals`
- `src/components/dashboard/TrackingTodayWidget.tsx`
  - card de dashboard alineada con `Goals`

## Capturas
- Desktop
  - `~/Desktop/ebnjaOS_AUDIT_rev_06/screenshots/desktop/dashboard-desktop.png`
  - `~/Desktop/ebnjaOS_AUDIT_rev_06/screenshots/desktop/goals-desktop.png`
  - `~/Desktop/ebnjaOS_AUDIT_rev_06/screenshots/desktop/workspace-desktop.png`
- Mobile
  - `~/Desktop/ebnjaOS_AUDIT_rev_06/screenshots/mobile/dashboard-mobile.png`
  - `~/Desktop/ebnjaOS_AUDIT_rev_06/screenshots/mobile/goals-mobile.png`
  - `~/Desktop/ebnjaOS_AUDIT_rev_06/screenshots/mobile/workspace-mobile.png`

## Riesgos
- `Tracking` sigue existiendo como ruta interna `/tracking`; solo cambia la nomenclatura visible a `Goals`.
- `Settings` quedó fuera de la navegación móvil principal y depende del acceso desde header.
- `Workspace` es una capa de agrupación visual; las rutas internas siguen vivas y accesibles.

## Readiness para Fitness 2.0
🟢 READY

Motivo:
- la navegación principal quedó más compacta
- `Workspace` agrupa el trabajo operativo
- `Fitness` queda aislado como módulo principal sin ruido lateral
