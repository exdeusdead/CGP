const fs = require("fs");
const path = require("path");
const acorn = require("acorn");
const walk = require("acorn-walk");

function parse(file) {
    return acorn.parse(
        fs.readFileSync(file, "utf8"),
        {
            ecmaVersion: "latest",
            sourceType: "script"
        }
    );
}

function getActiveEngineSources(root) {

    const enginesRoot = path.join(
        root,
        "platform",
        "engines"
    );

    const sources = [];

    if (!fs.existsSync(enginesRoot))
        return sources;

    function resolveStaticRequire(node, fromFile) {

        if (
            node?.type === "Literal" &&
            typeof node.value === "string"
        ) {
            const request = node.value;

            if (
                request.startsWith(".") ||
                path.isAbsolute(request)
            ) {
                try {
                    return require.resolve(
                        path.isAbsolute(request)
                            ? request
                            : path.resolve(
                                path.dirname(fromFile),
                                request
                            )
                    );
                } catch {
                    return null;
                }
            }

            return null;
        }

        /*
         * Supports bridges such as Logger:
         *
         * require(
         *   require("path").join(
         *     process.env.HOME,
         *     "CGP",
         *     "apps",
         *     ...
         *   )
         * )
         */
        if (
            node?.type === "CallExpression" &&
            node.callee?.type === "MemberExpression" &&
            node.callee.property?.name === "join"
        ) {
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

            try {
                return require.resolve(
                    path.join(...parts)
                );
            } catch {
                return null;
            }
        }

        return null;
    }

    function resolveEngineSource(entrypoint) {

        let ast;

        try {
            ast = parse(entrypoint);
        } catch {
            return entrypoint;
        }

        /*
         * If the discovered entrypoint registers services itself,
         * it is already the active implementation.
         *
         * This prevents ordinary dependencies such as
         * ../../core/engine from being mistaken for wrappers.
         */
        let registersService = false;

        walk.simple(ast, {
            CallExpression(node) {

                if (
                    node.callee?.property?.name === "registerService" &&
                    node.arguments?.[0]?.type === "Literal" &&
                    typeof node.arguments[0].value === "string"
                ) {
                    registersService = true;
                }
            }
        });

        if (registersService)
            return entrypoint;

        let resolved = null;

        walk.simple(ast, {
            CallExpression(node) {

                if (
                    resolved ||
                    node.callee?.type !== "Identifier" ||
                    node.callee.name !== "require" ||
                    node.arguments?.length !== 1
                ) {
                    return;
                }

                const candidate =
                    resolveStaticRequire(
                        node.arguments[0],
                        entrypoint
                    );

                if (!candidate)
                    return;

                /*
                 * Never treat Platform Core's Engine base class
                 * as an engine implementation.
                 */
                const coreEngine = path.join(
                    root,
                    "platform",
                    "core",
                    "engine.js"
                );

                if (
                    path.resolve(candidate) ===
                    path.resolve(coreEngine)
                ) {
                    return;
                }

                const base =
                    path.basename(candidate);

                if (
                    base === "engine.js" ||
                    /Engine\.js$/i.test(base)
                ) {
                    resolved = candidate;
                }
            }
        });

        return resolved || entrypoint;
    }

    for (const entry of fs.readdirSync(
        enginesRoot,
        { withFileTypes: true }
    )) {

        if (!entry.isDirectory())
            continue;

        const entrypoint = path.join(
            enginesRoot,
            entry.name,
            "engine.js"
        );

        if (!fs.existsSync(entrypoint))
            continue;

        sources.push(
            resolveEngineSource(entrypoint)
        );
    }

    return sources;
}

function analyzeServiceRegistry(root) {

    const providers = new Map();
    const findings = [];

    const activeSources =
        getActiveEngineSources(root);

    function addProvider(name, file) {

        if (!providers.has(name))
            providers.set(name, []);

        providers.get(name).push(
            path.relative(root, file)
        );
    }

    for (const file of activeSources) {

        let ast;

        try {
            ast = parse(file);
        } catch (error) {
            findings.push({
                rule: "service-provider-parse-error",
                severity: "error",
                file: path.relative(root, file),
                message: error.message
            });
            continue;
        }

        walk.simple(ast, {
            CallExpression(node) {

                const property =
                    node.callee?.property?.name;

                const argument =
                    node.arguments?.[0];

                if (
                    property === "registerService" &&
                    argument?.type === "Literal" &&
                    typeof argument.value === "string"
                ) {
                    addProvider(
                        argument.value,
                        file
                    );
                }
            }
        });
    }

    /*
     * Platform Core bootstraps runtimeMonitor directly
     * through ServiceRegistry.register().
     */
    addProvider(
        "runtimeMonitor",
        path.join(
            root,
            "platform",
            "core",
            "platformCore.js"
        )
    );

    for (const [name, owners] of providers) {

        if (owners.length <= 1)
            continue;

        findings.push({
            rule: "duplicate-service-provider",
            severity: "error",
            service: name,
            providers: owners,
            message:
                `Service "${name}" has multiple active providers.`
        });
    }

    const providerList =
        [...providers.entries()]
            .map(([name, owners]) => ({
                name,
                providers: owners
            }))
            .sort(
                (a, b) =>
                    a.name.localeCompare(b.name)
            );

    return {
        activeEngineSources: activeSources.length,
        providers: providerList,
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
    getActiveEngineSources,
    analyzeServiceRegistry
};
