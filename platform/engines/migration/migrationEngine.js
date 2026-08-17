const fs = require("fs");
const path = require("path");
const Engine = require("../../core/engine");

class MigrationEngine extends Engine {

    constructor(){

        super("Migration Engine", "0.1.0-alpha");

        this.root=path.join(process.env.HOME,"CGP");
    }

    run(){

        const legacyRoot=path.join(
            this.root,
            "apps",
            "RainbowSixCubaBot",
            "services"
        );

        const platformRoot=path.join(
            this.root,
            "platform",
            "engines"
        );

        const legacy=[];
        const migrated=[];
        const pending=[];

        if(fs.existsSync(legacyRoot)){

            for(const entry of fs.readdirSync(legacyRoot,{withFileTypes:true})){

                if(!entry.isDirectory())
                    continue;

                const engineFile=path.join(
                    legacyRoot,
                    entry.name,
                    "engine.js"
                );

                if(!fs.existsSync(engineFile))
                    continue;

                legacy.push(entry.name);

                const target=entry.name.replace(/Engine$/i,"").toLowerCase();

                if(
                    fs.existsSync(
                        path.join(platformRoot,target)
                    )
                ){
                    migrated.push(entry.name);
                }else{
                    pending.push({
                        legacy:entry.name,
                        target
                    });
                }

            }

        }

        return{
            generatedAt:new Date().toISOString(),
            totalLegacy:legacy.length,
            migrated,
            pending
        };

    }

}

module.exports=MigrationEngine;
