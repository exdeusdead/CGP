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
    }

    registerService(name, service) {

        this.context.services.set(name, service);

        // Compatibilidad con los engines existentes
        this.context[name] = service;

    }

    getService(name) {
        return this.context.services.get(name);
    }

    initialize() {

        this.order = resolver.resolve(this.registry);

        console.log("");
        console.log("======================================");
        console.log("      PLATFORM INITIALIZATION");
        console.log("======================================");
        console.log("");

        for (const engine of this.order) {

            console.log(`Initializing ${engine.name}...`);

            if (typeof engine.initialize === "function") {
                engine.initialize(this.context);
            }

            this.context.engines.set(engine.name, engine);

        }

        console.log("");
        console.log(`Initialized ${this.order.length} runtime engines.`);
        console.log(`Registered services : ${this.context.services.size}`);
        console.log("");

        return this.context;

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
