export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div className="mb-1"><h1 className="text-2xl font-semibold leading-tight text-textp">{title}</h1>{subtitle && <p className="mt-1 text-sm text-texts">{subtitle}</p>}</div>;
}
