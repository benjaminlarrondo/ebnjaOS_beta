# WORKOUT_INTELLIGENCE_RULES.md

## Objetivo
Definir cómo BenjaOS ajusta el entrenamiento según HealthKit, Recovery, Readiness y progreso real.

## Reglas base
- `Readiness > 80` → carga completa.
- `Readiness 60-80` → mantener carga.
- `Readiness < 60` → reducir volumen 20% y accesorios.
- `Deload` automático en la semana 4 del mesociclo o cuando la readiness cae bajo 60.

## Señales usadas
- Sueño
- HRV
- Resting HR
- Recovery Score
- Readiness
- Program progression
- Historial de sesiones
- PRs reales

## Efecto esperado
- La app no solo recomienda; también ajusta la propuesta de carga.
- La recomendación aparece en `Home`, `Today`, `Programs` y `Progress`.
- El usuario entiende rápidamente si debe empujar, mantener o descargar.

## Riesgos
- Sin datos reales suficientes, la progresión debe degradar con seguridad.
- Los ejercicios sin referencia de peso deben conservar su prescription sin inventar cargas.
