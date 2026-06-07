import { useEffect, useMemo, useState } from "react";

function formatMinutes(minutes: number) {
  const safe = Math.max(0, minutes);
  const whole = Math.floor(safe);
  const seconds = Math.round((safe - whole) * 60);
  return `${whole}m ${String(seconds).padStart(2, "0")}s`;
}

export function FitnessSessionTimer({
  startedAt,
  durationMinutes,
  targetMinutes = 50,
  mobilityMinutes = 10,
}: {
  startedAt?: string | null;
  durationMinutes?: number | null;
  targetMinutes?: number;
  mobilityMinutes?: number;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startedAt) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  const elapsedMinutes = useMemo(() => {
    if (typeof durationMinutes === "number" && Number.isFinite(durationMinutes) && durationMinutes > 0) {
      return durationMinutes;
    }
    if (!startedAt) return 0;
    return Math.max(0, (now - new Date(startedAt).getTime()) / 60000);
  }, [durationMinutes, now, startedAt]);

  const remainingMinutes = Math.max(0, targetMinutes - elapsedMinutes);
  const over60 = elapsedMinutes > 60;

  return (
    <section className={`card ${over60 ? "border-warning/40" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Session Timer</p>
          <h3 className="text-sm font-semibold text-textp">50 min training + 10 min mobility</h3>
          <p className="mt-1 text-xs text-texts">Guarda la duración real al finalizar la sesión.</p>
        </div>
        <span className={`pill-soft ${over60 ? "text-warning" : "text-primary"}`}>
          {over60 ? "Over 60 min" : startedAt ? "Running" : "Ready"}
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="surface-tile">
          <p className="text-xs text-texts">Tiempo actual</p>
          <p className="metric-value-xl mt-2">{formatMinutes(elapsedMinutes)}</p>
        </div>
        <div className="surface-tile">
          <p className="text-xs text-texts">Tiempo restante</p>
          <p className="metric-value-xl mt-2 text-primary">{formatMinutes(remainingMinutes)}</p>
        </div>
        <div className="surface-tile">
          <p className="text-xs text-texts">Tiempo total</p>
          <p className="metric-value-xl mt-2">{formatMinutes(targetMinutes + mobilityMinutes)}</p>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface2">
        <div
          className={`h-full rounded-full ${over60 ? "bg-warning" : "bg-primary"}`}
          style={{ width: `${Math.min(100, (elapsedMinutes / targetMinutes) * 100)}%` }}
        />
      </div>
    </section>
  );
}
