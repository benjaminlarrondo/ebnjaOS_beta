import { cn } from "../../lib/utils";
export function Badge({ children, className }: { children: string; className?: string }) { return <span className={cn("rounded-full border border-borderc px-2 py-1 text-xs text-texts", className)}>{children}</span>; }
