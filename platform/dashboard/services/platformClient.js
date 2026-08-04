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

}

module.exports = PlatformClient;
