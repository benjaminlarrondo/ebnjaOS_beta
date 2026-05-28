import type { ReactNode } from "react";
export function SectionCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return <section className="card"><div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-textp">{title}</h3>{action}</div>{children}</section>;
}
