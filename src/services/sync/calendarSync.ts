import { syncCelesteCalendar } from "../githubCalendarSync";

export async function syncCalendarBackground() {
  return syncCelesteCalendar();
}
