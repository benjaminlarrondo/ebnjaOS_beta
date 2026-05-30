import { Link } from "react-router-dom";

export function TrackingTodayWidget({
  score,
  health,
  focus,
}: {
  score: number;
  health: number;
  focus: number;
}) {
  return (
    <Link to="/tracking" className="card block transition hover:border-primary/35">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">Tracking hoy</p>
        <span className="text-xs text-texts">Ver módulo</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="inner-card">
          <p className="text-xs text-texts">Global</p>
          <p className="mt-1 font-semibold text-textp">{score}</p>
        </div>
        <div className="inner-card">
          <p className="text-xs text-texts">Salud</p>
          <p className="mt-1 font-semibold text-textp">{health}</p>
        </div>
        <div className="inner-card">
          <p className="text-xs text-texts">Focus</p>
          <p className="mt-1 font-semibold text-textp">{focus}</p>
        </div>
      </div>
    </Link>
  );
}
