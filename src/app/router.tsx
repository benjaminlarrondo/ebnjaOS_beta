import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";

export const buildRouter = () =>
  createBrowserRouter(
    [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, lazy: async () => ({ Component: (await import("../modules/dashboard/page")).default }) },
          { path: "tasks", lazy: async () => ({ Component: (await import("../modules/tasks/page")).default }) },
          { path: "calendar", lazy: async () => ({ Component: (await import("../modules/calendar/page")).default }) },
          { path: "fitness", lazy: async () => ({ Component: (await import("../modules/fitness/page")).default }) },
          { path: "notes", lazy: async () => ({ Component: (await import("../modules/notes/page")).default }) },
          { path: "prompts", lazy: async () => ({ Component: (await import("../modules/prompts/page")).default }) },
          { path: "resources", lazy: async () => ({ Component: (await import("../modules/resources/page")).default }) },
          { path: "daily-log", lazy: async () => ({ Component: (await import("../modules/daily-log/page")).default }) },
          { path: "projects", lazy: async () => ({ Component: (await import("../modules/projects/page")).default }) },
          { path: "search", lazy: async () => ({ Component: (await import("../modules/search/page")).default }) },
          { path: "review", lazy: async () => ({ Component: (await import("../modules/review/page")).default }) },
          { path: "goals", lazy: async () => ({ Component: (await import("../modules/goals/page")).default }) },
          { path: "qa", lazy: async () => ({ Component: (await import("../modules/qa/page")).default }) },
          { path: "settings", lazy: async () => ({ Component: (await import("../modules/settings/page")).default }) },
        ],
      },
    ],
    {
      basename: import.meta.env.BASE_URL,
    },
  );
