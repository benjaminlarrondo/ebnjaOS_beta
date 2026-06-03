# STATUS.md

## Fecha
2026-06-02 01:30

## Tarea ejecutada
Sprint 2.2E — Navigation Simplification: sidebar reducido a `Dashboard / Calendar / Goals / Fitness / Workspace / Settings`, con `Workspace` agrupando Projects/Tasks/Notes/Resources.

## Archivos modificados
- src/lib/navigation.ts
- src/components/layout/Sidebar.tsx
- src/components/layout/AppHeader.tsx
- src/app/router.tsx
- src/modules/tracking/page.tsx
- src/components/dashboard/TrackingTodayWidget.tsx
- src/modules/workspace/page.tsx
- docs/NAVIGATION_SIMPLIFICATION.md
- docs/STATUS.md
- docs/CHANGELOG_AI.md

## Comandos ejecutados
- npm run build - OK
- npm run lint - OK
- npm run typecheck - OK

## Validación
- Build: OK
- Lint: OK
- Typecheck: OK

## Errores o riesgos
- `Settings` quedó fuera de la navegación móvil principal y depende del acceso desde el header.
- `Tracking` sigue existiendo como ruta interna `/tracking` aunque la etiqueta visible pasó a `Goals`.

## Próximo paso sugerido
- Validar visualmente desktop/mobile y dejar el paquete `rev_06` listo para auditoría externa.

## Fecha
2026-06-02 00:00

## Tarea ejecutada
Sprint 2.2D — Root Cause Fix (Supabase First): eliminación de snapshots stale en health/tracking, consumo de estado hidratado en Dashboard/Fitness y validación de write/reload/cross-browser.

## Archivos modificados
- src/hooks/useTrackingEngine.ts
- src/hooks/useHealthState.ts
- src/lib/repositories/healthRepository.ts
- src/modules/dashboard/page.tsx
- src/modules/fitness/page.tsx
- docs/ROOT_CAUSE_FIX.md
- docs/SUPABASE_FIRST_FINAL_VALIDATION.md
- docs/STATUS.md
- docs/CHANGELOG_AI.md

## Comandos ejecutados
- npm run build - OK
- npm run lint - OK
- npm run typecheck - OK

## Validación
- Build: OK
- Lint: OK
- Typecheck: OK

## Errores o riesgos
- Riesgo residual bajo: si se reintroducen lecturas directas de `loadHealthState()` o writes absolutos desde render, la regresión puede volver.

## Próximo paso sugerido
- Continuar con el siguiente sprint (`Fitness 2.0`) manteniendo `Supabase = source of truth`.

## Fecha
2026-06-02 21:45

## Tarea ejecutada
Sprint 2.3B.1 — Fitness Home Premium: nueva portada premium de Fitness con hero/recovery/next workout sin datos ficticios.

## Archivos modificados
- src/modules/fitness/page.tsx
- src/components/fitness/FitnessHomePremium.tsx
- docs/FITNESS_HOME_PREMIUM.md
- docs/STATUS.md
- docs/CHANGELOG_AI.md

## Comandos ejecutados
- npm run build - OK
- npm run lint - OK
- npm run typecheck - OK

## Validación
- Build: OK
- Lint: OK
- Typecheck: OK

## Errores o riesgos
- La portada premium sigue apoyándose en el estado local/sincronizado actual; si no hay historial todavía, los bloques se muestran en estado vacío explícito.

## Próximo paso sugerido
- Conectar más profundamente la portada a métricas de progreso si el siguiente sprint lo requiere.

## Fecha
2026-06-02 22:00

## Tarea ejecutada
Sprint 2.3B.2 — Fitness Consistency Layer: heatmap, streaks, weekly progress y trend reutilizando componentes de Tracking.

## Archivos modificados
- src/modules/fitness/page.tsx
- src/modules/fitness/fitnessConsistency.ts
- src/components/fitness/FitnessConsistencyLayer.tsx
- docs/FITNESS_CONSISTENCY_LAYER.md
- docs/STATUS.md
- docs/CHANGELOG_AI.md

## Comandos ejecutados
- npm run build - OK
- npm run lint - OK
- npm run typecheck - OK

## Validación
- Build: OK
- Lint: OK
- Typecheck: OK

## Errores o riesgos
- La consistencia depende del histórico de `fitness_workouts` y del estado de `health_states`; si no existen días suficientes, la vista puede mostrar streaks cortos o cero.

## Próximo paso sugerido
- Ejecutar build/lint/typecheck y revisar capturas de Fitness con la nueva capa de consistencia.

## Fecha
2026-06-02 22:11

## Tarea ejecutada
Fix de producción para `calendar_events`: se eliminó `domainHash` del payload enviado a Supabase y se mantuvo solo como metadato local.

## Archivos modificados
- src/lib/repositories/calendarRepository.ts
- docs/STATUS.md
- docs/CHANGELOG_AI.md

## Comandos ejecutados
- npm run build - OK
- npm run lint - OK
- npm run typecheck - OK

## Validación
- Build: OK
- Lint: OK
- Typecheck: OK

## Errores o riesgos
- El 400 de `calendar_events` debería desaparecer tras el deploy; si persiste, el esquema remoto podría estar desalineado con la migración.

