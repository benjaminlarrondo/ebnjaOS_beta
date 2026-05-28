import type { Exercise } from "../../data/fitnessPlan";

export function ExerciseRow({ exercise }: { exercise: Exercise }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-start gap-2 rounded-lg border border-borderc p-2.5">
      <div className="min-w-0">
        <p className="break-words text-sm font-medium leading-snug">{exercise.name}</p>
        {exercise.effort && <p className="mt-0.5 text-[11px] text-texts">{exercise.effort}</p>}
      </div>
      <p className="max-w-20 text-right text-xs text-texts">{exercise.prescription}</p>
      <p className="max-w-16 text-right text-[11px] text-texts">{exercise.rest || "-"}</p>
    </div>
  );
}
