const path = require("path");

const ROOT = path.resolve(__dirname, "../../..");

const registry = require(
    path.join(ROOT, "platform", "core", "engineRegistry.js")
);

console.log("");
console.log("CGP Engine Discovery");
console.log("====================");
console.log("");

registry
    .sort((a,b)=>a.name.localeCompare(b.name))
    .forEach(engine=>{
        console.log(
            `${engine.name.padEnd(24)} ${engine.version.padEnd(12)} ${engine.status}`
        );
    });

console.log("");
console.log(`Registered Engines : ${registry.length}`);
