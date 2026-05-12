import type { ReactNode } from "react";
export function Modal({ open, children }: { open: boolean; children: ReactNode }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-4"><div className="w-full max-w-md rounded-2xl border border-borderc bg-white p-4">{children}</div></div>;
}
