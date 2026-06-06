# IOS_SECRETS_SETUP.md

## Archivos
- `Health_ebnjaOS_v2/Config/Secrets.xcconfig`
- `Health_ebnjaOS_v2/Config/Debug.xcconfig`
- `Health_ebnjaOS_v2/Config/Release.xcconfig`
- `Health_ebnjaOS_v2/Resources/Info.plist`
- `Health_ebnjaOS_v2/Supabase/Config.swift`

## Variables esperadas
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SCHEME`
- `SUPABASE_HOST`
- `SUPABASE_PATH`
- `SUPABASE_USER_ID` opcional
- `SUPABASE_DEVICE_ID` opcional

## Flujo
1. `Debug.xcconfig` y `Release.xcconfig` incluyen `Secrets.xcconfig`.
2. `Secrets.xcconfig` resuelve la URL y la key.
3. `project.yml` inyecta las variables en `Info.plist`.
4. `Config.swift` valida y construye `SupabaseConfig`.
5. `Health_ebnjaOSApp` entrega la configuración a `SyncManager`.

## Importante
- No commitear `Secrets.xcconfig`.
- Si falta una variable, la app muestra error claro en sync y no usa credenciales hardcodeadas.

