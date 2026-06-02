# MULTI_DEVICE_VALIDATION.md

## Alcance
Validación de persistencia cruzada para estado de Tracking/Health con Supabase como fuente principal.

## Evidencia disponible
- `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_12/supabase_first_validation.json`
- Contiene verificación de:
  - escritura desde contexto writer.
  - lectura desde contexto reader desktop.
  - lectura desde contexto mobile emulado.
  - verificación de tablas `tracking_states`, `health_states`, `calendar_events`.

## Resultado observado
- Conectividad y lectura remota: **OK**.
- Escritura remota: **OK**.
- Persistencia cross-context: **OK** en la corrida registrada.

## Observación crítica
- La corrida previa mostró señales de posible overwrite en `water_ml`/`sleep_hours` en interacciones rápidas.
- Se aplicó mitigación en `useTrackingEngine` mediante serialización de mutaciones.

## Estado de validación actual
🟡 PARTIAL

## Qué falta para 🟢 READY
1. Re-ejecutar prueba obligatoria post-fix:
   - Navegador A: set `Agua = 3000 ml`.
   - Navegador B limpio: validar mismo valor.
   - iPhone físico: validar mismo valor.
   - Reload + deploy GitHub Pages: validar persistencia idéntica.
2. Adjuntar capturas/JSON de esa corrida final en `rev_XX`.

## Riesgos
- Escrituras concurrentes desde múltiples dispositivos con latencia alta.
- Degradación offline sin reconciliación fina por campo.
