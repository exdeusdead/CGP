const fs = require("fs");
const path = require("path");

const ROOT = path.join(process.env.HOME, "CGP");

const SEARCH_PATHS = [
    path.join(ROOT, "platform", "engines"),
    path.join(ROOT, "apps", "RainbowSixCubaBot", "services")
];

const registry = [];
const names = new Set();

function loadEngine(engineFile) {

    try {

        const exported = require(engineFile);

        const engine =
            typeof exported === "function"
                ? exported()
                : exported;

        if (!engine)
            throw new Error("Engine returned null");

        if (typeof engine.name !== "string")
            throw new Error("Missing engine.name");

        if (typeof engine.version !== "string")
            throw new Error("Missing engine.version");

        if (typeof engine.status !== "string")
            throw new Error("Missing engine.status");

        const runtimeContract = [
            "dependencies",
            "initialize",
            "health",
            "diagnostics"
        ];

        const missing = runtimeContract.filter(
            fn => typeof engine[fn] !== "function"
        );

        if (missing.length) {

            console.log(
                `[EngineRegistry] Skipping tool "${engine.name}" (${missing.join(", ")})`
            );

            return;

        }

        if (names.has(engine.name))
            throw new Error(`Duplicate engine "${engine.name}"`);

        names.add(engine.name);

        registry.push(engine);

    } catch (err) {

        console.error(
            `[EngineRegistry] ${engineFile}\n  ${err.message}`
        );

    }

}

function discover(dir) {

    if (!fs.existsSync(dir))
        return;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {

        if (!entry.isDirectory())
            continue;

        const full = path.join(dir, entry.name);

        const engineFile = path.join(full, "engine.js");

        if (fs.existsSync(engineFile))
            loadEngine(engineFile);

        discover(full);

    }

}

SEARCH_PATHS.forEach(discover);

registry.sort((a, b) => a.name.localeCompare(b.name));

module.exports = registry;
