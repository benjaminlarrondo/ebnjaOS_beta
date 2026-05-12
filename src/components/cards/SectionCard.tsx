import type { ReactNode } from "react";
export function SectionCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return <section className="card"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">{title}</h3>{action}</div>{children}</section>;
}
