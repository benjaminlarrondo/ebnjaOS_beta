# PERSISTENCE_FOUNDATION_PLAN.md

## Objetivo
Definir base de persistencia estable para migrar ebnjaOS desde modelo local-first actual a modelo Supabase-first controlado.

## Arquitectura propuesta
Supabase  
↓  
Repository Layer  
↓  
Stores  
↓  
UI

## 1) Repository Layer (nuevo)
Crear capa por dominio:
- `CalendarRepository`
- `TasksRepository`
- `FitnessRepository`
- `NotesRepository`
- `ProjectsRepository`
- `TrackingRepository` (fase posterior)
- `HealthRepository` (fase posterior)

Cada repository debe exponer:
- `pull()`
- `upsert(item)`
- `remove(id)`
- `subscribe?()` (opcional)
- `reconcile(local, remote)`

## 2) Contrato de persistencia por dominio

### Fase inicial (migración segura)
- Calendar: híbrido (DomainStore local + replicación Supabase)
- Tasks/Notes/Projects: subir a repository primero
- Fitness workouts: repository directo

### Fase posterior
- Health Foundation
- Tracking/Objetivos
- PR Tracker

## 3) Estrategia Auth/RLS
Elegir una única estrategia (obligatorio antes de migración total):

### Opción A (recomendada)
- Auth real (magic link/email/OAuth)
- RLS por `auth.uid() = user_id`
- Multiusuario futuro-compatible

### Opción B (MVP personal)
- Políticas anon single-user (`single-user-anon-setup.sql`)
- `VITE_SINGLE_USER_ID` fijo
- Menor seguridad, menor complejidad

## 4) Estrategia de sincronización
- Boot:
  1. cargar cache local
  2. render inmediato
  3. sync background por repositorios
- Reconcile:
  - preferencia por `updated_at` + hashes por dominio
  - colas de retry (`syncQueue`) centralizadas
- Observabilidad:
  - errores por dominio
  - métricas de drift local/remoto

## 5) Modelo de stores
- Stores dejan de conocer Supabase directamente.
- Stores consumen repositories.
- UI solo consume stores/selectors.

## 6) Plan por fases

### Fase P0 — Foundation
- Introducir `RepositoryFactory` + interfaces comunes
- Resolver decisión Auth/RLS
- Normalizar manejo de errores/sync status

### Fase P1 — Calendar/Tasks/Projects/Notes
- Migrar `db` calls a repositories
- Mantener fallback local
- Validar consistencia reload + offline

### Fase P2 — Fitness
- Migrar workouts + métricas derivadas
- Consolidar PR tracker (opcional remoto)

### Fase P3 — Tracking + Health
- Definir contrato canónico remoto
- Resolver privacidad y granularidad

## 7) Criterios de READY
- Auth/RLS estrategia cerrada
- Repository layer operativo en al menos 3 dominios core
- Sync no bloqueante y observable
- Drift rate aceptable (definir SLA)
- Build/lint/typecheck + QA producción sin errores críticos

## Riesgos actuales
- RLS inconsistente entre entornos
- dependencia localStorage prolongada
- acoplamiento `db` ↔ sync
- ausencia de auth UX

## Estado recomendado
Mantener estado 🟡 **PARTIAL** hasta cerrar P0 (Auth/RLS + Repository foundation).
