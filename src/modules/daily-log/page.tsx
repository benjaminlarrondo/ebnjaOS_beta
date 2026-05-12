import { PageTitle } from "../../components/layout/PageTitle";
import { CrudList } from "../shared";
export default function DailyLogPage() { return <div className="space-y-4"><PageTitle title="Daily Log" subtitle="Cierre y planificacion diaria" /><CrudList title="logs" keyName="logs" fields="daily" /></div>; }
