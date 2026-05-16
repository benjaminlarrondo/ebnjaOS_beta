import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";
import { SyncIndicator } from "./SyncIndicator";
import { GlobalQuickCapture } from "./GlobalQuickCapture";

export function AppLayout() {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="mx-auto w-full max-w-6xl px-3 pb-6 pt-[calc(env(safe-area-inset-top)+8px)] sm:px-4 lg:p-6 lg:pb-6 lg:pt-6">
        <MobileBottomNav />
        <Header />
        <Outlet />
      </main>
      <SyncIndicator />
      <GlobalQuickCapture />
    </div>
  );
}
