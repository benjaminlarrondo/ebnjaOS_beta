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
      <main className="mx-auto w-full max-w-6xl px-4 pb-7 pt-[calc(env(safe-area-inset-top)+10px)] sm:px-5 lg:p-7">
        <MobileBottomNav />
        <Header />
        <Outlet />
      </main>
      <SyncIndicator />
      <GlobalQuickCapture />
    </div>
  );
}
