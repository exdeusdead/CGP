class PlatformClient {

    constructor(baseUrl = "http://127.0.0.1:3200/platform") {
        this.baseUrl = baseUrl;
    }

    async request(path) {

        const response = await fetch(`${this.baseUrl}${path}`);

        if (!response.ok)
            throw new Error(`Platform API ${response.status}`);

        return response.json();

    }

    getSummary() {
        return this.request("/summary");
    }

    getRuntime() {
        return this.request("/runtime");
    }

    getMemory() {
        return this.request("/memory");
    }

    getStatus() {
        return this.request("/status");
    }

    getHealth() {
        return this.request("/health");
    }

    getEngines() {
        return this.request("/engines");
    }

    getServices() {
        return this.request("/services");
    }

    async getProcesses() {
        const { execFile } = require("child_process");
        const { promisify } = require("util");
        const execFileAsync = promisify(execFile);

        const { stdout } = await execFileAsync("pm2", ["jlist"], {
            maxBuffer: 1024 * 1024
        });

        const processes = JSON.parse(stdout);

        return processes.map(process => ({
            name: process.name,
            pid: process.pid,
            status: process.pm2_env?.status || "unknown",
            restarts: process.pm2_env?.restart_time || 0,
            uptime: process.pm2_env?.pm_uptime || null,
            cpu: process.monit?.cpu ?? null,
            memory: process.monit?.memory ?? null
        }));
    }

}

module.exports = PlatformClient;
