import {
  CalendarDays,
  Dumbbell,
  FolderKanban,
  Home,
  Brain,
  NotebookText,
  Search,
  Settings,
  Target,
  Archive,
  ListTodo,
  BadgeCheck,
  Clock3,
  Sparkles,
  CheckSquare2,
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
    showInMobile: false,
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
    label: "Goals",
    path: "/tracking",
    icon: Target,
    category: "principal",
    showInMobile: true,
    showInSidebar: true,
    showInQuickActions: true,
    showInDashboardModules: true,
  },
  {
    id: "workspace",
    label: "Workspace",
    path: "/workspace",
    icon: Archive,
    category: "principal",
    showInMobile: true,
    showInSidebar: true,
    showInQuickActions: false,
    showInDashboardModules: true,
  },
  {
    id: "brain",
    label: "Brain",
    path: "/brain",
    icon: Brain,
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
    showInSidebar: false,
    showInQuickActions: false,
    showInDashboardModules: false,
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
    label: "Settings",
    path: "/settings",
    icon: Settings,
    category: "principal",
    showInMobile: false,
    showInSidebar: true,
    showInQuickActions: false,
    showInDashboardModules: true,
  },
  {
    id: "review",
    label: "Review",
    path: "/review",
    icon: CheckSquare2,
    category: "principal",
    showInMobile: false,
    showInSidebar: true,
    showInQuickActions: false,
    showInDashboardModules: true,
  },
  {
    id: "qa",
    label: "QA",
    path: "/qa",
    icon: BadgeCheck,
    category: "principal",
    showInMobile: false,
    showInSidebar: true,
    showInQuickActions: false,
    showInDashboardModules: false,
  },
  {
    id: "search",
    label: "Buscar",
    path: "/search",
    icon: Search,
    category: "principal",
    showInMobile: false,
    showInSidebar: true,
    showInQuickActions: false,
    showInDashboardModules: false,
  },
  {
    id: "daily-log",
    label: "Daily log",
    path: "/daily-log",
    icon: Clock3,
    category: "principal",
    showInMobile: false,
    showInSidebar: true,
    showInQuickActions: false,
    showInDashboardModules: false,
  },
  {
    id: "prompts",
    label: "Prompts",
    path: "/prompts",
    icon: Sparkles,
    category: "principal",
    showInMobile: false,
    showInSidebar: true,
    showInQuickActions: false,
    showInDashboardModules: false,
  },
] as const satisfies AppModule[];

export const mobileNavModules: AppModule[] = appModules.filter((module) => module.showInMobile);
export const sidebarModules: AppModule[] = appModules.filter((module) => module.showInSidebar);
export const quickActionModules: AppModule[] = appModules.filter((module) => module.showInQuickActions);
export const dashboardModules: AppModule[] = appModules.filter((module) => module.showInDashboardModules);
export const moreHubModules: AppModule[] = appModules.filter((module) => ["tracking", "projects", "brain", "resources", "settings"].includes(module.id));
