const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../..");

const engine = process.argv[3] || "loggerEngine";

const root = path.join(
    ROOT,
    "apps",
    "RainbowSixCubaBot",
    "services",
    engine
);

if(!fs.existsSync(root)){
    console.error("Engine not found:",engine);
    process.exit(1);
}

const report={
    engine,
    root,
    files:[],
    requires:[]
};

function walk(dir){

    for(const entry of fs.readdirSync(dir,{withFileTypes:true})){

        const full=path.join(dir,entry.name);

        if(entry.isDirectory()){
            walk(full);
            continue;
        }

        const rel=path.relative(root,full);

        report.files.push(rel);

        if(!entry.name.endsWith(".js"))
            continue;

        const text=fs.readFileSync(full,"utf8");

        const matches=[
            ...text.matchAll(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g)
        ];

        for(const m of matches){

            report.requires.push({
                file:rel,
                require:m[1]
            });

        }

    }

}

walk(root);

const out=path.join(
    ROOT,
    "audits",
    `${engine}-analysis.json`
);

fs.writeFileSync(
    out,
    JSON.stringify(report,null,2)
);

console.log("");
console.log("================================");
console.log("      ENGINE ANALYZER");
console.log("================================");
console.log("");

console.log("Engine :",engine);
console.log("Files  :",report.files.length);
console.log("Requires:",report.requires.length);

console.log("");
console.log(out);
console.log("");
