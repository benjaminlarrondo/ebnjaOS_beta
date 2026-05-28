import { NavLink } from "react-router-dom";
import { sidebarModules } from "../../lib/navigation";

export function Sidebar() {
  return <aside className="hidden h-screen w-64 border-r border-borderc bg-surface2 p-5 lg:block"><p className="mb-5 text-xl font-semibold">benjaOS</p><nav className="space-y-1.5">{sidebarModules.map((module) => <NavLink key={module.id} to={module.path} className={({isActive}) => `block rounded-2xl px-3 py-2 text-sm transition ${isActive ? "bg-white text-primary shadow-sm" : "text-texts hover:bg-white/80 hover:text-textp"}`}>{module.label}</NavLink>)}</nav></aside>;
}
