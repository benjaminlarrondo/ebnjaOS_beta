# NEXT_TASK.md

## Objetivo

Centralizar definicion de modulos y navegacion en una unica fuente reutilizable para evitar duplicacion futura entre sidebar, mobile nav, dashboard y quick actions.

## Instrucciones

1. Revisar:
   - MobileBottomNav
   - Sidebar
   - dashboard/page.tsx
   - QuickActionsCard
   - estructura actual de rutas

2. Crear una definicion central reutilizable:
   - labels
   - iconos
   - rutas
   - categoria principal/secundaria
   - visibilidad mobile

3. Refactorizar componentes para consumir esa definicion compartida.

4. Restricciones:
   - no cambiar logica de negocio
   - no instalar dependencias
   - no romper rutas existentes
   - mantener apariencia visual actual

5. Validar:
   - npm run build
   - npm run lint
   - npm run typecheck

6. Actualizar:
   - docs/STATUS.md
   - docs/CHANGELOG_AI.md

## Resultado esperado

- Navegacion centralizada.
- Menos duplicacion.
- Facil agregar modulos futuros.
- Base correcta para escalar ebnjaOS.
