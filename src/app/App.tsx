import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { buildRouter } from "./router";
import { db } from "../lib/store";
import { hydrateAllFromSupabase, probeSupabaseConnection } from "../lib/supabaseSync";

export default function App() {
  const [, setReady] = useState(0);

  useEffect(() => {
    const run = async () => {
      await probeSupabaseConnection();
      const remote = await hydrateAllFromSupabase();
      db.hydrateCollections(remote);
      setReady((x) => x + 1);
    };

    void run();
  }, []);

  return <RouterProvider router={buildRouter()} />;
}
