import { Plus } from "lucide-react";

export function FloatingQuickLogButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-primary text-white shadow-lg lg:hidden"
      aria-label="Quick log"
    >
      <Plus className="h-5 w-5" />
    </button>
  );
}
