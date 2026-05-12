import { PageTitle } from "../../components/layout/PageTitle";
import { CrudList } from "../shared";
export default function ProjectsPage() { return <div className="space-y-4"><PageTitle title="Projects" subtitle="Gestion personal/profesional" /><CrudList title="projects" keyName="projects" fields="basic" /></div>; }
