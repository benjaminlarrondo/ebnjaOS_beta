# PERFORMANCE_REPORT.md — RC1

## Build
- Comando: `npm run build`
- Estado: OK
- Tiempo build observado: ~457ms

## Tamaño de artefactos relevantes
- `dist/assets/index-BCArVEPL.js`: 274.04 kB (gzip 86.17 kB)
- `dist/assets/store-D-dHdgtp.js`: 204.41 kB (gzip 53.25 kB)
- `dist/assets/page-Ba-eVLTu.js`: 30.22 kB (gzip 7.53 kB)
- `dist/assets/index-D32m9Egj.css`: 21.86 kB (gzip 5.65 kB)

## Hallazgos
- El chunk principal (`index`) y `store` concentran mayor peso del bundle.
- Arquitectura modular por rutas ya separa vistas, pero el estado global local sigue costoso.

## Recomendaciones (sin agregar features)
1. Revisar granularidad de serialización/carga en `store` para reducir payload inicial.
2. Posponer carga de utilidades de baja frecuencia (módulos secundarios) si su uso no es inmediato.
3. Continuar limpieza de componentes legacy para mantener tree-shaking efectivo.
4. Revisar dependencias de runtime para detectar imports amplios en entrypoint.

## Riesgo de performance para RC1
- Nivel: **bajo-medio** (aceptable para release candidate UI).
