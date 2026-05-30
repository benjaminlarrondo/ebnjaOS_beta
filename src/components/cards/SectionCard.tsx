import type { ReactNode } from "react";
import { Widget } from "../system/Widget";
import { SectionHeader } from "../system/SectionHeader";

export function SectionCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return <Widget><SectionHeader title={title} action={action} />{children}</Widget>;
}
