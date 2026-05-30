import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div className="min-w-0">
        <h1 className="heading-xl font-semibold text-textp">{title}</h1>
        {subtitle && <p className="mt-1 body-md text-texts">{subtitle}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
