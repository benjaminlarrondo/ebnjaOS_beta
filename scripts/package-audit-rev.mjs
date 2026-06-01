import { cp, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { homedir } from "node:os";
import { execSync } from "node:child_process";

const HOME = homedir();
const DESKTOP = path.join(HOME, "Desktop");
const AUDIT_PREFIX = "ebnjaOS_AUDIT_rev_";
const PROD_AUDIT_ROOT = path.join(DESKTOP, "ebnjaOS_PRODUCTION_AUDIT");
const PROJECT_ROOT = process.cwd();

function pad2(value) {
  return String(value).padStart(2, "0");
}

async function listDesktopEntries() {
  try {
    return await readdir(DESKTOP, { withFileTypes: true });
  } catch {
    return [];
  }
}

async function nextAuditRevision() {
  const entries = await listDesktopEntries();
  let max = 0;
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const match = entry.name.match(/^ebnjaOS_AUDIT_rev_(\d+)$/);
    if (!match) continue;
    max = Math.max(max, Number(match[1]));
  }
  return pad2(max + 1);
}

async function latestProductionRevisionScreenshots() {
  const entries = await readdir(PROD_AUDIT_ROOT, { withFileTypes: true });
  const revisions = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .map((name) => ({ name, match: name.match(/^rev_(\d+)$/) }))
    .filter((value) => value.match)
    .map((value) => ({ name: value.name, number: Number(value.match[1]) }))
    .sort((a, b) => b.number - a.number);

  const latest = revisions[0];
  if (!latest) return null;
  return path.join(PROD_AUDIT_ROOT, latest.name, "screenshots");
}

async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

async function copyIfExists(source, target) {
  try {
    await stat(source);
    await cp(source, target, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

function shell(command) {
  return execSync(command, { encoding: "utf8" }).trim();
}

async function main() {
  const revision = await nextAuditRevision();
  const auditFolderName = `${AUDIT_PREFIX}${revision}`;
  const auditFolder = path.join(DESKTOP, auditFolderName);
  const screenshotsRoot = path.join(auditFolder, "screenshots");
  const desktopShots = path.join(screenshotsRoot, "desktop");
  const mobileShots = path.join(screenshotsRoot, "mobile");
  const docsFolder = path.join(auditFolder, "docs");
  const implementationFolder = path.join(auditFolder, "implementacion");
  const technicalAuditFolder = path.join(auditFolder, "auditoria_tecnica");

  await ensureDir(desktopShots);
  await ensureDir(mobileShots);
  await ensureDir(docsFolder);
  await ensureDir(implementationFolder);
  await ensureDir(technicalAuditFolder);

  const sourceScreenshots = await latestProductionRevisionScreenshots();
  if (sourceScreenshots) {
    const shots = await readdir(sourceScreenshots);
    for (const shot of shots) {
      const source = path.join(sourceScreenshots, shot);
      const lower = shot.toLowerCase();
      const targetDir =
        lower.includes("iphone") || lower.includes("mobile")
          ? mobileShots
          : desktopShots;
      await cp(source, path.join(targetDir, shot));
    }
  }

  const docsToCopy = [
    "STATUS.md",
    "CHANGELOG_AI.md",
    "OBJECTIVES_MVP.md",
    "TRACKING_TODAY_IMPLEMENTATION.md",
    "TRACKING_IMPLEMENTATION.md",
    "NETWORK_CLEANUP.md",
    "NETWORK_LAYER_AUDIT.md",
    "FALLBACK_STRATEGY.md",
  ];

  for (const file of docsToCopy) {
    await copyIfExists(path.join(PROJECT_ROOT, "docs", file), path.join(docsFolder, file));
  }

  const implementationCandidates = [
    "OBJECTIVES_MVP.md",
    "TRACKING_TODAY_IMPLEMENTATION.md",
    "TRACKING_IMPLEMENTATION.md",
  ];
  for (const file of implementationCandidates) {
    await copyIfExists(path.join(PROJECT_ROOT, "docs", file), path.join(implementationFolder, file));
  }

  const technicalCandidates = [
    "NETWORK_LAYER_AUDIT.md",
    "TECH_AUDIT.md",
    "UI_AUDIT.md",
    "FUNCTIONAL_CHECKLIST.md",
    "PERFORMANCE_REPORT.md",
  ];
  for (const file of technicalCandidates) {
    await copyIfExists(path.join(PROJECT_ROOT, "docs", file), path.join(technicalAuditFolder, file));
  }

  const metadata = {
    revision: revision,
    generatedAt: new Date().toISOString(),
    projectRoot: PROJECT_ROOT,
    gitCommit: shell("git rev-parse --short HEAD"),
    gitBranch: shell("git rev-parse --abbrev-ref HEAD"),
    screenshotsSource: sourceScreenshots,
    packageName: auditFolderName,
  };

  await writeFile(path.join(auditFolder, "MANIFEST.json"), JSON.stringify(metadata, null, 2), "utf8");

  const zipPath = path.join(DESKTOP, `${auditFolderName}.zip`);
  shell(`ditto -c -k "${auditFolder}" "${zipPath}"`);

  console.log(auditFolder);
  console.log(zipPath);
}

main().catch((error) => {
  console.error("Failed to package audit revision:", error);
  process.exit(1);
});
