import { createClient } from "@supabase/supabase-js";
import { IS_MOCK } from "./constants";
import { loadWebSupabaseConfig } from "./config";

const config = (() => {
  try {
    return loadWebSupabaseConfig();
  } catch {
    return null;
  }
})();

function createMissingSupabaseClient(message: string) {
  const failingResult = async () => ({ data: null, error: { message } });
  interface MissingSupabaseQuery {
    select: () => MissingSupabaseQuery;
    upsert: typeof failingResult;
    insert: typeof failingResult;
    update: typeof failingResult;
    delete: () => MissingSupabaseQuery;
    eq: () => MissingSupabaseQuery;
    limit: () => MissingSupabaseQuery;
    order: () => MissingSupabaseQuery;
    then: <TResult1 = { data: null; error: { message: string } }, TResult2 = never>(
      onfulfilled?: ((value: { data: null; error: { message: string } }) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ) => Promise<TResult1 | TResult2>;
  }

  const failingChain: MissingSupabaseQuery = {
    select: () => failingChain,
    upsert: failingResult,
    insert: failingResult,
    update: failingResult,
    delete: () => failingChain,
    eq: () => failingChain,
    limit: () => failingChain,
    order: () => failingChain,
    then: (onfulfilled, onrejected) => Promise.resolve({ data: null, error: { message } }).then(onfulfilled, onrejected),
  };

  return {
    from() {
      return failingChain;
    },
  } as const;
}

export const supabase = IS_MOCK
  ? createMissingSupabaseClient("Missing required Supabase environment variables.")
  : config
    ? createClient(config.url, config.anonKey, {
        auth: { persistSession: true, autoRefreshToken: true },
        global: { headers: { "x-ebnja-mode": "live" } },
      })
    : createMissingSupabaseClient("Missing required Supabase environment variables.");
