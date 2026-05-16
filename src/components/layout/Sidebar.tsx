import { NavLink } from "react-router-dom";
const links = [
  ["/", "Dashboard"], ["/search", "Search"], ["/review", "Review"], ["/goals", "Goals"], ["/qa", "QA"], ["/tasks", "Tasks"], ["/calendar", "Calendar"], ["/fitness", "Fitness"], ["/notes", "Notes"], ["/prompts", "Prompts"], ["/resources", "Resources"], ["/daily-log", "Daily Log"], ["/projects", "Projects"], ["/settings", "Settings"]
] as const;

export function Sidebar() {
  return <aside className="hidden h-screen w-64 border-r border-borderc bg-[#f2f4f8] p-4 lg:block"><p className="mb-4 text-xl font-bold">ebnjaOS</p><nav className="space-y-1">{links.map(([to, label]) => <NavLink key={to} to={to} className={({isActive}) => `block rounded-xl px-3 py-2 text-sm ${isActive ? "bg-white text-primary" : "text-texts hover:bg-white/80"}`}>{label}</NavLink>)}</nav></aside>;
}
