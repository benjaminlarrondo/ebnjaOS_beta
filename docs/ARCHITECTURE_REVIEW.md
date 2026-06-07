# ARCHITECTURE_REVIEW.md

## Layering
- Domain engines separate from view components: PASS
- Executive Home composition through reusable widgets: PASS
- Brain foundations using existing stores: PASS

## Navigation
- `Home / Fitness / Agenda / Brain / Más`: PASS
- Technical surface centralized in `Más → Configuración`: PASS

## Data flow
- Supabase-first and local cache coexist in current web stack: PASS
- Executive layer reuses existing health, tracking, calendar and goals data: PASS

## Risks
- `Brain` is still a foundation layer, not a full knowledge graph.
- Sync/backup diagnostics intentionally remain isolated in Settings.

