import type { ReactNode } from "react";

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-header">
      <h3 className="section-title">{title}</h3>
      {action}
    </div>
  );
}
