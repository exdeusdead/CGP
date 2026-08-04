const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../..");

const registry = require(path.join(
    ROOT,
    "platform",
    "core",
    "engineRegistry.js"
));

function walk(dir, result = []) {
    if (!fs.existsSync(dir)) return result;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {

        if ([
            "node_modules",
            ".git",
            "logs",
            "backups"
        ].includes(entry.name))
            continue;

        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            walk(full, result);
            continue;
        }

        if (
            entry.name === "engine.js" ||
            entry.name.endsWith("Engine.js")
        ) {
            result.push(path.relative(ROOT, full));
        }
    }

    return result;
}

const files = walk(ROOT).sort();

console.log("");
console.log("======================================");
console.log("        CGP PLATFORM VERIFY");
console.log("======================================");
console.log("");

console.log("Registered Engines :", registry.length);
console.log("Engine Files       :", files.length);
console.log("");

console.log("Registered Engines");
console.log("------------------");

registry
    .slice()
    .sort((a,b)=>a.name.localeCompare(b.name))
    .forEach(engine=>{
        console.log(
            `✔ ${engine.name} (${engine.version})`
        );
    });

console.log("");

console.log("Detected Engine Files");
console.log("---------------------");

files.forEach(file=>{
    console.log("• " + file);
});

console.log("");

if (files.length < registry.length) {
    console.log("⚠ WARNING: There are fewer engine files than registered engines.");
} else if (files.length > registry.length) {
    console.log("⚠ WARNING: More engine files than registered engines were found.");
} else {
    console.log("✔ Engine counts match.");
}

console.log("");
console.log("Verify completed.");
