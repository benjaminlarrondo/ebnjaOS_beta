import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const DIST_DIR = path.resolve("dist");
const ROUTES = [
  "calendar",
  "tracking",
  "fitness",
  "tasks",
  "notes",
  "projects",
  "settings",
  "qa",
  "prompts",
  "resources",
  "review",
];

async function ensureRouteEntry(route) {
  const routeDir = path.join(DIST_DIR, route);
  const routeIndex = path.join(routeDir, "index.html");
  await mkdir(routeDir, { recursive: true });
  await copyFile(path.join(DIST_DIR, "index.html"), routeIndex);
}

async function main() {
  await Promise.all(ROUTES.map(ensureRouteEntry));
  console.log(`[gh-pages] Prepared static route entries for ${ROUTES.length} routes`);
}

main().catch((error) => {
  console.error("[gh-pages] Failed to prepare route entries", error);
  process.exitCode = 1;
});
