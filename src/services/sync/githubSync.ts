import { fetchOfficialCelesteCalendarState } from "../githubCalendarSync";

export async function probeGithubSyncSource() {
  return fetchOfficialCelesteCalendarState();
}