## Próximo paso sugerido
- Push a `main` y revalidar GitHub Pages para confirmar que el console error 400 quedó resuelto.

## Fecha
2026-06-02 22:21

## Tarea ejecutada
Sprint 2.3C.1A — Fitness Information Architecture: reorden visual de Fitness priorizando Score, Rings, Streak, Heatmap, Trends y PR Tracker.

## Archivos modificados
- src/modules/fitness/page.tsx
- src/components/fitness/FitnessActivityRings.tsx
- src/components/fitness/FitnessConsistencyLayer.tsx
- docs/FITNESS_INFORMATION_ARCHITECTURE.md
- docs/STATUS.md
- docs/CHANGELOG_AI.md

## Comandos ejecutados
- npm run build - OK
- npm run lint - OK
- npm run typecheck - OK

## Validación
- Build: OK
- Lint: OK
- Typecheck: OK

## Errores o riesgos
- El PR Tracker queda al final del historial, por lo que su visibilidad inicial baja a favor de las métricas principales.

## Próximo paso sugerido
- Correr validación y revisar la composición visual en producción si hace falta ajustar contraste o espaciado.

## Fecha
2026-06-02 22:24

## Tarea ejecutada
Sprint 2.3C.2 — Recovery Intelligence: Recovery Score convertido en recomendación basada en sueño y carga reciente.

## Archivos modificados
- src/modules/fitness/fitnessMetrics.ts
- src/components/fitness/RecoveryCard.tsx
- src/components/fitness/FitnessHomePremium.tsx
- src/modules/fitness/page.tsx
- docs/RECOVERY_INTELLIGENCE.md
- docs/STATUS.md
- docs/CHANGELOG_AI.md

## Comandos ejecutados
- npm run build - OK
- npm run lint - OK
- npm run typecheck - OK

## Validación
- Build: OK
- Lint: OK
- Typecheck: OK

## Errores o riesgos
- La recomendación depende de la calidad del estado de `health_states` y del histórico de `fitness_workouts`; si faltan datos, el sistema tiende a degradar a `Fatigado`.

## Próximo paso sugerido
- Validar build/lint/typecheck y revisar el bloque de Recovery en Fitness.

## Fecha
2026-06-02 22:31

## Tarea ejecutada
Sprint 2.3C.2 — Recovery Intelligence: score accionable 40/30/15/15 con estado, recomendación y métricas de sueño/carga/nutrición/consistencia.

## Archivos modificados
- src/modules/fitness/fitnessMetrics.ts
- src/components/fitness/RecoveryCard.tsx
- src/components/fitness/FitnessHomePremium.tsx
- src/modules/dashboard/page.tsx
- src/modules/fitness/page.tsx
- docs/RECOVERY_INTELLIGENCE.md
- docs/STATUS.md
- docs/CHANGELOG_AI.md

## Comandos ejecutados
- npm run build - OK
- npm run lint - OK
- npm run typecheck - OK

## Validación
- Build: OK
- Lint: OK
- Typecheck: OK

## Errores o riesgos
- La consistencia depende del histórico real de workouts y logs; si falta historia, la recomendación tiende a ser conservadora.

## Próximo paso sugerido
- Revisar visualmente Recovery en producción para confirmar el estado/recomendación.

## Fecha
2026-06-02 22:52

## Tarea ejecutada
Sprint 2.3C.3 — Trend Cards Premium: 5 tarjetas ejecutivas para Peso, Sueño, Proteína, Agua y Fuerza con tendencia 30 días y sparkline real.

## Archivos modificados
- src/modules/fitness/fitnessTrends.ts
- src/components/fitness/FitnessTrendCards.tsx
- src/modules/fitness/page.tsx
- docs/TREND_CARDS_PREMIUM.md
- docs/STATUS.md
- docs/CHANGELOG_AI.md

## Comandos ejecutados
- npm run build - OK
- npm run lint - OK
- npm run typecheck - OK

## Validación
- Build: OK
- Lint: OK
- Typecheck: OK

## Errores o riesgos
- La card de Fuerza depende de que existan PRs en `ebnjaos-fitness-pr-v1`; si no hay historial, cae a cargas registradas y puede mostrarse más conservadora.

## Próximo paso sugerido
- Hacer un pase visual en Fitness para ajustar densidad y asegurar que las Trend Cards se leen bien en mobile.

## Fecha
2026-06-02 22:46

## Tarea ejecutada
Sprint 2.3D — Fitness UX Audit: auditoría visual completa para preparar UI Freeze v1.

## Archivos modificados
- docs/FITNESS_UX_AUDIT.md
- docs/STATUS.md
- docs/CHANGELOG_AI.md

## Comandos ejecutados
- npm run build - OK
- npm run lint - OK
- npm run typecheck - OK

## Validación
- Build: OK
- Lint: OK
- Typecheck: OK

## Errores o riesgos
- La densidad de Fitness sigue siendo alta en mobile; Heatmap, Trend Cards y PR Tracker requieren compactación antes del freeze.

## Próximo paso sugerido
- Reducir duplicidad entre portada premium y tabs, y compactar los bloques más largos para UI Freeze v1.
