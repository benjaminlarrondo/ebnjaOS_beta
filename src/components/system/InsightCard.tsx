import type { ReactNode } from "react";

export function InsightCard({
  title,
  detail,
  meta,
  children,
  className = "",
}: {
  title?: string;
  detail?: string;
  meta?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`insight-card ${className}`}>
      {meta && <p className="caption font-semibold text-primary">{meta}</p>}
      {title && <p className="mt-1 heading-md font-semibold text-textp">{title}</p>}
      {detail && <p className="mt-1 caption text-texts">{detail}</p>}
      {children}
    </div>
  );
}
