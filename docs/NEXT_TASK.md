# NEXT_TASK.md

## Objetivo
Convertir "Más" en un hub real de módulos secundarios usando la fuente central `src/lib/navigation.ts`.

## Instrucciones
1. Revisar:
   - `src/lib/navigation.ts`
   - `src/components/layout/MobileBottomNav.tsx`
   - `src/modules/settings/page.tsx`
   - rutas disponibles

2. Implementar:
   - sección clara de módulos secundarios en Settings o vista equivalente
   - consumir `appModules` o lista derivada desde `navigation.ts`
   - mantener estilo visual actual
   - no romper rutas existentes

3. Restricciones:
   - no cambiar lógica de negocio
   - no instalar dependencias
   - no borrar rutas
   - cambios pequeños y verificables

4. Validar:
   - `npm run build`
   - `npm run lint`
   - `npm run typecheck`

5. Actualizar:
   - `docs/STATUS.md`
   - `docs/CHANGELOG_AI.md`

## Resultado esperado
- "Más" deja de ser solo ajustes.
- Módulos secundarios quedan visibles.
- Navegación escala desde fuente central.
