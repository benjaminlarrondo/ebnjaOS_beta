import { PageTitle } from "../../components/layout/PageTitle";
import { CrudList } from "../shared";
export default function ResourcesPage() { return <div className="space-y-4"><PageTitle title="Resources" subtitle="Links y referencias" /><CrudList title="resources" keyName="resources" fields="resource" /></div>; }
