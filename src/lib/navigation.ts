import {
  CalendarDays,
  Dumbbell,
  FolderKanban,
  Home,
  NotebookText,
  Settings,
  Target,
  Archive,
  ListTodo,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ModuleCategory = "principal";

export type AppModule = {
  id: string;
  label: string;
  mobileLabel?: string;
  path: string;
  icon: LucideIcon;
  category: ModuleCategory;
  showInMobile: boolean;
  showInSidebar: boolean;
  showInQuickActions: boolean;
  showInDashboardModules: boolean;
};

export const appModules = [
  {
    id: "home",
    label: "Inicio",
    path: "/",
    icon: Home,
    category: "principal",
    showInMobile: true,
    showInSidebar: true,
    showInQuickActions: false,
    showInDashboardModules: false,
  },
  {
    id: "tasks",
    label: "Tareas",
    path: "/tasks",
    icon: ListTodo,
    category: "principal",
    showInMobile: true,
    showInSidebar: true,
    showInQuickActions: true,
    showInDashboardModules: true,
  },
  {
    id: "calendar",
    label: "Calendario",
    path: "/calendar",
    icon: CalendarDays,
    category: "principal",
    showInMobile: true,
    showInSidebar: true,
    showInQuickActions: true,
    showInDashboardModules: true,
  },
  {
    id: "fitness",
    label: "Fitness",
    path: "/fitness",
    icon: Dumbbell,
    category: "principal",
    showInMobile: true,
    showInSidebar: true,
    showInQuickActions: true,
    showInDashboardModules: true,
  },
  {
    id: "tracking",
    label: "Objetivos",
    path: "/tracking",
    icon: Target,
    category: "principal",
    showInMobile: false,
    showInSidebar: true,
    showInQuickActions: true,
    showInDashboardModules: true,
  },
  {
    id: "notes",
    label: "Notas",
    path: "/notes",
    icon: NotebookText,
    category: "principal",
    showInMobile: false,
    showInSidebar: true,
    showInQuickActions: true,
    showInDashboardModules: true,
  },
  {
    id: "resources",
    label: "Recursos",
    path: "/resources",
    icon: Archive,
    category: "principal",
    showInMobile: false,
    showInSidebar: true,
    showInQuickActions: false,
    showInDashboardModules: true,
  },
  {
    id: "projects",
    label: "Proyectos",
    path: "/projects",
    icon: FolderKanban,
    category: "principal",
    showInMobile: false,
    showInSidebar: true,
    showInQuickActions: false,
    showInDashboardModules: true,
  },
  {
    id: "settings",
    label: "Ajustes",
    mobileLabel: "Mas",
    path: "/settings",
    icon: Settings,
    category: "principal",
    showInMobile: true,
    showInSidebar: true,
    showInQuickActions: false,
    showInDashboardModules: true,
  },
] as const satisfies AppModule[];

export const mobileNavModules: AppModule[] = appModules.filter((module) => module.showInMobile);
export const sidebarModules: AppModule[] = appModules.filter((module) => module.showInSidebar);
export const quickActionModules: AppModule[] = appModules.filter((module) => module.showInQuickActions);
export const dashboardModules: AppModule[] = appModules.filter((module) => module.showInDashboardModules);
export const moreHubModules: AppModule[] = [];
