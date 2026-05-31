import { Link } from "react-router-dom";

export function TrackingTodayWidget({
  score,
  completed,
  total,
}: {
  score: number;
  completed: number;
  total: number;
}) {
  return (
    <Link to="/tracking" className="card block transition hover:border-primary/35">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">Tracking</p>
        <span className="text-xs text-texts">Ver módulo</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="inner-card">
          <p className="text-xs text-texts">Score</p>
          <p className="mt-1 font-semibold text-textp">{score}%</p>
        </div>
        <div className="inner-card">
          <p className="text-xs text-texts">Completados</p>
          <p className="mt-1 font-semibold text-textp">{completed} / {total}</p>
        </div>
      </div>
    </Link>
  );
}
