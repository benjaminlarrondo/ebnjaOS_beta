import { Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";

function ProgressLine({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-surface2">
      <div className="h-2 rounded-full bg-accent" style={{ width: `${Math.min(100, Math.max(0, Math.round(value)))}%` }} />
    </div>
  );
}

export function FitnessWidget({
  sessionName,
  sessionFocus,
  sessionsCompleted,
  gymCompleted,
  homeCompleted,
  fitnessPct,
}: {
  sessionName: string;
  sessionFocus: string;
  sessionsCompleted: number;
  gymCompleted: number;
  homeCompleted: number;
  fitnessPct: number;
}) {
  return (
    <Link to="/fitness" className="card block transition active:scale-[0.99]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Fitness</p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight text-textp">{sessionName}</h2>
          <p className="mt-1 text-sm text-texts">{sessionFocus}</p>
        </div>
        <span className="rounded-full bg-surface2 p-3 text-primary"><Dumbbell className="h-5 w-5" /></span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="metric-value">{sessionsCompleted}</p>
          <p className="mt-1 text-xs text-texts">sesiones</p>
        </div>
        <div>
          <p className="metric-value">{gymCompleted}</p>
          <p className="mt-1 text-xs text-texts">gym</p>
        </div>
        <div>
          <p className="metric-value">{homeCompleted}</p>
          <p className="mt-1 text-xs text-texts">home</p>
        </div>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs text-texts">
          <span>Semana</span>
          <span>{sessionsCompleted}/6</span>
        </div>
        <ProgressLine value={fitnessPct} />
      </div>
    </Link>
  );
}
