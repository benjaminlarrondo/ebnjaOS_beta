export const APP_NAME = "ebnjaOS Core v0.1";

export const SUPABASE_URL_RAW = String(import.meta.env.VITE_SUPABASE_URL || "").trim();
export const SUPABASE_ANON_RAW = String(import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();
const hasRealSupabaseUrl = SUPABASE_URL_RAW.length > 0 && !SUPABASE_URL_RAW.includes("mock.local");
const hasRealSupabaseKey = SUPABASE_ANON_RAW.length > 0 && !SUPABASE_ANON_RAW.includes("YOUR_SUPABASE");

export const IS_MOCK = !(hasRealSupabaseUrl && hasRealSupabaseKey);

export function getEnvDiagnostics() {
  return {
    hasUrl: SUPABASE_URL_RAW.length > 0,
    hasAnonKey: SUPABASE_ANON_RAW.length > 0,
    urlLooksReal: hasRealSupabaseUrl,
    anonLooksReal: hasRealSupabaseKey,
    urlPreview: SUPABASE_URL_RAW ? SUPABASE_URL_RAW.replace(/(https?:\/\/[^/]+).*/, "$1") : "(vacío)",
    anonKeyLength: SUPABASE_ANON_RAW.length,
    singleUserId: String(import.meta.env.VITE_SINGLE_USER_ID || "00000000-0000-0000-0000-000000000001"),
  };
}
