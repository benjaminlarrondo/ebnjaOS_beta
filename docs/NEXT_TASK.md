# NEXT_TASK.md

## Objetivo

Crear un sistema visual común para widgets del dashboard y eliminar inconsistencias visuales.

## Instrucciones

1. Revisar:
   - src/components/dashboard/*
   - src/components/cards/*
   - estilos globales

2. Crear componentes reutilizables:
   - WidgetCard
   - WidgetHeader
   - WidgetMetric
   - WidgetAction

3. Refactorizar widgets actuales para usar esos componentes.

4. Mantener:
   - apariencia actual
   - navegación actual
   - lógica actual

5. Priorizar:
   - consistencia visual
   - spacing uniforme
   - títulos uniformes
   - métricas uniformes
   - acciones uniformes

6. No instalar dependencias.

7. Validar:
   - npm run build
   - npm run lint
   - npm run typecheck

8. Actualizar:
   - docs/STATUS.md
   - docs/CHANGELOG_AI.md

## Resultado esperado

- Todos los widgets comparten el mismo lenguaje visual.
- Menos duplicación.
- Base preparada para futuros widgets.
