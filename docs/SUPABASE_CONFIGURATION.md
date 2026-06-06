# SUPABASE_CONFIGURATION.md

## Objetivo
Centralizar la configuración de Supabase para iOS, web y desarrollo local sin exponer credenciales en código fuente.

## iOS
- `Health_ebnjaOS_v2/Config/Secrets.xcconfig` contiene:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
- `Health_ebnjaOS_v2/Supabase/Config.swift` valida que las variables existan y resuelve `SupabaseConfig`.
- `Health_ebnjaOS_v2/App/Health_ebnjaOSApp.swift` usa la configuración validada antes de crear `SyncManager`.
- `Health_ebnjaOS_v2/Resources/Info.plist` expone las variables para que el runtime las lea sin hardcodear valores en Swift.

## Web
- `src/lib/config.ts` valida `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- `src/lib/supabase.ts` crea el cliente solo con configuración válida.
- No hay fallback a URLs o keys reales hardcodeadas en JavaScript.

## Seguridad
- `Secrets.xcconfig` queda ignorado por Git.
- `.env.local` y `.env.production` quedan ignorados por Git.
- `.env.example` contiene placeholders vacíos.

## Validación
- Si falta una variable requerida:
  - iOS: la configuración devuelve `nil` y `SyncManager` muestra un error claro.
  - Web: la configuración marca el estado como inválido y el cliente devuelve errores claros al usar Supabase.

