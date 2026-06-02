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
}: {
  workoutScore: number;
  nutritionScore: number;
  recoveryScore: number;
}) {
  return (
    <section className="card">
      <div className="mb-3">
        <p className="eyebrow">Activity Rings</p>
        <h3 className="text-sm font-semibold text-textp">Entreno, nutrición y recuperación</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Ring label="Entreno" value={workoutScore} tone="rgba(229,199,107,.9)" />
        <Ring label="Nutrición" value={nutritionScore} tone="rgba(214,167,177,.85)" />
        <Ring label="Recuperación" value={recoveryScore} tone="rgba(139,145,155,.9)" />
      </div>
    </section>
  );
}

