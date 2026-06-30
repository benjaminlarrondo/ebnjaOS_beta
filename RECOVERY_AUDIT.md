# ebnjaOS Recovery Audit

## Veredicto ejecutivo
RECUPERABLE.

La build canónica actual compila y el proyecto iOS real está claramente identificado. La discrepancia principal no es un fallo de compilación, sino la coexistencia de dos repositorios iOS distintos y la posibilidad de estar mirando documentación o una base de código diferente a la que Xcode realmente está compilando.

## Identidad del repositorio
- Ruta: `/Users/benjaminlarrondo/Documents/ebnjaOS_beta`
- Remote: `origin https://github.com/benjaminlarrondo/ebnjaOS_beta.git`
- Branch: `feature/phase3-healthkit-companion`
- Commit: `cad542ad5a15a23d0079653417efae1c3f4e0f26`
- Estado local: working tree con cambios locales y archivos sin seguimiento en múltiples áreas del repo, incluyendo el workspace iOS `Health_ebnjaOS_v2/` y docs.

## Proyecto canónico
- Proyecto o workspace: `Health_ebnjaOS_v2/Health_ebnjaOS_v2.xcodeproj`
- Target: `Health_ebnjaOS_v2`
- Scheme: `Health_ebnjaOS_v2`
- Configuración: `Debug` / `Release`
- Bundle identifier: `com.ebnjaos.health`
- Producto: `ebnjaOS.app`
- Entry point: `Health_ebnjaOS_v2/App/Health_ebnjaOSApp.swift`
- Vista raíz: `RootView()`

## Cadena de navegación activa
`Target Health_ebnjaOS_v2` → `@main Health_ebnjaOS_v2App` → `RootView()` → `TabView` → `DashboardView` / `FitnessView` / `AgendaView` / `BrainView` / `MoreView`

## Archivos fuera del target
- El frontend web (`src/`, `public/`, `index.html`) no forma parte del target iOS.
- El repositorio hermano `/Users/benjaminlarrondo/Documents/ebnjaOS_app` existe como Git independiente y no es el repo que Xcode compila en esta ruta.
- En el target iOS, los archivos Swift relevantes sí están referenciados en `PBXSourcesBuildPhase`.

## Componentes legacy o duplicados
- Existe un segundo repo iOS independiente en `/Users/benjaminlarrondo/Documents/ebnjaOS_app` con HEAD distinto y más antiguo.
- El panel técnico de HealthKit sigue visible en `MoreView` con acciones `Request Health Access` y `Request Calendar Access`.
- No se detectó un segundo `@main` activo en `Health_ebnjaOS_v2`.

## Estado de funcionalidades
- Home: presente y navegable; muestra módulos accionables.
- Fitness: presente; usa rutinas canónicas y estado HealthKit claro, pero conserva texto técnico mínimo de runtime.
- Hábitos: presente; persistencia local-first.
- Agenda: presente; vista día/semana y creación de evento.
- TETE: presente; usa adapter local de `celeste_calendar` con próximos 5 días.
- Más: presente; concentra estado técnico.
- HealthKit: presente; simulador usa mock explícito, dispositivo usa permisos reales.
- Supabase: presente; configurado vía `Secrets.xcconfig` / build settings.
- Brain: presente; captura local-first con búsqueda y filtros.

## Nombre e icono
- `PRODUCT_NAME` efectivo: `ebnjaOS`
- `CFBundleDisplayName`: `ebnjaOS`
- `ASSETCATALOG_COMPILER_APPICON_NAME`: `AppIcon`
- `AppIcon.appiconset` existe y contiene los tamaños iPhone/iPad/1024 requeridos.
- `UILaunchScreen` apunta a `LaunchLogo` y `LaunchBackground`.

## Estado de dependencias
- Swift Packages resueltos: `Supabase`, `swift-crypto`, `swift-http-types`, `swift-concurrency-extras`, `swift-clocks`, `swift-asn1`, `xctest-dynamic-overlay`.
- `Health_ebnjaOS.entitlements` contiene `com.apple.developer.healthkit = true`.
- No se observan entitlements de iCloud/CloudKit en este target.
- `Config/Secrets.xcconfig` existe y define `SUPABASE_URL` / `SUPABASE_ANON_KEY` vía xcconfig.

## Resultado de build
- Comando usado:
  - `xcodebuild -project Health_ebnjaOS_v2/Health_ebnjaOS_v2.xcodeproj -scheme Health_ebnjaOS_v2 -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 17 Pro Max' clean build`
- Resultado: `BUILD SUCCEEDED`
- Warnings: 2
- Errors: 0
- App generada en:
  - `/Users/benjaminlarrondo/Library/Developer/Xcode/DerivedData/Health_ebnjaOS_v2-eabxafwcusuppiasfqekwhhipxzv/Build/Products/Debug-iphonesimulator/ebnjaOS.app`
- Bundle identifier del build: `com.ebnjaos.health`
- Nombre del producto: `ebnjaOS`
- Commit compilado: `cad542ad5a15a23d0079653417efae1c3f4e0f26`

## Causas raíz confirmadas
1. Hay dos repositorios iOS distintos: `Health_ebnjaOS_v2` dentro de `ebnjaOS_beta` y el repo hermano `ebnjaOS_app`. Sus HEADs no coinciden.
2. El build real que Xcode compila pertenece al proyecto `Health_ebnjaOS_v2`, no al repo hermano.
3. El target activo genera `ebnjaOS.app`, así que abrir o editar el workspace equivocado impide ver los cambios compilados.
4. El panel técnico de HealthKit todavía existe en `MoreView`, por eso parte de la brecha entre sprint/documentación y runtime sigue visible.
5. La build real contiene advertencias menores, incluida una API de EventKit deprecada, aunque no bloquean el build.

## Riesgos
- Riesgo de seguir auditando o editando el repo equivocado.
- Riesgo de confundir documentación de sprints con el estado real del target activo.
- Riesgo de interpretar cambios de `ebnjaOS_app` como si ya estuvieran en `Health_ebnjaOS_v2`.

## Recomendación
- Continuar sobre el proyecto actual.
- Justificación objetiva: el proyecto `Health_ebnjaOS_v2` es compilable, tiene el entry point activo, tiene el target correcto, y representa la base que Xcode está ejecutando ahora mismo. El repo hermano `ebnjaOS_app` está más atrás en commit y no debe tomarse como fuente canónica para este diagnóstico.

## Próxima intervención mínima
- Abrir únicamente `Health_ebnjaOS_v2.xcodeproj`.
- Mantener el target `Health_ebnjaOS_v2`.
- Validar en dispositivo físico antes de tocar funcionalidad.
