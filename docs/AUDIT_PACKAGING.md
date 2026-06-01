# AUDIT_PACKAGING.md

## Política nueva (obligatoria al cierre de sprint)
Al finalizar cada sprint se debe generar automáticamente:

- `~/Desktop/ebnjaOS_AUDIT_rev_XX/`
- `~/Desktop/ebnjaOS_AUDIT_rev_XX.zip`

Con evidencia completa para auditoría externa.

## Comando
```bash
npm run audit:package
```

## Contenido generado
- `screenshots/desktop`
- `screenshots/mobile`
- `implementacion/`
- `auditoria_tecnica/`
- `docs/` (incluye `STATUS.md` + `CHANGELOG_AI.md`)
- `MANIFEST.json` (commit, branch, timestamp, fuente de capturas)

## Fuente de capturas
El empaquetado toma automáticamente la última revisión de:
`~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_XX/screenshots`
