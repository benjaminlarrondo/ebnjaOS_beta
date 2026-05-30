import type { CalendarSource } from "../../types/calendar";

export function ExternalSourceBadge({ source }: { source: CalendarSource }) {
  if (source === "github") {
    return <span className="rounded-full border border-primary/35 px-2 py-1 text-[10px] font-medium text-primary">GitHub</span>;
  }

  if (source === "manual") {
    return <span className="rounded-full border border-borderc px-2 py-1 text-[10px] font-medium text-texts">Manual</span>;
  }

  return <span className="rounded-full border border-borderc px-2 py-1 text-[10px] font-medium text-texts">Google</span>;
}
