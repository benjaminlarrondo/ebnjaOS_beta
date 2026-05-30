import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Widget } from "../system/Widget";

export function WidgetCard({
  children,
  className = "",
  to,
}: {
  children: ReactNode;
  className?: string;
  to?: string;
}) {
  const classes = `widget ${className}`;

  if (to) {
    return <Link to={to} className={`${classes} block transition active:scale-[0.99]`}>{children}</Link>;
  }

  return <Widget className={className}>{children}</Widget>;
}
