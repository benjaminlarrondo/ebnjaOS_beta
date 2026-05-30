# RC1_RELEASE_NOTES.md

## Resumen
RC1 cierra la etapa de estabilización UX/UI previa a Fase 2, sin introducir nuevas funcionalidades ni cambios de backend/integraciones.

## Mejoras implementadas
- Header global consolidado mediante `AppHeader`.
- Estado de plataforma integrado de forma consistente en header.
- Sidebar estabilizado como navegación pura.
- Dashboard compactado para mejorar densidad operativa.
- Fitness 2.0 orientado a acción inmediata (tab `Rutina` por defecto y ejercicios visibles).
- Ajuste de FAB móvil con safe area para evitar superposición.
- Limpieza de componentes legacy huérfanos.

## Problemas conocidos
- Timeouts transitorios no persistentes al capturar Calendar en automatización QA.
- Posible necesidad de ajuste tipográfico fino en densidades compactas.

## Pendientes para Fase 2
- Optimización estructural del estado global para bundle inicial.
- Refinamiento visual fino de tipografía secundaria y espaciados compactos.
- Profundizar auditoría de accesibilidad (contraste/target sizes) con criterios formales.
