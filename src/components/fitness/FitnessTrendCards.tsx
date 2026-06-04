import type { FitnessTrendCardModel } from "../../modules/fitness/fitnessTrends";

function Sparkline({ values }: { values: number[] }) {
  const width = 120;
  const height = 34;
  const padding = 3;
  const safeValues = values.length ? values : [0];
  const min = Math.min(...safeValues);
  const max = Math.max(...safeValues);
  const range = max - min || 1;
  const step = safeValues.length > 1 ? (width - padding * 2) / (safeValues.length - 1) : 0;
  const points = safeValues
    .map((value, index) => {
      const x = padding + index * step;
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-9 w-full overflow-visible" aria-hidden="true">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function trendTone(trendLabel: string) {
  if (trendLabel.startsWith("↗")) return "text-primary";
  if (trendLabel.startsWith("↘")) return "text-textm";
  return "text-texts";
}

export function FitnessTrendCards({ cards }: { cards: FitnessTrendCardModel[] }) {
  return (
    <section className="card">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Trend Cards Premium</p>
          <h3 className="text-sm font-semibold text-textp">Señales ejecutivas de 30 días</h3>
        </div>
        <span className="pill-soft">Real data</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <article key={card.key} className="rounded-2xl border border-borderc bg-surface p-2.5 sm:p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-texts sm:text-xs">{card.label}</p>
                <p className="mt-1 text-base font-semibold text-textp sm:text-lg">{card.currentLabel}</p>
              </div>
              <span className={`rounded-full border border-borderc px-2 py-1 text-[10px] ${trendTone(card.trendLabel)}`}>
                {card.trendLabel}
              </span>
            </div>

            <div className="mt-2 flex items-end justify-between gap-2">
              <div>
                <p className="text-[11px] text-texts">Variación</p>
                <p className="text-[11px] font-medium text-textp sm:text-xs">{card.variationLabel}</p>
              </div>
              <p className="hidden text-[11px] text-texts sm:block">{card.sourceLabel}</p>
            </div>

            <div className={`mt-3 rounded-xl border border-borderc bg-bg px-2 py-1.5 ${card.tone === "primary" ? "text-primary" : card.tone === "accent" ? "text-textp" : "text-textm"}`}>
              <Sparkline values={card.sparkline} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
