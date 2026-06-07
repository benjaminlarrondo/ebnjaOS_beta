# PROGRAM_PROGRESSION_ARCHITECTURE.md

## Objetivo
Explicar cómo BenjaOS transforma una librería de rutinas en un sistema de progresión automática.

## Capas

### `ProgramProgressionEngine`
- Calcula el plan de progresión de la rutina seleccionada.
- Toma como entrada:
  - librería de rutinas
  - sesiones históricas
  - series registradas
  - readiness actual
- Devuelve:
  - semana del mesociclo
  - recomendación operativa
  - multiplicador de volumen
  - targets por ejercicio

### `MesocycleManager`
- Construye targets por semana.
- Soporta:
  - Semana 1
  - Semana 2
  - Semana 3
  - Semana 4
- Mantiene una progresión simple y entendible.

### `DeloadManager`
- Reduce carga cuando el contexto lo requiere.
- Se activa por:
  - semana 4
  - readiness baja
- Prioriza seguridad y consistencia.

## Persistencia
- La tabla `fitness_progress` guarda snapshots de progreso de sesión.
- `fitness_session_logs` y `fitness_set_logs` sostienen el detalle de ejecución.
- `fitness_prs` sigue alimentando el histórico de récords.

## UX resultante
- `Today` responde qué toca hoy.
- `Programs` responde cómo progresa el programa.
- `Progress` responde si hay avance real.
- `PRs` responde cuál es el próximo récord objetivo.
