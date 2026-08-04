const path = require("path");

const ROOT = path.resolve(__dirname, "../../..");

const registry = require(
    path.join(ROOT, "platform/core/engineRegistry")
);

console.log("");
console.log("========================================");
console.log("     ENGINE CONTRACT VALIDATION");
console.log("========================================");
console.log("");

const checks = [
    "name",
    "version",
    "dependencies",
    "initialize",
    "health",
    "diagnostics"
];

let ok = 0;
let failed = 0;

for (const engine of registry) {

    const title =
        engine?.name ||
        engine?.constructor?.name ||
        "<unknown>";

    const errors = [];

    for (const field of checks) {

        if (!(field in engine)) {
            errors.push(`Missing ${field}`);
            continue;
        }

        if (
            ["dependencies","initialize","health","diagnostics"].includes(field) &&
            typeof engine[field] !== "function"
        ) {
            errors.push(`${field} is not a function`);
        }
    }

    if (errors.length) {

        failed++;

        console.log(`✖ ${title}`);

        for (const err of errors)
            console.log(`   - ${err}`);

        console.log("");

    } else {

        ok++;
        console.log(`✔ ${title}`);
    }
}

console.log("");
console.log("----------------------------------------");
console.log(`Passed : ${ok}`);
console.log(`Failed : ${failed}`);
console.log("");
