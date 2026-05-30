# EBNJAOS — FASE 1.5.2 FINAL

## Objetivo
Llevar ebnjaOS a una experiencia premium de nivel producción, trabajando solo UI, UX, responsive, layout y consistencia visual.

## Restricciones
- NO modificar backend.
- NO modificar Supabase.
- NO modificar estructura de datos.
- NO duplicar datos.
- NO crear mocks.
- NO modificar lógica de negocio.
- NO escanear el proyecto completo.
- Reutilizar la integración existente de celeste_calendar.

## Diseño oficial
Eliminar:
- glow
- blur
- glassmorphism
- radial gradients
- sombras difusas

Usar:
- Background: #050608
- Surface: #0F1115
- Border: #1B1F26
- Text: #FFFFFF
- Secondary: #8B919B
- Accent: #E5C76B

## Responsive
Debe funcionar correctamente en:
- 1280x800
- 1366x768
- 1440x900
- 1512x982
- 1920x1080
- iPhone 17 Pro Max

Implementar grids adaptativos con:
repeat(auto-fit,minmax(320px,1fr))

Preparar safe areas para iPhone.

## Sidebar
Implementar:
- expandida 240px
- compacta 72px
- persistir preferencia local
- agrupar en Operación, Conocimiento, Gestión y Configuración

## Cockpit
Reducir altura visual 35%.
Mostrar fecha dinámica:
Viernes 29 de Mayo 2026
HH:mm

Mostrar sin scroll:
- Próxima prioridad
- Próximo evento
- Próximo entrenamiento
- Estado sistema

Agregar widget:
Recomendación del sistema.

## Estado sistema
Crear o mejorar SystemStatus visible en:
- Dashboard
- Fitness
- Calendario

Mostrar:
- Supabase online/offline
- última sincronización
- calendario sincronizado/pendiente

## Fitness
Reordenar:
1. Resumen Ejecutivo
2. Entrenamiento de Hoy
3. Recovery
4. Consistencia
5. Historial

Crear WorkoutTodayCard usando plan existente.
Debe mostrar rutina, ejercicios, series, repeticiones, duración estimada y botón Iniciar entrenamiento.

Reducir cards/paddings/espacios 25%.

## Quick Actions
Reemplazar placeholders por:
- Nueva tarea
- Nuevo evento
- Nueva nota
- Registrar entrenamiento

Cada acción debe tener icono, título y descripción corta.

## Calendario
Eliminar rosado, beige y colores redundantes.
Estados:
- Normal
- Evento
- Hoy
- Seleccionado

Evento: borde izquierdo Accent.
Hoy: outline Accent.
Seleccionado: surface elevada.

## Integración Tete
La app ya consume endpoint real de celeste_calendar.
Detectar owner:
- mine
- hers
- neutral

Regla:
owner === "mine" significa Tete.

Renderizar punto rojo #F87171 bajo el número del día.
Agregar leyenda: ● Tete
Tooltip: Con Tete

NO modificar datos ni owner.

## Dashboard Tete
Agregar widget TETE:
- próximo bloque con Tete
- fecha inicio
- fecha término

Calcular usando datos reales del endpoint existente.

## Homologación global
Tomar Calendario como referencia visual.
Aplicar a:
- Dashboard
- Fitness
- Tareas
- QA
- Notas
- Recursos
- Revisión
- Objetivos

Homologar cards, headers, banners, padding, títulos y métricas.

## FAB
Mantener 1 FAB global.
Eliminar duplicados.
Acciones:
- Nueva tarea
- Nuevo evento
- Nueva nota
- Registrar entrenamiento

## Validaciones
Ejecutar:
- npm run build
- npm run lint
- npm run typecheck

Verificar:
- overflow
- scroll horizontal
- contraste
- responsive
- safe areas

## Entregables
Actualizar:
- docs/STATUS.md
- docs/CHANGELOG_AI.md

Reportar:
- archivos modificados
- mejoras implementadas
- inconsistencias detectadas
- propuesta Fase 1.5.3
- validación final
