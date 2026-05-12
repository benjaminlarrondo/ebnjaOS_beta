import type { Exercise } from "../../data/fitnessPlan";

export function ExerciseRow({ exercise }: { exercise: Exercise }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-borderc p-2.5">
      <div>
        <p className="text-sm font-medium">{exercise.name}</p>
        <p className="text-xs text-texts">{exercise.prescription}</p>
      </div>
      <div className="text-right text-[11px] text-texts">
        {exercise.rest && <p>{exercise.rest}</p>}
        {exercise.effort && <p>{exercise.effort}</p>}
      </div>
    </div>
  );
}
