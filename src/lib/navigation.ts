import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Dumbbell,
  FileQuestion,
  FolderKanban,
  Home,
  NotebookText,
  Search,
  Settings,
  Sparkles,
  Target,
  Archive,
  ListTodo,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ModuleCategory = "principal" | "secundario";

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
    id: "search",
    label: "Buscar",
    path: "/search",
    icon: Search,
    category: "secundario",
    showInMobile: false,
    showInSidebar: true,
    showInQuickActions: false,
    showInDashboardModules: true,
  },
  {
    id: "review",
    label: "Revision",
    path: "/review",
    icon: ClipboardCheck,
    category: "secundario",
    showInMobile: false,
    showInSidebar: true,
    showInQuickActions: true,
    showInDashboardModules: true,
  },
  {
    id: "goals",
    label: "Objetivos",
    path: "/goals",
    icon: Target,
    category: "secundario",
    showInMobile: false,
    showInSidebar: true,
    showInQuickActions: true,
    showInDashboardModules: true,
  },
  {
    id: "qa",
    label: "QA",
    path: "/qa",
    icon: FileQuestion,
    category: "secundario",
    showInMobile: false,
    showInSidebar: true,
    showInQuickActions: false,
    showInDashboardModules: true,
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
    id: "prompts",
    label: "Prompts",
    path: "/prompts",
    icon: Sparkles,
    category: "secundario",
    showInMobile: false,
    showInSidebar: true,
    showInQuickActions: false,
    showInDashboardModules: true,
  },
  {
    id: "resources",
    label: "Recursos",
    path: "/resources",
    icon: Archive,
    category: "secundario",
    showInMobile: false,
    showInSidebar: true,
    showInQuickActions: false,
    showInDashboardModules: true,
  },
  {
    id: "daily-log",
    label: "Registro diario",
    path: "/daily-log",
    icon: BookOpen,
    category: "secundario",
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
    category: "secundario",
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
    category: "secundario",
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
