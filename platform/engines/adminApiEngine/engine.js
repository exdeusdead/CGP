const express = require("express");
const Engine = require("../../core/engine");
const createPlatformApi = require("../../api/platformApi");

class AdminApiEngine extends Engine {

    constructor() {
        super("Admin API Engine", "0.1.0-alpha");

        this.app = null;
        this.server = null;
        this.port = 3200;
    }

    dependencies() {
        return ["logger", "config"];
    }

    async initialize(context = {}) {

        this.logger = context.platform.getService("logger");
        this.config = context.platform.getService("config");
        this.runtime = context.platform.getService("runtimeMonitor");

        this.port = this.config?.get("adminApi.port", 3200);

        this.app = express();

        this.app.use("/platform", createPlatformApi(context.platform));

        this.status = "initialized";

        console.log("Admin API Engine Loaded");

        return true;

    }

    async start() {

        if (this.server)
            return true;

        this.server = await new Promise((resolve, reject) => {

            const server = this.app.listen(this.port, "127.0.0.1", () => {
                console.log(`Admin API listening on ${this.port}`);
                resolve(server);
            });

            server.once("error", reject);

        });

        this.status = "running";

        return true;

    }

    async stop() {

        if (!this.server)
            return true;

        await new Promise(resolve => this.server.close(resolve));

        this.server = null;
        this.status = "stopped";

        return true;

    }

}

module.exports = new AdminApiEngine();
