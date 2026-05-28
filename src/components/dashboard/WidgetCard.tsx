import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function WidgetCard({
  children,
  className = "",
  to,
}: {
  children: ReactNode;
  className?: string;
  to?: string;
}) {
  const classes = `card ${className}`;

  if (to) {
    return <Link to={to} className={`${classes} block transition active:scale-[0.99]`}>{children}</Link>;
  }

  return <section className={classes}>{children}</section>;
}
