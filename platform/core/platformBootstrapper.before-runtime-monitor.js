const registry = require("./engineRegistry");
const resolver = require("./dependencyResolver");

class PlatformBootstrapper {

    constructor() {

        this.context = {
            platform: this,
            services: new Map(),
            engines: new Map()
        };

        this.registry = registry;
        this.order = [];
        this.initialized = false;
        this.started = false;
    }

    registerService(name, service) {

        this.context.services.set(name, service);
        this.context[name] = service;

    }

    getService(name) {
        return this.context.services.get(name);
    }

    async initialize() {

        if (this.initialized)
            return this.context;

        this.order = resolver.resolve(this.registry);

        console.log("");
        console.log("======================================");
        console.log(" PLATFORM INITIALIZATION");
        console.log("======================================");
        console.log("");

        for (const engine of this.order) {

            console.log(`Initializing ${engine.name}...`);

            if (typeof engine.initialize === "function")
                await engine.initialize(this.context);

            this.context.engines.set(engine.name, engine);

        }

        this.initialized = true;

        console.log("");
        console.log(`Initialized ${this.order.length} runtime engines.`);
        console.log(`Registered services : ${this.context.services.size}`);
        console.log("");

        return this.context;

    }

    async start() {

        if (this.started)
            return;

        console.log("");
        console.log("======================================");
        console.log(" PLATFORM START");
        console.log("======================================");
        console.log("");

        for (const engine of this.order) {

            if (typeof engine.start !== "function")
                continue;

            console.log(`Starting ${engine.name}...`);

            await engine.start(this.context);

        }

        this.started = true;

        console.log("");
        console.log("Platform Started");
        console.log("");

    }

    async stop() {

        console.log("");
        console.log("======================================");
        console.log(" PLATFORM STOP");
        console.log("======================================");
        console.log("");

        for (const engine of [...this.order].reverse()) {

            if (typeof engine.stop !== "function")
                continue;

            console.log(`Stopping ${engine.name}...`);

            await engine.stop(this.context);

        }

        this.started = false;

        console.log("");
        console.log("Platform Stopped");
        console.log("");

    }

    getContext() {
        return this.context;
    }

    getRegistry() {
        return this.registry;
    }

    getOrder() {
        return this.order;
    }

}

module.exports = PlatformBootstrapper;
