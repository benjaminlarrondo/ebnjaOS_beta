import { NavLink } from "react-router-dom";
import { sidebarModules } from "../../lib/navigation";

export function Sidebar() {
  return <aside className="hidden h-screen w-64 border-r border-borderc bg-[#f2f4f8] p-4 lg:block"><p className="mb-4 text-xl font-bold">ebnjaOS</p><nav className="space-y-1">{sidebarModules.map((module) => <NavLink key={module.id} to={module.path} className={({isActive}) => `block rounded-xl px-3 py-2 text-sm ${isActive ? "bg-white text-primary" : "text-texts hover:bg-white/80"}`}>{module.label}</NavLink>)}</nav></aside>;
}
