const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../..");

const registry = require(
    path.join(ROOT, "platform", "core", "engineRegistry")
);

const rows = registry.map(engine => ({
    Engine: engine.name,
    Version: engine.version,
    Status: engine.status,
    Dependencies:
        (engine.dependencies?.() || []).join(", ") || "-"
}));

const report = {
    generatedAt: new Date().toISOString(),
    engines: rows
};

fs.mkdirSync(path.join(ROOT, "audits"), { recursive: true });

fs.writeFileSync(
    path.join(ROOT, "audits", "migration-status.json"),
    JSON.stringify(report, null, 2)
);

console.log("");
console.log("======================================");
console.log("      CGP PLATFORM STATUS");
console.log("======================================");
console.log("");

console.table(rows);

console.log("");
console.log("Runtime Engines :", rows.length);
console.log("");
console.log("Report:");
console.log("audits/migration-status.json");
