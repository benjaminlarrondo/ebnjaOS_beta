# OFFLINE_SYNC_AUDIT

## Fecha
2026-06-07 11:14

## Estado ejecutivo
🟡 PARTIAL

## Objetivo
Verificar que la app mantiene lectura útil y comportamiento razonable cuando la red cae y luego vuelve.

## Resultado resumido
- La base de datos local existe y varias superficies pueden renderizar sin depender de una consulta inmediata.
- La sincronización Supabase está preparada para reintento.
- No se completó una prueba física de modo avión en iPhone durante esta auditoría.

## Lo que sí se verificó
- La app local carga y navega sin errores de runtime.
- El dashboard y las superficies principales renderizan con datos existentes.
- El layout móvil no presenta overflow horizontal.
- El sistema técnico queda contenido en `Más → Configuración`.

## Lo que queda pendiente
- Prueba completa:
  1. abrir online
  2. crear datos
  3. apagar red / modo avión
  4. reabrir
  5. confirmar lectura local
  6. volver online
  7. confirmar reconciliación
- Verificación física en iPhone.

## Conclusión
- El diseño del sync está orientado a cache local + Supabase.
- La auditoría offline todavía no puede marcarse como PASS sin la prueba de desconexión real.

