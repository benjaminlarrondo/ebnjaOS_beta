import { Link } from "react-router-dom";
import { FolderKanban, ListTodo, NotebookText, Archive } from "lucide-react";
import { PageTitle } from "../../components/layout/PageTitle";
import { SectionCard } from "../../components/cards/SectionCard";

const workspaceSections = [
  {
    title: "Projects",
    subtitle: "Proyectos activos y planificación.",
    to: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Tasks",
    subtitle: "Inbox, today y seguimiento operativo.",
    to: "/tasks",
    icon: ListTodo,
  },
  {
    title: "Notes",
    subtitle: "Notas enlazadas y referencias rápidas.",
    to: "/brain",
    icon: NotebookText,
  },
  {
    title: "Resources",
    subtitle: "Links, referencias y material base.",
    to: "/resources",
    icon: Archive,
  },
] as const;

export default function WorkspacePage() {
  return (
    <div className="page-shell space-y-4">
      <PageTitle title="Workspace" subtitle="Un espacio único para operar Projects, Tasks, Notes y Resources." />

      <div className="grid gap-3 lg:grid-cols-2">
        {workspaceSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.to} to={section.to} className="card block transition hover:border-primary/35">
              <SectionCard title={section.title}>
                <div className="mt-3 flex items-start gap-3">
                  <span className="rounded-2xl border border-borderc bg-surface2 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-textp">{section.title}</p>
                    <p className="mt-1 text-sm text-texts">{section.subtitle}</p>
                    <p className="mt-3 text-xs font-medium text-primary">Open section</p>
                  </div>
                </div>
              </SectionCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
