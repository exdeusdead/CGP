const fs = require("fs");
const path = require("path");

const MANIFEST_PATH = path.join(__dirname, "..", "data", "storage", "manifests", "platform_release.json");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeReleaseManifest(platformStatus) {
  ensureDir(path.dirname(MANIFEST_PATH));

  const manifest = {
    platform: platformStatus.name,
    version: platformStatus.version,
      status: platformStatus.releaseStatus || platformStatus.status || null,
      currentMilestone: platformStatus.currentMilestone || null,
      status: platformStatus.releaseStatus || platformStatus.status || null,
      currentMilestone: platformStatus.currentMilestone || null,
    generatedAt: new Date().toISOString(),
    engines: platformStatus.engines.map(engine => ({
      name: engine.name,
      version: engine.version,
      status: engine.status
    })),
    services: platformStatus.services
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  return manifest;
}

function readReleaseManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  } catch {
    return null;
  }
}

module.exports = {
  writeReleaseManifest,
  readReleaseManifest,
  MANIFEST_PATH
};
