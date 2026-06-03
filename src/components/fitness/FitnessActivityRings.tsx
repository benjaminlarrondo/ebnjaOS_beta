function Ring({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  const size = 92;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.max(0, Math.min(100, Math.round(value)));
  const dash = circumference - (normalized / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tone}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dash}
        />
      </svg>
      <p className="text-xs text-texts">{label}</p>
      <p className="text-sm font-semibold text-textp">{normalized}%</p>
    </div>
  );
}

export function FitnessActivityRings({
  workoutScore,
  nutritionScore,
  recoveryScore,
  consistencyScore,
}: {
  workoutScore: number;
  nutritionScore: number;
  recoveryScore: number;
  consistencyScore: number;
}) {
  return (
    <section className="card">
      <div className="mb-3">
        <p className="eyebrow">Activity Rings</p>
        <h3 className="text-sm font-semibold text-textp">Training, Nutrition, Recovery, Consistency</h3>
      </div>
      <div className="mx-auto grid max-w-xl grid-cols-2 gap-4 place-items-center sm:grid-cols-4">
        <Ring label="Training" value={workoutScore} tone="rgba(229,199,107,.9)" />
        <Ring label="Nutrition" value={nutritionScore} tone="rgba(214,167,177,.85)" />
        <Ring label="Recovery" value={recoveryScore} tone="rgba(139,145,155,.9)" />
        <Ring label="Consistency" value={consistencyScore} tone="rgba(133,197,183,.9)" />
      </div>
    </section>
  );
}
