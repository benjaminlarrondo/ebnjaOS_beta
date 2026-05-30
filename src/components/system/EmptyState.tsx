import type { ReactNode } from "react";

export function EmptyState({
  text,
  action,
}: {
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <p>{text}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
