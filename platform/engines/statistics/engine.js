const Engine = require("../../core/engine");
const { createStatisticsEngine } = require("./index");
const { createCollector } = require("../../services/collector");

class StatisticsEngineAdapter extends Engine {
  constructor() {
    super("Statistics Engine", "0.1.0-alpha");
  }

  dependencies() {
    return ["logger", "config"];
  }

  async initialize(context = {}) {
    this.statistics = createStatisticsEngine();
    this.collector = createCollector();

    context.platform.registerService("statistics", this.statistics);
    context.platform.registerService("collector", this.collector);

    this.status = "initialized";
    console.log("Statistics Engine Loaded");
    return true;
  }

  getStatus() {
    return {
      name: this.name,
      version: this.version,
      status: this.status,
      statistics: this.statistics?.getStatus?.() || null,
      collector: "registered"
    };
  }
}

module.exports = new StatisticsEngineAdapter();
