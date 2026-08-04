const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../..");

const migration = require(
    path.join(
        ROOT,
        "platform",
        "engines",
        "migration"
    )
)();

const report = migration.run();

const platformRoot = path.join(ROOT, "platform", "engines");
const legacyRoot = path.join(ROOT, "apps", "RainbowSixCubaBot", "services");

let created = 0;
let skipped = 0;

for (const engine of report.pending) {

    const targetDir = path.join(platformRoot, engine.target);

    if (fs.existsSync(targetDir)) {
        skipped++;
        continue;
    }

    fs.mkdirSync(targetDir, { recursive: true });

    const legacyPath = path.join(
        legacyRoot,
        engine.legacy,
        "engine"
    ).replace(/\\/g,"/");

    fs.writeFileSync(
        path.join(targetDir,"engine.js"),
`module.exports = require("${legacyPath}");
`
    );

    fs.writeFileSync(
        path.join(targetDir,"index.js"),
`module.exports = require("./engine");
`
    );

    fs.writeFileSync(
        path.join(targetDir,`${engine.target}Engine.js`),
`/*
 * CGP Compatibility Bridge
 *
 * Legacy:
 * apps/RainbowSixCubaBot/services/${engine.legacy}
 *
 * This bridge will be replaced by the native implementation
 * during Phase 2 migration.
 */

module.exports = require("./engine");
`
    );

    created++;
}

console.log("");
console.log("==================================");
console.log("      CGP MIGRATION ENGINE");
console.log("==================================");
console.log("");

console.log("Pending Bridges :", report.pending.length);
console.log("Created         :", created);
console.log("Skipped         :", skipped);
console.log("");

console.log("Migration completed.");
