import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function WidgetAction({
  children,
  to,
  onClick,
  icon,
  variant = "ghost",
  className = "",
}: {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: "primary" | "ghost" | "tile" | "plain";
  className?: string;
}) {
  const classes =
    variant === "primary"
      ? `btn-primary ${className}`
      : variant === "tile"
        ? `rounded-2xl border border-borderc bg-white p-3 text-sm font-medium text-textp shadow-sm transition active:scale-[0.99] ${className}`
        : variant === "plain"
          ? `flex items-center gap-1 text-xs font-medium text-primary ${className}`
          : `btn-ghost ${className}`;
  const content = (
    <>
      {icon}
      {children}
    </>
  );

  if (to) {
    return <Link to={to} className={classes}>{content}</Link>;
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
