import { syncCelesteCalendar } from "./githubCalendarSync";

export async function syncExternalCalendars() {
  // Future-ready hook for GitHub Actions / Worker / webhook / cron.
  return syncCelesteCalendar();
}
