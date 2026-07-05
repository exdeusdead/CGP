const engineRegistry = require("./engineRegistry");
const ServiceRegistry = require("./serviceRegistry");
const EventBus = require("./eventBus");
const releaseManifest = require("./releaseManifest");

class PlatformCore {
  constructor() {
    this.name = "Rainbow Six CUBA Platform";
    this.version = "0.1.0-alpha";
    this.engines = new Map();
    this.services = new ServiceRegistry();
    this.events = new EventBus();
    this.startedAt = new Date();

    for (const engine of engineRegistry) {
      this.register(engine.name, engine);
    }
  }

  register(name, engine) {
    this.engines.set(name, engine);
  }

  get(name) {
    return this.engines.get(name);
  }

  registerService(name, service) {
    return this.services.register(name, service);
  }

  getService(name) {
    return this.services.get(name);
  }

  buildContext(baseContext = {}) {
    return {
      ...baseContext,
      platform: this,
      services: this.services,
      events: this.events,
      storage: this.getService("storage") || null,
      startedAt: this.startedAt
    };
  }

  async initialize(context = {}) {
    console.log("======================================");
    console.log(` ${this.name}`);
    console.log(` Platform Core v${this.version}`);
    console.log("======================================");

    const runtime = context.runtime || "discord";

    const runtimeSkip = {
      stats: [
        "MediaOS",
        "Website Engine",
        "Dashboard Engine",
        "Render Engine",
        "Asset Engine",
        "Scheduler Engine",
        "Task Engine",
        "Backup Engine",
        "Distribution Engine",
        "Competition Engine"
      ]
    };

    for (const [name, engine] of this.engines) {

      if (runtimeSkip[runtime]?.includes(name)) {
        engine.status = "skipped";
        engine.skippedByRuntime = runtime;
        console.log(`Skipping Engine (${runtime}): ${name}`);
        continue;
      }

      if (typeof engine.initialize !== "function") continue;

      const deps = typeof engine.dependencies === "function" ? engine.dependencies() : [];
      const missing = deps.filter(dep => !this.getService(dep));

      if (missing.length) {
        engine.status = "blocked";
        engine.blockedReason = `Missing dependencies: ${missing.join(", ")}`;
        console.log(`Engine blocked: ${name} | ${engine.blockedReason}`);
        continue;
      }

      console.log("Loading Engine:", name);
      await engine.initialize(this.buildContext(context));

      const logger = this.getService("logger");

      if (logger && this.events && !this.__eventLoggingAttached) {
        this.__eventLoggingAttached = true;

        this.events.on("mediaOS.announcement.saved", async event => {
          logger.info("EventBus", `Event emitted: ${event.name}`, {
            event: event.name,
            emittedAt: event.emittedAt,
            payloadKeys: Object.keys(event.payload || {})
          });
        });
      }
      logger?.info?.("PlatformCore", `Engine loaded: ${name}`, {
        engine: name,
        version: engine.version || "unknown",
        status: engine.status || "unknown"
      });
    }

    const logger = this.getService("logger");
    logger?.info?.("PlatformCore", "Platform initialized", {
      version: this.version,
      engines: this.engines.size,
      services: this.services.list().length
    });

    releaseManifest.writeReleaseManifest(this.platformStatus());

    console.log("--------------------------------------");
    console.log("Platform Ready");
    console.log("--------------------------------------");

    return true;
  }

  uptimeSeconds() {
    return Math.floor((Date.now() - this.startedAt.getTime()) / 1000);
  }

  status() {
    return Array.from(this.engines.values()).map(engine => {
      if (engine.status === "skipped") {
        return {
          name: engine.name || "Unknown",
          version: engine.version || "unknown",
          status: "skipped",
          runtime: engine.skippedByRuntime || null
        };
      }

      try {
        const base = typeof engine.getStatus === "function"
          ? engine.getStatus()
          : {
              name: engine.name || "Unknown",
              version: engine.version || "unknown",
              status: engine.status || "unknown"
            };

        if (engine.blockedReason) base.reason = engine.blockedReason;
        return base;
      } catch (error) {
        return {
          name: engine.name || "Unknown",
          version: engine.version || "unknown",
          status: "status_error",
          error: error.message
        };
      }
    });
  }

  async health() {
    const results = [];

    for (const [name, engine] of this.engines) {
      if (typeof engine.health === "function") {
        try {
          const health = await engine.health(this.buildContext({}));
          results.push({
            name,
            version: engine.version || "unknown",
            ...health
          });
        } catch (error) {
          results.push({
            name,
            version: engine.version || "unknown",
            healthy: false,
            status: "error",
            lastError: error.message
          });
        }
      }
    }

    return results;
  }

  platformStatus() {
    const config = this.getService?.("config");
    const platformName = config?.get?.("platformName", this.name) || this.name;
    const platformBrand = config?.get?.("platformBrand", "Cuba Gaming") || "Cuba Gaming";
    const currentBranch = config?.get?.("currentBranch", "Rainbow Six CUBA") || "Rainbow Six CUBA";

    return {
      name: platformName,
      brand: platformBrand,
      branch: currentBranch,
      version: this.version,
      startedAt: this.startedAt,
      uptimeSeconds: this.uptimeSeconds(),
      engines: this.status(),
      services: this.services.list(),
      eventBus: this.events.stats()
    };
  }
}

module.exports = new PlatformCore();
