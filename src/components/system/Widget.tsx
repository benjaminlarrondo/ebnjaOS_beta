import type { ReactNode } from "react";
import { Card } from "./Card";

export function Widget({
  children,
  className = "",
  compact = false,
}: {
  children: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return <Card className={`widget ${compact ? "widget-compact" : ""} ${className}`}>{children}</Card>;
}
