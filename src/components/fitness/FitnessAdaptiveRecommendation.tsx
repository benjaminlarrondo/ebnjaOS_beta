import type { AdaptiveTrainingRecommendation } from "../../lib/fitness/fitnessExecutionTypes";

function levelTone(level: AdaptiveTrainingRecommendation["level"]) {
  if (level === "optimal") return "border-[#24452f] bg-[#ecf7ef] text-[#2b6b45]";
  if (level === "good") return "border-primary/30 bg-primary/10 text-primary";
  if (level === "moderate") return "border-[#7a5d22]/30 bg-[#fff6e6] text-[#8b5e16]";
  return "border-[#8b3d3d]/30 bg-[#fff0f0] text-[#a94444]";
}

export function FitnessAdaptiveRecommendation({
  recommendation,
}: {
  recommendation: AdaptiveTrainingRecommendation;
}) {
  return (
    <section className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Adaptive Training</p>
          <h3 className="text-sm font-semibold text-textp">Today’s Readiness</h3>
          <p className="mt-1 text-xs text-texts">Recovery, HRV, resting HR y baselines de 30 días.</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${levelTone(recommendation.level)}`}>
          {recommendation.readiness}%
        </span>
      </div>

      <div className="mt-3 rounded-2xl border border-borderc bg-surface px-3 py-2">
        <p className="text-xs text-texts">Recomendación</p>
        <p className="mt-1 text-base font-semibold text-textp">{recommendation.recommendation}</p>
        <p className="mt-1 text-xs text-texts">
          Sleep {recommendation.currentSleep.toFixed(1)}h · HRV {recommendation.currentHrv.toFixed(0)} ms · RHR{" "}
          {recommendation.currentRestingHr.toFixed(0)} bpm
        </p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <div className="inner-card">
          <p className="text-xs text-texts">Sleep baseline</p>
          <p className="mt-1 font-semibold text-textp">{recommendation.sleepBaseline.toFixed(1)}h</p>
        </div>
        <div className="inner-card">
          <p className="text-xs text-texts">HRV delta</p>
          <p className="mt-1 font-semibold text-textp">{recommendation.hrvDeltaPct >= 0 ? "+" : ""}{recommendation.hrvDeltaPct.toFixed(1)}%</p>
        </div>
        <div className="inner-card">
          <p className="text-xs text-texts">RHR delta</p>
          <p className="mt-1 font-semibold text-textp">{recommendation.restingHrDeltaPct >= 0 ? "+" : ""}{recommendation.restingHrDeltaPct.toFixed(1)}%</p>
        </div>
        <div className="inner-card">
          <p className="text-xs text-texts">Volumen</p>
          <p className="mt-1 font-semibold text-textp">{recommendation.volumeAdjustmentPct} %</p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 lg:grid-cols-2">
        <div className="rounded-2xl border border-borderc bg-surface px-3 py-2">
          <p className="text-xs font-medium text-texts">Why?</p>
          <ul className="mt-2 space-y-1 text-xs text-textp">
            {recommendation.explanation.slice(0, 3).map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-borderc bg-surface px-3 py-2">
          <p className="text-xs font-medium text-texts">Risk Factors</p>
          <ul className="mt-2 space-y-1 text-xs text-textp">
            {recommendation.riskFactors.length ? (
              recommendation.riskFactors.slice(0, 3).map((line) => <li key={line}>• {line}</li>)
            ) : (
              <li>• Sin señales de riesgo relevantes</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
