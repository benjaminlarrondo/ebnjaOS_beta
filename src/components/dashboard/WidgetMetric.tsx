export function WidgetMetric({
  label,
  value,
  hint,
  boxed = false,
  size = "md",
  labelPosition = "top",
}: {
  label: string;
  value: string | number;
  hint?: string;
  boxed?: boolean;
  size?: "sm" | "md" | "lg";
  labelPosition?: "top" | "bottom";
}) {
  const valueClassName =
    size === "lg"
      ? "text-2xl font-semibold leading-none text-textp sm:text-3xl"
      : size === "sm"
        ? "text-lg font-semibold leading-snug text-textp"
        : "metric-value";
  const content = (
    <>
      {labelPosition === "top" && <p className="text-xs font-medium text-texts">{label}</p>}
      <p className={`${labelPosition === "top" ? "mt-2" : ""} ${valueClassName}`}>{value}</p>
      {labelPosition === "bottom" && <p className="mt-1 text-xs text-texts">{label}</p>}
      {hint && <p className="mt-2 text-[11px] text-texts">{hint}</p>}
    </>
  );

  if (boxed) {
    return <div className="rounded-2xl border border-borderc bg-white p-3 shadow-sm">{content}</div>;
  }

  return <div>{content}</div>;
}
