export function StatCard({ label, value }: { label: string; value: string | number }) {
  return <div className="card"><p className="text-xs text-texts">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>;
}
