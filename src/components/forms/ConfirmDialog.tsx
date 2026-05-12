import { Button } from "../ui/button";
export function ConfirmDialog({ open, onConfirm, onCancel }: { open: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-4"><div className="rounded-2xl bg-white p-4"><p className="mb-3">Confirmar eliminacion</p><div className="flex gap-2"><button className="btn-ghost" onClick={onCancel}>Cancelar</button><Button onClick={onConfirm}>Eliminar</Button></div></div></div>;
}
