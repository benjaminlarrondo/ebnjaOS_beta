import type { ReactNode } from "react";

export function WidgetHeader({
  eyebrow,
  title,
  subtitle,
  icon,
  action,
  size = "md",
  className = "mb-4",
}: {
  eyebrow?: string;
  title: string | number;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const titleClassName =
    size === "lg"
      ? "text-2xl font-semibold leading-tight text-textp"
      : size === "sm"
        ? "text-sm font-semibold text-textp"
        : "text-xl font-semibold text-textp";

  return (
    <div className={`${className} flex items-start justify-between gap-3`}>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className={`${eyebrow ? "mt-1" : ""} ${titleClassName}`}>{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-texts">{subtitle}</p>}
      </div>
      {action || icon}
    </div>
  );
}
