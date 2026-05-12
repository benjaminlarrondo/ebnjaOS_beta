import { PageTitle } from "../../components/layout/PageTitle";
import { CrudList } from "../shared";
export default function NotesPage() { return <div className="space-y-4"><PageTitle title="Notes" subtitle="Notas rapidas y estructuradas" /><CrudList title="notes" keyName="notes" fields="note" /></div>; }
