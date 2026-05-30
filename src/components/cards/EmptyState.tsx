import { Button } from "../ui/button";
import { EmptyState as SystemEmptyState } from "../system/EmptyState";

export function EmptyState({ text, action }: { text: string; action?: () => void }) {
  return <SystemEmptyState text={text} action={action ? <Button onClick={action}>Crear</Button> : undefined} />;
}
