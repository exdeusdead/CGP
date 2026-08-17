const fs = require("fs");
const path = require("path");

const REQUIRED_METHODS = [
    "dependencies",
    "initialize",
    "health",
    "diagnostics"
];

function finding(rule, engineFile, message, severity = "error", engine = null) {
    return {
        rule,
        severity,
        file: engineFile,
        engine: engine?.name || null,
        message
    };
}

function discoverEngineFiles(root) {
    const files = [];

    function discover(dir) {
        if (!fs.existsSync(dir))
            return;

        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (!entry.isDirectory())
                continue;

            const full = path.join(dir, entry.name);
            const engineFile = path.join(full, "engine.js");

            if (fs.existsSync(engineFile))
                files.push(engineFile);

            discover(full);
        }
    }

    discover(root);

    return files.sort();
}

function analyzeEngineContracts(root) {
    const engineFiles = discoverEngineFiles(root);
    const findings = [];
    const engines = [];
    const names = new Map();

    for (const engineFile of engineFiles) {
        let engine;

        try {
            const exported = require(engineFile);

            engine =
                typeof exported === "function"
                    ? exported()
                    : exported;

        } catch (error) {
            findings.push(
                finding(
                    "engine-load-error",
                    engineFile,
                    error.message
                )
            );

            continue;
        }

        if (!engine) {
            findings.push(
                finding(
                    "engine-null-export",
                    engineFile,
                    "Engine returned null."
                )
            );

            continue;
        }

        for (const property of ["name", "version", "status"]) {
            if (typeof engine[property] !== "string") {
                findings.push(
                    finding(
                        "engine-invalid-property",
                        engineFile,
                        `Engine property "${property}" must be a string.`,
                        "error",
                        engine
                    )
                );
            }
        }

        const missingMethods = REQUIRED_METHODS.filter(
            method => typeof engine[method] !== "function"
        );

        if (missingMethods.length) {
            findings.push(
                finding(
                    "engine-contract-missing-method",
                    engineFile,
                    `Missing runtime contract methods: ${missingMethods.join(", ")}.`,
                    "error",
                    engine
                )
            );
        }

        if (typeof engine.name === "string") {
            if (names.has(engine.name)) {
                findings.push(
                    finding(
                        "duplicate-engine-name",
                        engineFile,
                        `Duplicate engine name "${engine.name}". First declared by ${names.get(engine.name)}.`,
                        "error",
                        engine
                    )
                );
            } else {
                names.set(engine.name, engineFile);
            }
        }

        engines.push({
            name: typeof engine.name === "string" ? engine.name : null,
            version: typeof engine.version === "string" ? engine.version : null,
            status: typeof engine.status === "string" ? engine.status : null,
            file: engineFile,
            contractValid:
                typeof engine.name === "string" &&
                typeof engine.version === "string" &&
                typeof engine.status === "string" &&
                missingMethods.length === 0
        });
    }

    return {
        scannedEngines: engineFiles.length,
        engines,
        findings,
        summary: {
            total: findings.length,
            errors: findings.filter(
                item => item.severity === "error"
            ).length,
            warnings: findings.filter(
                item => item.severity === "warning"
            ).length
        }
    };
}

module.exports = {
    REQUIRED_METHODS,
    discoverEngineFiles,
    analyzeEngineContracts
};
