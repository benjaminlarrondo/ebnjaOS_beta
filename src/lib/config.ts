type WebSupabaseConfig = {
  url: string;
  anonKey: string;
  singleUserId: string;
};

function requiredEnv(name: string): string {
  const value = String(import.meta.env[name] || "").trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Add it to .env.local or .env.production.`);
  }
  return value;
}

export function loadWebSupabaseConfig(): WebSupabaseConfig {
  return {
    url: requiredEnv("VITE_SUPABASE_URL"),
    anonKey: requiredEnv("VITE_SUPABASE_ANON_KEY"),
    singleUserId: String(import.meta.env.VITE_SINGLE_USER_ID || "00000000-0000-0000-0000-000000000001").trim(),
  };
}
