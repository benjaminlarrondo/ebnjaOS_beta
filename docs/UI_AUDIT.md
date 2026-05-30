# UI_AUDIT.md — RC1

## Matriz revisada

### Desktop
- 1920x1080
- 1512x982
- 1440x900 (referencia visual previa en QA histórico)
- 1366x768
- 1280x800 (referencia visual previa en QA histórico)

### Mobile
- 430x932
- 393x852
- 375x667

## Verificación UX/UI
- Sidebar: navegación limpia, sticky, sin bloques operacionales.
- Header: global, consistente y visible en módulos auditados.
- BottomNav: visible en móvil y coherente con navegación principal.
- FAB: reposicionado con safe area (`calc(80px + env(safe-area-inset-bottom))`) para no tapar contenido.
- Calendar: legible, con puntos Tete visibles cuando aplica.
- Fitness: rutina visible al entrar (tab por defecto `Rutina`).
- Dashboard: jerarquía más compacta, menor altura total.

## Hallazgos

### Críticos
- Ninguno detectado.

### Importantes
- En capturas automatizadas hubo timeouts transitorios de carga en Calendar (sin reproducirse de forma persistente).

### Menores
- En anchos compactos puede aumentar densidad visual de tarjetas en bloques secundarios.
- Ajuste fino tipográfico recomendado para textos secundarios largos.

## Estado responsive RC1
- Overflow horizontal: no detectado.
- Cards cortadas: no detectado.
- Textos truncados: solo truncado intencional en listas/labels extensos.
- Espacios muertos: reducidos respecto a iteración previa.
