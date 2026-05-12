export function WorkoutProgressMiniChart({ value }: { value: number }) {
  return (
    <div className="mt-2 h-2 rounded-full bg-[#edf0f4]">
      <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
