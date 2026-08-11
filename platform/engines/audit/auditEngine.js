const fs = require("fs");
const path = require("path");
const os = require("os");
const Engine = require("../../core/engine");

class AuditEngine extends Engine {

    constructor(){

        super("Audit Engine", "0.1.0-alpha");

        this.root=path.resolve(__dirname,"../../..");
    }

    dependencies(){
        return ["storage", "logger", "config"];
    }

    async initialize(context = {}) {
        await super.initialize(context);
        this.storage = context.storage;
        this.logger = context.platform?.getService?.("logger");
        this.events = context.events;
        if (context.platform?.registerService) {
            context.platform.registerService("audit", this);
        }
        return true;
    }

    walk(dir,result=[]){

        if(!fs.existsSync(dir))
            return result;

        for(const entry of fs.readdirSync(dir,{withFileTypes:true})){

            if([
                ".git",
                "node_modules",
                "logs",
                "backups"
            ].includes(entry.name))
                continue;

            const full=path.join(dir,entry.name);

            if(entry.isDirectory()){
                this.walk(full,result);
                continue;
            }

            result.push(path.relative(this.root,full));
        }

        return result;
    }

    run(){

        const registry=require(
            path.join(
                this.root,
                "platform",
                "core",
                "engineRegistry.js"
            )
        );

        const files=this.walk(this.root);

        const report = {

            generatedAt:new Date().toISOString(),

            platform:{

                node:process.version,
                os:os.platform(),
                release:os.release(),

                root:this.root

            },

            engines:registry.map(e=>({

                name:e.name,
                version:e.version,
                status:e.status

            })),

            statistics:{

                registeredEngines:registry.length,

                javascript:files.filter(f=>f.endsWith(".js")).length,

                json:files.filter(f=>f.endsWith(".json")).length,

                files:files.length

            }

        };
        this.storage?.saveJson("audit", "latest", report);
        this.storage?.appendJsonList("audit", "history", report, 100);
        this.logger?.info?.("AuditEngine", "Platform audit completed", report.statistics);
        return report;


    }

}

module.exports=AuditEngine;
