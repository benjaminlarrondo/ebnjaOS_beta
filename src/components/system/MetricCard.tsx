import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  hint,
  className = "",
  children,
}: {
  label?: string;
  value?: string | number;
  hint?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`metric-card ${className}`}>
      {label && <p className="caption font-medium text-texts">{label}</p>}
      {value !== undefined && <p className="metric-value mt-2">{value}</p>}
      {hint && <p className="mt-2 caption text-texts">{hint}</p>}
      {children}
    </div>
  );
}
