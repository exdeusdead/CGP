class RuntimeMonitor {

    constructor(platform) {
        this.platform = platform;
    }

    getSnapshot() {

        const engines = [];

        for (const engine of this.platform.getEngines().values()) {

            engines.push({
                name: engine.name,
                version: engine.version,
                status: engine.status,
                startedAt: engine.startedAt,
                lastError: engine.lastError
            });

        }

        return {
            initialized: this.platform.initialized,
            started: this.platform.started,
            engineCount: engines.length,
            engines
        };

    }

    async getHealth() {

        const health = [];

        for (const engine of this.platform.getEngines().values()) {

            if (typeof engine.health === "function")
                health.push(await engine.health());

        }

        return health;

    }

    getRuntimeInfo() {

        return {
            pid: process.pid,
            node: process.version,
            platform: process.platform,
            arch: process.arch,
            uptime: Math.floor(process.uptime())
        };

    }

    getMemoryInfo() {

        const m = process.memoryUsage();

        return {
            rss: m.rss,
            heapTotal: m.heapTotal,
            heapUsed: m.heapUsed,
            external: m.external,
            arrayBuffers: m.arrayBuffers
        };

    }

    getEngineSummary() {

        const summary = {
            total: 0,
            initialized: 0,
            running: 0,
            stopped: 0,
            disabled: 0,
            failed: 0
        };

        for (const engine of this.platform.getEngines().values()) {

            summary.total++;

            switch (engine.status) {

                case "initialized":
                    summary.initialized++;
                    break;

                case "running":
                case "started":
                    summary.running++;
                    break;

                case "stopped":
                    summary.stopped++;
                    break;

                case "disabled":
                    summary.disabled++;
                    break;

                default:
                    if (engine.lastError)
                        summary.failed++;

            }

        }

        return summary;

    }

    getServiceSummary() {

        return {
            count: this.platform.getServiceNames().length,
            names: this.platform.getServiceNames()
        };

    }

}

module.exports = RuntimeMonitor;
