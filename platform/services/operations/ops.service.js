const manifest = require("../../../manifest.json");
const { listProducts } = require("../../products/productRegistry");
const { createStatisticsEngine } = require("../../engines/statistics");

const statsEngine = createStatisticsEngine();

function getStatus() {
  return {
    platform: {
      name: manifest.platform,
      version: manifest.version,
      status: manifest.status,
      milestone: manifest.currentMilestone
    },

    runtime: {
      environment: process.env.NODE_ENV || "production",
      uptimeSeconds: Math.floor(process.uptime()),
      startedAt: new Date(Date.now() - process.uptime() * 1000)
    },

    products: listProducts(),

    statistics: statsEngine.getStatus()
  };
}

module.exports = {
  getStatus
};
