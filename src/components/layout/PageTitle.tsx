import { PageHeader } from "../system/PageHeader";

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <PageHeader title={title} subtitle={subtitle} />;
}
