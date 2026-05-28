# NEXT_TASK.md

## Objetivo
Ordenar la vista "Más" en bloques claros y priorizados.

## Instrucciones
1. Revisar:
   - `src/modules/settings/page.tsx`
   - `src/lib/navigation.ts`

2. Reordenar la vista en esta jerarquía:
   - Módulos secundarios
   - Estado / sincronización
   - Backup
   - Mantenimiento / diagnóstico

3. Restricciones:
   - no cambiar lógica de negocio
   - no instalar dependencias
   - no romper rutas existentes
   - mantener estilo visual actual

4. Validar:
   - `npm run build`
   - `npm run lint`
   - `npm run typecheck`

5. Actualizar:
   - `docs/STATUS.md`
   - `docs/CHANGELOG_AI.md`

## Resultado esperado
- "Más" queda más claro.
- Los ajustes técnicos no compiten con los módulos.
- La vista queda lista para futuras integraciones.
