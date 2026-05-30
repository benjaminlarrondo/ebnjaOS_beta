import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export function Card({
  children,
  className,
  as = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "article" | "div";
}) {
  const Component = as;
  return <Component className={cn("card", className)}>{children}</Component>;
}
