# NEXT_TASK.md

## Objetivo

Refactorizar Home para usar un sistema de widgets reutilizables.

## Instrucciones

1. Revisar:
   - src/modules/dashboard/page.tsx
   - src/components/cards/*
   - estructura actual del dashboard

2. Extraer widgets:
   - HeroWidget
   - DayStatusWidget
   - FitnessWidget
   - CalendarWidget
   - FocusWidget
   - InsightsWidget
   - QuickActionsWidget

3. Crear carpeta:

src/components/dashboard/

4. Mantener:
   - apariencia actual
   - navegación actual
   - lógica existente

5. No instalar dependencias.

6. Validar:
   - npm run build
   - npm run lint
   - npm run typecheck

7. Actualizar:
   - docs/STATUS.md
   - docs/CHANGELOG_AI.md

## Resultado esperado

- Dashboard modular.
- Widgets independientes.
- Base preparada para futuras integraciones.
