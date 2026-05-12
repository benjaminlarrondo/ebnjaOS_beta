export const APP_NAME = "ebnjaOS Core v0.1";

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || "").trim();
const supabaseAnon = String(import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();
const hasRealSupabaseUrl = supabaseUrl.length > 0 && !supabaseUrl.includes("mock.local");
const hasRealSupabaseKey = supabaseAnon.length > 0 && !supabaseAnon.includes("YOUR_SUPABASE");

export const IS_MOCK = !(hasRealSupabaseUrl && hasRealSupabaseKey);
