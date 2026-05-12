import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import DashboardPage from "../modules/dashboard/page";
import TasksPage from "../modules/tasks/page";
import CalendarPage from "../modules/calendar/page";
import FitnessPage from "../modules/fitness/page";
import NotesPage from "../modules/notes/page";
import PromptsPage from "../modules/prompts/page";
import ResourcesPage from "../modules/resources/page";
import DailyLogPage from "../modules/daily-log/page";
import ProjectsPage from "../modules/projects/page";
import SettingsPage from "../modules/settings/page";

export const buildRouter = () =>
  createBrowserRouter(
    [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "tasks", element: <TasksPage /> },
          { path: "calendar", element: <CalendarPage /> },
          { path: "fitness", element: <FitnessPage /> },
          { path: "notes", element: <NotesPage /> },
          { path: "prompts", element: <PromptsPage /> },
          { path: "resources", element: <ResourcesPage /> },
          { path: "daily-log", element: <DailyLogPage /> },
          { path: "projects", element: <ProjectsPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
    {
      basename: import.meta.env.BASE_URL,
    },
  );
