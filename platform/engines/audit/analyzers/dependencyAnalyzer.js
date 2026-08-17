const dependencyResolver = require("../../../core/dependencyResolver");

function createFinding(
    rule,
    engine,
    dependency,
    message,
    severity = "error"
) {
    return {
        rule,
        severity,
        engine: engine || null,
        dependency: dependency || null,
        message
    };
}

function analyzeEngineDependencies(engines = []) {

    const findings = [];
    const dependencies = [];

    for (const engine of engines) {

        let declared;

        try {
            declared = engine.dependencies();
        } catch (error) {
            findings.push(
                createFinding(
                    "dependency-declaration-error",
                    engine.name,
                    null,
                    error.message
                )
            );

            continue;
        }

        if (!Array.isArray(declared)) {
            findings.push(
                createFinding(
                    "invalid-dependency-declaration",
                    engine.name,
                    null,
                    "dependencies() must return an array."
                )
            );

            continue;
        }

        for (const dependency of declared) {

            if (typeof dependency !== "string") {
                findings.push(
                    createFinding(
                        "invalid-dependency-name",
                        engine.name,
                        null,
                        "Dependency names must be strings."
                    )
                );

                continue;
            }

            const matches = engines.filter(candidate =>
                candidate.name.toLowerCase().startsWith(
                    dependency.toLowerCase()
                )
            );

            dependencies.push({
                engine: engine.name,
                dependency,
                matches: matches.map(candidate => candidate.name)
            });

            if (matches.length === 0) {
                findings.push(
                    createFinding(
                        "missing-engine-dependency",
                        engine.name,
                        dependency,
                        `Dependency "${dependency}" does not resolve to an engine.`
                    )
                );
            }

            if (matches.length > 1) {
                findings.push(
                    createFinding(
                        "ambiguous-engine-dependency",
                        engine.name,
                        dependency,
                        `Dependency "${dependency}" resolves to multiple engines: ${matches
                            .map(candidate => candidate.name)
                            .join(", ")}.`
                    )
                );
            }
        }
    }

    let resolutionOrder = [];

    try {

        resolutionOrder = dependencyResolver
            .resolve(engines)
            .map(engine => engine.name);

    } catch (error) {

        findings.push(
            createFinding(
                "dependency-resolution-error",
                null,
                null,
                error.message
            )
        );

    }

    return {
        scannedEngines: engines.length,
        dependencies,
        resolutionOrder,
        findings,
        summary: {
            total: findings.length,
            errors: findings.filter(
                finding => finding.severity === "error"
            ).length,
            warnings: findings.filter(
                finding => finding.severity === "warning"
            ).length
        }
    };
}

module.exports = {
    analyzeEngineDependencies
};
