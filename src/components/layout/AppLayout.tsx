import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { AppHeader } from "./AppHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import { GlobalQuickCapture } from "./GlobalQuickCapture";
import { AppShell } from "../system/AppShell";
import { CommandPalette } from "./CommandPalette";
import { APP_NAME } from "../../lib/constants";

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem("ebnjaos-sidebar-collapsed");
    if (stored === "1") return true;
    if (stored === "0") return false;
    return window.innerWidth < 1440;
  });

  useEffect(() => {
    localStorage.setItem("ebnjaos-sidebar-collapsed", sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);

  useEffect(() => {
    document.title = APP_NAME;
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1280) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <AppShell>
      <Sidebar collapsed={sidebarCollapsed} />
      <main className="app-main">
        <MobileBottomNav />
        <AppHeader onToggleSidebar={() => setSidebarCollapsed((value) => !value)} />
        <Outlet />
      </main>
      <CommandPalette />
      <GlobalQuickCapture />
    </AppShell>
  );
}
