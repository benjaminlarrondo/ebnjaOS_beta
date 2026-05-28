export function StatCard({ label, value }: { label: string; value: string | number }) {
  return <div className="card"><p className="text-xs font-medium text-texts">{label}</p><p className="metric-value mt-3">{value}</p></div>;
}
