# HEALTHKIT_COMPANION_ARCHITECTURE

## Objetivo
Diseñar la arquitectura real para conectar Apple Health / HealthKit con ebnjaOS sin implementar Swift todavía.

## 1) Flujo completo HealthKit → Supabase
HealthKit (iPhone)  
↓  
Apple Health Companion App  
↓  
HealthKit Export Layer  
↓  
HealthKit Companion Bridge  
↓  
Canonical Health Payload JSON  
↓  
Remote Repository Layer  
↓  
Supabase

La app companion será la única responsable de leer HealthKit y transformar la data al contrato canónico de ebnjaOS.

## 2) Importación inicial 30 días
La primera sincronización debe importar una ventana de 30 días para poblar el estado base.

### Objetivos
- Inicializar `health_states` con días recientes.
- Poblar `fitness_body_metrics` con métricas corporales y de recuperación.
- Poblar `fitness_workouts` con sesiones detectadas.

### Reglas
- Un día se importa una sola vez por `date`.
- Si ya existe data local o remota, gana la versión con `external_updated_at` más reciente.
- La importación inicial debe ser idempotente.

## 3) Delta Sync diario
Luego de la importación inicial:
- se sincronizan solo los cambios nuevos del día,
- se reintenta en background,
- no se bloquea la UI,
- la app web sigue operando aun si la companion app no está presente.

### Estrategia
- Agrupar cambios por `date`.
- Upsert por `external_id`.
- Comparar `external_updated_at` para resolver conflictos.

## 4) Manejo offline
La companion app debe soportar cola local:
- leer HealthKit aunque no haya red,
- construir payloads canónicos,
- guardar batch pendiente,
- reintentar cuando vuelva la conectividad.

### Regla de oro
Offline nunca debe sobrescribir datos remotos más nuevos sin comparar timestamps.

## 5) Resolución de conflictos
Regla base:
- `external_updated_at` gana sobre `updated_at` local si es más reciente.

### Orden de prioridad
1. `external_id` estable.
2. `external_updated_at` más nuevo.
3. `date` como clave de agrupación diaria.
4. `metadata` como respaldo de compatibilidad.

### Casos típicos
- Un dato editado en iPhone después de un sync anterior.
- Un día con múltiples muestras parciales.
- Un reload en otro navegador o dispositivo.

## 6) Estrategia Background Sync
La companion app debe operar en background cuando sea posible:
- sincronización periódica,
- sync al abrir,
- sync al volver a foreground,
- sync manual por pull-to-refresh.

### Reglas
- No bloquear la lectura de la UI.
- No borrar cache local si falla Supabase.
- No repetir uploads si el payload ya fue confirmado.

## 7) Payload JSON definitivo
El payload canónico recomendado por día:

```json
{
  "provider": "apple_health",
  "source": "apple_health",
  "external_id": "apple-health:2026-06-04:steps",
  "external_updated_at": "2026-06-04T23:59:59.000Z",
  "date": "2026-06-04",
  "waterMl": 3000,
  "proteinG": 135,
  "sleepHours": 8,
  "weightKg": 74.5,
  "stepsCount": 8200,
  "hrvMs": 54.2,
  "restingHr": 56,
  "workoutsCount": 1,
  "metadata": {
    "source": "healthkit",
    "importedAt": "2026-06-04T23:59:59.000Z"
  }
}
```

## 8) Mapeo HealthKit → tablas actuales

### `health_states`
Usar como snapshot diario unificado:
- `waterMl`
- `proteinG`
- `sleepHours`
- `weightKg`
- `stepsCount`
- `hrvMs`
- `restingHr`
- `workoutsCount`

### `fitness_body_metrics`
Usar para:
- peso,
- sueño,
- pasos,
- HRV,
- resting HR,
- metadatos de origen,
- reconciliación por `external_id`.

### `fitness_workouts`
Usar para:
- sesiones de entrenamiento,
- importaciones por día,
- metadatos de origen,
- conciliación por `external_id`.

## 9) Riesgos técnicos
- Duplicación por exportaciones repetidas.
- Desfase de timezone entre HealthKit y `date` canónico.
- Diferencias entre muestras parciales y snapshots diarios.
- Conflictos si el móvil y la web editan el mismo día.
- Dependencia de conectividad para el primer push remoto.
- Riesgo de meter en `fitness_workouts` sesiones artificiales si el modelo no separa import de entrenamiento real.

## 10) Roadmap implementación

### Fase 1
- Crear app companion iOS.
- Definir export JSON canónico.
- Implementar lectura de 30 días iniciales.

### Fase 2
- Delta sync diario.
- Background sync.
- Cola offline y reintentos.

### Fase 3
- Conector Supabase estable.
- Reconciliación por `external_id` + `external_updated_at`.

### Fase 4
- Validación cross-device.
- Observabilidad y auditoría.
- Ajustes de UX / permisos.

## Estado
🟡 **READY FOR IMPLEMENTATION DESIGN**

La arquitectura está definida. Falta construir la companion app nativa cuando el sprint pase a implementación Swift.
