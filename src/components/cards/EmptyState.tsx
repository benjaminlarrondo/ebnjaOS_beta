import { Button } from "../ui/button";
export function EmptyState({ text, action }: { text: string; action?: () => void }) {
  return <div className="rounded-xl border border-dashed border-borderc p-4 text-sm text-texts">{text}{action && <div className="mt-2"><Button onClick={action}>Crear</Button></div>}</div>;
}
