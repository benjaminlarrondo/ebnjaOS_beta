# SUPABASE_PERSISTENCE_VALIDATION.md

## Objetivo
Validar en ejecución real que Persistence Foundation funciona contra Supabase para Tracking, Health y Calendar.

## Entorno validado
- Producción: `https://benjaminlarrondo.github.io/ebnjaOS_beta/`
- Evidencia técnica:
  - `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_10/supabase_persistence_validation.json`
  - `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_10/localStorage-chromium.json`
  - `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_10/localStorage-webkit.json`

## 1) Validar tablas

### `tracking_states`
- Resultado: **404**
- Mensaje: `Could not find the table 'public.tracking_states' in the schema cache`
- Estado: ❌ no disponible en proyecto Supabase actual

### `health_states`
- Resultado: **404**
- Mensaje: `Could not find the table 'public.health_states' in the schema cache`
- Estado: ❌ no disponible en proyecto Supabase actual

### `calendar_events`
- Resultado: **200**
- Estado: ✅ existe y accesible

### Índices / RLS
- `pg_indexes` vía anon REST: **404** (no expuesto en schema cache)
- Verificación directa de índices/policies no posible con anon key por REST.
- Inferencia de RLS: consistente con scripts SQL y comportamiento de acceso por `user_id`.

## 2) Validar escritura Tracking
Acción realizada en producción (UI Tracking):
- Agua `+500ml`
- Proteína `+25g`
- Sueño `7.5`

Resultado:
- localStorage tracking: ✅ actualizado
- Supabase `tracking_states`: ❌ no actualiza (tabla inexistente)

## 3) Validar Health
Acción realizada en producción (misma UI):
- Water/Protein/Sleep ajustados

Resultado:
- localStorage health: ✅ actualizado (`water_ml`, `protein_g`, `sleep_hours`)
- Supabase `health_states`: ❌ no actualiza (tabla inexistente)

## 4) Validar Calendar
Validación `CalendarDomainStore` → `calendar_events`:
- `calendar_events` consulta remota: ✅ OK
- datos github disponibles y consistentes en muestra (`source=github`, `source_id`, `metadata.owner`)

## 5) Validar multi navegador
- Chromium: ✅ ejecutado
- Safari nativo (WebKit): ⚠️ no disponible en entorno (falta binario Playwright WebKit)
- Fallback aplicado: validación “Safari-like” por user-agent en Chromium.

Resultado:
- tracking local cargó en ambos contextos (Chromium + Safari-like)
- health local en Safari-like no mostró el mismo valor esperado en esta corrida (sin evidencia de pull remoto por tablas faltantes)

## 6) Validar producción (lectura/escritura/sync)
- Lectura: ✅ Tracking/Calendar cargan
- Escritura:
  - Tracking/Health remoto: ❌ (tablas 404)
  - Calendar remoto: ✅
- Sync:
  - Tracking/Health: ❌ no materializa remoto por ausencia de tablas

## Qué funciona
1. Producción carga y opera UI sin errores visibles.
2. `calendar_events` remoto funciona.
3. Persistencia local (`localStorage`) para Tracking/Health funciona.

## Qué no funciona
1. Persistencia remota de Tracking no funciona (`tracking_states` inexistente).
2. Persistencia remota de Health no funciona (`health_states` inexistente).
3. Validación fuerte multi-browser Safari nativo no pudo ejecutarse en este entorno.

## Riesgos
1. Falsa sensación de “sync completo” cuando en realidad Tracking/Health quedan solo locales.
2. Drift entre dispositivos para Tracking/Health.
3. Cobertura parcial de validación cross-browser (Safari real pendiente).

## Veredicto final
🔴 **BLOCKED**

## Causa raíz de bloqueo
No se ha aplicado en Supabase la migración de foundation que crea:
- `tracking_states`
- `health_states`

## Acción mínima para desbloquear
Ejecutar en Supabase:
- `supabase/persistence_foundation.sql`

Luego revalidar este checklist end-to-end.
