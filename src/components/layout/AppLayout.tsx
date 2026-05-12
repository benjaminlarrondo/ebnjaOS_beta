import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";
import { SyncIndicator } from "./SyncIndicator";

export function AppLayout() {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="mx-auto w-full max-w-6xl p-4 pb-[calc(env(safe-area-inset-bottom)+96px)] lg:p-6 lg:pb-6">
        <Header />
        <Outlet />
      </main>
      <MobileBottomNav />
      <SyncIndicator />
    </div>
  );
}
