const fs = require("fs");
const acorn = require("acorn");
const walk = require("acorn-walk");

function finding(rule, file, node, message, severity = "warning") {
    return {
        rule,
        severity,
        file,
        line: node?.loc?.start?.line || null,
        column: node?.loc?.start?.column ?? null,
        message
    };
}

function propertyKey(property) {
    if (!property || property.computed)
        return null;

    const key = property.key;

    if (!key)
        return null;

    if (key.type === "Identifier")
        return key.name;

    if (key.type === "Literal")
        return String(key.value);

    return null;
}

function analyzeJavaScriptFile(file) {
    const findings = [];

    let source;

    try {
        source = fs.readFileSync(file, "utf8");
    } catch (error) {
        findings.push({
            rule: "file-read-error",
            severity: "error",
            file,
            line: null,
            column: null,
            message: error.message
        });

        return findings;
    }

    let ast;

    try {
        ast = acorn.parse(source, {
            ecmaVersion: "latest",
            sourceType: "script",
            locations: true,
            allowHashBang: true
        });
    } catch (error) {
        findings.push({
            rule: "javascript-parse-error",
            severity: "error",
            file,
            line: error.loc?.line || null,
            column: error.loc?.column ?? null,
            message: error.message
        });

        return findings;
    }

    walk.simple(ast, {
        ObjectExpression(node) {
            const keys = new Map();

            for (const property of node.properties) {
                if (property.type !== "Property")
                    continue;

                const key = propertyKey(property);

                if (key === null)
                    continue;

                if (keys.has(key)) {
                    findings.push(
                        finding(
                            "duplicate-object-key",
                            file,
                            property,
                            `Duplicate object key "${key}".`
                        )
                    );
                } else {
                    keys.set(key, property);
                }
            }
        }
    });

    return findings;
}

function analyzeJavaScriptFiles(files = []) {
    const findings = [];

    for (const file of files) {
        findings.push(...analyzeJavaScriptFile(file));
    }

    return findings;
}

module.exports = {
    analyzeJavaScriptFile,
    analyzeJavaScriptFiles
};
