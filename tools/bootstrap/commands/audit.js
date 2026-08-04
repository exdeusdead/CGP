const fs=require("fs");
const path=require("path");

const ROOT=path.resolve(__dirname,"../../..");

const audit=require(
    path.join(
        ROOT,
        "platform",
        "engines",
        "audit"
    )
)();

const report=audit.run();

const out=path.join(
    ROOT,
    "audits",
    "platform-audit.json"
);

fs.writeFileSync(
    out,
    JSON.stringify(report,null,2)
);

console.log("");
console.log("====================================");
console.log("      CGP AUDIT ENGINE");
console.log("====================================");
console.log("");

console.log("Engine :",audit.name);
console.log("Version:",audit.version);

console.log("");

console.log("Registered Engines :",report.statistics.registeredEngines);
console.log("JavaScript Files   :",report.statistics.javascript);
console.log("JSON Files         :",report.statistics.json);
console.log("Total Files        :",report.statistics.files);

console.log("");
console.log(out);
console.log("");
