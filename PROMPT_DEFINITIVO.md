# ebnjaOS — Prompt Definitivo (UX/UI Mobile-First)

Diseñar ebnjaOS con enfoque mobile-first, tomando como referencia un dashboard limpio tipo iPhone.

## OBJETIVO UX
La app debe sentirse como un “centro de control personal”:
- rápida de revisar
- fácil de operar con una mano
- sin saturación visual
- con foco en decisiones diarias
- orientada a acción inmediata
- más cercana a Apple / Notion / Linear que a un SaaS corporativo tradicional

## PRINCIPIOS UX
1. Mobile-first real
- El diseño debe partir desde iPhone.
- Desktop debe ser una expansión del layout mobile, no al revés.
- La pantalla inicial debe ser útil sin necesidad de navegar demasiado.

2. Jerarquía clara
Orden visual obligatorio en Dashboard:
1. Foco del día
2. Tareas de hoy
3. Próximos eventos
4. Entrenamiento del día
5. Nota rápida
6. Progreso semanal
7. Accesos rápidos

3. Lectura en menos de 30 segundos
El usuario debe entender:
- qué hacer hoy
- qué viene después
- qué entrenar
- qué quedó pendiente
- cómo va la semana

4. Interacción simple
- máximo 2 taps para crear tarea
- máximo 2 taps para crear nota
- máximo 2 taps para registrar workout
- máximo 2 taps para crear evento
- acciones rápidas visibles desde Dashboard

5. Evitar fricción
- no usar formularios largos
- usar modales breves
- usar quick-add
- permitir guardar incompleto
- usar defaults inteligentes

## UI MOBILE

### Layout
- Header compacto
- Greeting simple: “Buen día”
- Cards verticales
- Bottom navigation fija
- Accesos rápidos visibles
- Espaciado generoso
- Sin sidebar en mobile

### Bottom navigation
- Inicio
- Tareas
- Calendario
- Fitness
- Más

### Desktop
- Usar sidebar izquierda fija
- Mantener la misma lógica visual del mobile
- No agregar complejidad innecesaria

## CARDS
Todas las cards deben usar:
- fondo blanco
- border suave `#E5E7EB`
- radio 16–20 px
- sombra muy sutil
- padding cómodo
- títulos pequeños y claros
- íconos lineales simples
- máximo 1 acción principal por card

Cards obligatorias en Dashboard:
- FocusCard
- TodayTasksCard
- UpcomingEventsCard
- TodayWorkoutCard
- QuickNoteCard
- WeeklyProgressCard
- QuickActionsCard

## ESTILO VISUAL

### Paleta
- background: `#F7F8FA`
- surface: `#FFFFFF`
- text primary: `#1F2937`
- text secondary: `#6B7280`
- primary: `#5B6C8F`
- accent green: `#7FB77E`
- border: `#E5E7EB`
- warning: `#F4C95D`
- danger: `#E57373`

### Tipografía
- Inter
- títulos semibold
- textos breves
- buena altura de línea
- no usar fuentes decorativas

### Iconografía
- lineal
- simple
- consistente
- estilo Lucide Icons
- evitar íconos rellenos pesados

### Estados visuales
- verde suave: completado / positivo
- azul grisáceo: activo / principal
- amarillo suave: advertencia
- rojo suave: crítico
- gris: pendiente / neutro

## MICROCOPY
Usar textos breves:
- “Foco del día”
- “Tareas de hoy”
- “Próximos eventos”
- “Entrenamiento”
- “Nota rápida”
- “Progreso semanal”
- “Accesos rápidos”

Evitar:
- textos largos
- lenguaje técnico
- exceso de métricas
- nombres de módulos complejos

## DASHBOARD MOBILE — COMPORTAMIENTO
El Dashboard debe mostrar información real o mock en este orden:

1. Foco del día
- una frase editable
- máximo 120 caracteres

2. Tareas de hoy
- máximo 3 tareas visibles
- link “Ver todas”
- mostrar hora si existe
- mostrar prioridad con punto de color

3. Próximos eventos
- máximo 2 eventos visibles
- fecha compacta
- hora y título

4. Entrenamiento de hoy
- tipo de entrenamiento
- 2–3 ejercicios principales
- estado de movilidad / recovery

5. Nota rápida
- última nota o campo para escribir una nueva

6. Progreso semanal
- entrenamientos completados
- tareas completadas
- sueño / recuperación
- usar anillos o barras simples

7. Accesos rápidos
- Tareas
- Calendario
- Fitness
- Notas

## RESPONSIVE
Breakpoints:
- mobile: layout de una columna
- tablet: cards en dos columnas cuando tenga sentido
- desktop: sidebar + grid ejecutivo

Regla:
No duplicar contenido entre mobile y desktop. Solo adaptar distribución.

## INTERACCIONES CLAVE
Agregar botón flotante o acción rápida:
- “+”
- Crear tarea
- Crear nota
- Crear evento
- Registrar workout

En mobile:
- FAB inferior derecho o acción desde QuickActions
- No usar menús complejos

## EMPTY STATES
Crear empty states elegantes:
- “No tienes tareas para hoy”
- “No hay eventos próximos”
- “Registra tu primer entrenamiento”
- “Guarda tu primera nota”
- “Agrega tu primer recurso”

Cada empty state debe tener:
- ícono simple
- texto breve
- botón de acción

## CRITERIOS DE ACEPTACIÓN UX/UI
La UI será válida si:
- se ve bien en iPhone
- se puede usar con una mano
- el Dashboard se entiende en menos de 30 segundos
- no hay saturación de texto
- las cards tienen jerarquía clara
- los botones son fáciles de tocar
- la navegación inferior funciona bien
- el diseño se siente premium, sobrio y minimalista
- las acciones principales están a máximo 2 taps
- el sistema visual es consistente

## REGLA FINAL DE DISEÑO
ebnjaOS debe sentirse como una app personal premium:
simple, clara, silenciosa y útil.

No debe parecer un panel administrativo pesado.
No debe parecer un ERP.
No debe parecer una app genérica de productividad.
