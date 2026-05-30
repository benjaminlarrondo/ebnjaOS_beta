import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { buildRouter } from "./router";
import { startBackgroundSync } from "../services/sync/syncManager";

export default function App() {
  useEffect(() => {
    window.setTimeout(() => {
      void startBackgroundSync();
    }, 0);
  }, []);

  return <RouterProvider router={buildRouter()} />;
}
