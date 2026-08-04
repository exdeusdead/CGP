const fs = require("fs");
const path = require("path");
const os = require("os");

class AuditEngine {

    constructor(){

        this.name="Audit Engine";
        this.version="0.1.0-alpha";
        this.status="created";

        this.root=path.resolve(__dirname,"../../..");
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

        return{

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

    }

}

module.exports=AuditEngine;
