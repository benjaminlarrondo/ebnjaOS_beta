import { createClient } from "@supabase/supabase-js";
import { IS_MOCK } from "./constants";

const url = import.meta.env.VITE_SUPABASE_URL || "https://mock.local";
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || "mock";

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true },
  global: { headers: { "x-ebnja-mode": IS_MOCK ? "mock" : "live" } },
});
