import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { buildRouter } from "./router";
import { db } from "../lib/store";
import { hydrateAllFromSupabase, probeSupabaseConnection } from "../lib/supabaseSync";

export default function App() {
  const [, setReady] = useState(0);
  const [hydrating, setHydrating] = useState(true);

  useEffect(() => {
    const run = async () => {
      const timeout = new Promise<null>((resolve) => {
        window.setTimeout(() => resolve(null), 3500);
      });

      await probeSupabaseConnection();
      const remote = await Promise.race([hydrateAllFromSupabase(), timeout]);
      if (remote) {
        db.hydrateCollections(remote);
      }
      setReady((x) => x + 1);
      setHydrating(false);
    };

    void run();
  }, []);

  if (hydrating) {
    return (
      <div className="app-shell">
        <main className="app-main">
          <section className="card">
            <p className="text-xs text-textm">Inicializando plataforma</p>
            <h1 className="mt-1 text-lg font-semibold text-textp">Cargando ebnjaOS…</h1>
            <p className="mt-2 text-sm text-texts">Sincronizando estado local y calendario.</p>
          </section>
        </main>
      </div>
    );
  }

  return <RouterProvider router={buildRouter()} />;
}
