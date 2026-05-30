import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type StatusTone = "default" | "accent" | "success";

export function StatusPill({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "status-pill",
        tone === "accent" && "status-pill--accent",
        tone === "success" && "status-pill--success",
        className,
      )}
    >
      {children}
    </span>
  );
}
