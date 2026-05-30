# TETE_VALIDATION.md

## Base de validación
- Fuente: `data/versions/state_20260526_202145.json`
- URL: https://raw.githubusercontent.com/benjaminlarrondo/celeste_calendar/main/data/versions/state_20260526_202145.json
- Mes validado: **mayo 2026**

## Días conmigo (owner = `mine`)
- 2026-05-04
- 2026-05-06
- 2026-05-07
- 2026-05-12
- 2026-05-13
- 2026-05-15
- 2026-05-16
- 2026-05-19
- 2026-05-20
- 2026-05-21
- 2026-05-25
- 2026-05-29
- 2026-05-30
- 2026-05-31

## Días Tete (owner = `hers`)
- 2026-05-01
- 2026-05-02
- 2026-05-03
- 2026-05-05
- 2026-05-08
- 2026-05-09
- 2026-05-10
- 2026-05-11
- 2026-05-14
- 2026-05-17
- 2026-05-18
- 2026-05-22
- 2026-05-23
- 2026-05-24
- 2026-05-26
- 2026-05-27
- 2026-05-28

## Comparación automática vs lógica anterior
- Lógica anterior auditada: Tete = `owner === "mine"`
- Lógica oficial correcta: Tete = `owner === "hers"`

### Diferencias encontradas
- Falsos positivos Tete (marcados antes como Tete, pero no lo son): **14**
  - 2026-05-04
  - 2026-05-06
  - 2026-05-07
  - 2026-05-12
  - 2026-05-13
  - 2026-05-15
  - 2026-05-16
  - 2026-05-19
  - 2026-05-20
  - 2026-05-21
  - 2026-05-25
  - 2026-05-29
  - 2026-05-30
  - 2026-05-31
- Falsos negativos Tete (faltaban como Tete): **17**
  - 2026-05-01
  - 2026-05-02
  - 2026-05-03
  - 2026-05-05
  - 2026-05-08
  - 2026-05-09
  - 2026-05-10
  - 2026-05-11
  - 2026-05-14
  - 2026-05-17
  - 2026-05-18
  - 2026-05-22
  - 2026-05-23
  - 2026-05-24
  - 2026-05-26
  - 2026-05-27
  - 2026-05-28

## Resultado
- La discrepancia visual proviene de inversión semántica de `owner` en el render mensual.
- Con la corrección actual, la representación queda alineada con el dato oficial del endpoint.
