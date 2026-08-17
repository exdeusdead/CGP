const fs = require("fs");
const path = require("path");
const acorn = require("acorn");
const walk = require("acorn-walk");

function finding(rule, severity, file, message, target = null) {
    return {
        rule,
        severity,
        file,
        target,
        message
    };
}

function analyzeEngineBridges(root) {

    const enginesRoot = path.join(root, "platform", "engines");
    const bridges = [];
    const findings = [];

    if (!fs.existsSync(enginesRoot)) {
        return {
            scannedEntrypoints: 0,
            bridges,
            findings: [
                finding(
                    "engine-root-missing",
                    "error",
                    enginesRoot,
                    "Platform engine directory does not exist."
                )
            ],
            summary: {
                total: 1,
                errors: 1,
                warnings: 0
            }
        };
    }

    const directories = fs.readdirSync(
        enginesRoot,
        { withFileTypes: true }
    ).filter(entry => entry.isDirectory());

    let scannedEntrypoints = 0;

    for (const directory of directories) {

        const entrypoint = path.join(
            enginesRoot,
            directory.name,
            "engine.js"
        );

        if (!fs.existsSync(entrypoint))
            continue;

        scannedEntrypoints++;

        let ast;

        try {
            ast = acorn.parse(
                fs.readFileSync(entrypoint, "utf8"),
                {
                    ecmaVersion: "latest",
                    sourceType: "script"
                }
            );
        } catch (error) {
            findings.push(
                finding(
                    "bridge-entrypoint-parse-error",
                    "error",
                    path.relative(root, entrypoint),
                    error.message
                )
            );
            continue;
        }

        let target = null;
        let dynamic = false;

        function evaluatePathJoin(node) {

            if (
                node?.type !== "CallExpression" ||
                node.callee?.type !== "MemberExpression" ||
                node.callee.property?.name !== "join"
            ) {
                return null;
            }

            const object = node.callee.object;

            const pathRequire =
                object?.type === "CallExpression" &&
                object.callee?.type === "Identifier" &&
                object.callee.name === "require" &&
                object.arguments?.length === 1 &&
                object.arguments[0]?.type === "Literal" &&
                object.arguments[0].value === "path";

            if (!pathRequire)
                return null;

            const parts = [];

            for (const argument of node.arguments) {

                if (
                    argument?.type === "Literal" &&
                    typeof argument.value === "string"
                ) {
                    parts.push(argument.value);
                    continue;
                }

                const isHome =
                    argument?.type === "MemberExpression" &&
                    argument.property?.name === "HOME" &&
                    argument.object?.type === "MemberExpression" &&
                    argument.object.property?.name === "env" &&
                    argument.object.object?.type === "Identifier" &&
                    argument.object.object.name === "process";

                if (isHome && process.env.HOME) {
                    parts.push(process.env.HOME);
                    continue;
                }

                return null;
            }

            const resolved = path.join(...parts);

            if (
                !resolved.includes(
                    path.join(
                        "apps",
                        "RainbowSixCubaBot"
                    )
                )
            ) {
                return null;
            }

            return resolved;
        }

        walk.simple(ast, {
            CallExpression(node) {

                if (
                    target !== null ||
                    node.callee?.type !== "Identifier" ||
                    node.callee.name !== "require" ||
                    node.arguments?.length !== 1
                ) {
                    return;
                }

                const argument = node.arguments[0];

                if (
                    argument?.type === "Literal" &&
                    typeof argument.value === "string" &&
                    argument.value.includes(
                        "/apps/RainbowSixCubaBot/"
                    )
                ) {
                    target = argument.value;
                    return;
                }

                const dynamicTarget =
                    evaluatePathJoin(argument);

                if (dynamicTarget) {
                    target = dynamicTarget;
                    dynamic = true;
                }
            }
        });

        if (!target)
            continue;

        const relativeEntrypoint =
            path.relative(root, entrypoint);

        const bridge = {
            entrypoint: relativeEntrypoint,
            target,
            dynamic,
            absolute: path.isAbsolute(target),
            targetExists: false,
            targetResolvable: false
        };

        try {
            require.resolve(target);
            bridge.targetResolvable = true;
        } catch {
            bridge.targetResolvable = false;
        }

        try {
            bridge.targetExists =
                fs.existsSync(require.resolve(target));
        } catch {
            bridge.targetExists = false;
        }

        bridges.push(bridge);

        if (!bridge.targetResolvable) {
            findings.push(
                finding(
                    "bridge-target-unresolvable",
                    "error",
                    relativeEntrypoint,
                    `Bridge target cannot be resolved: ${target}`,
                    target
                )
            );
        }

        if (bridge.absolute && !bridge.dynamic) {
            findings.push(
                finding(
                    "absolute-engine-bridge",
                    "warning",
                    relativeEntrypoint,
                    "Engine bridge uses an absolute filesystem path.",
                    target
                )
            );
        }
    }

    return {
        scannedEntrypoints,
        bridges,
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
    analyzeEngineBridges
};
