const fs=require("fs");
const path=require("path");
const os=require("os");
const {execSync}=require("child_process");

const ROOT=path.resolve(__dirname,"../../..");
const OUT=path.join(ROOT,"tools/bootstrap/workspace-manifest.json");

function dirs(p){
    if(!fs.existsSync(p)) return [];
    return fs.readdirSync(p,{withFileTypes:true})
        .filter(x=>x.isDirectory())
        .map(x=>x.name)
        .sort();
}

function git(cmd){
    try{
        return execSync(cmd,{cwd:ROOT}).toString().trim();
    }catch{
        return null;
    }
}

const manifest={
    generatedAt:new Date().toISOString(),
    workspace:ROOT,

    platform:{
        os:os.platform(),
        release:os.release(),
        node:process.version
    },

    git:{
        branch:git("git branch --show-current"),
        commit:git("git rev-parse --short HEAD"),
        remote:git("git remote get-url origin")
    },

    platformFolders:dirs(path.join(ROOT,"platform")),

    platformEngines:dirs(path.join(ROOT,"platform","engines")),

    platformServices:dirs(path.join(ROOT,"platform","services")),

    platformProviders:dirs(path.join(ROOT,"platform","providers")),

    platformProducts:dirs(path.join(ROOT,"platform","products")),

    rootApps:dirs(path.join(ROOT,"apps")),

    rootProducts:dirs(path.join(ROOT,"products")),

    shared:dirs(path.join(ROOT,"shared")),

    tools:dirs(path.join(ROOT,"tools"))
};

fs.writeFileSync(OUT,JSON.stringify(manifest,null,2));

console.log("");
console.log("Manifest generated");
console.log("");

for(const [k,v] of Object.entries(manifest)){
    if(Array.isArray(v))
        console.log(k.padEnd(22),v.length);
}
