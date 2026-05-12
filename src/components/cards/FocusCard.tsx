import { Target } from "lucide-react";
import { Button } from "../ui/button";

export function FocusCard({ focus, onEdit }: { focus: string; onEdit: () => void }) {
  return (
    <section className="card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold"><Target className="h-4 w-4 text-primary" />Foco del día</h3>
        <Button className="px-2 py-1 text-xs" onClick={onEdit}>Editar</Button>
      </div>
      <p className="text-sm leading-6 text-textp">{focus}</p>
      <p className="mt-2 text-xs text-texts">{focus.length}/120</p>
    </section>
  );
}
