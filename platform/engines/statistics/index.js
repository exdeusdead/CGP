const { StatisticsEngine } = require("./statisticsEngine");

function createStatisticsEngine(options = {}) {
  return new StatisticsEngine(options);
}

module.exports = {
  StatisticsEngine,
  createStatisticsEngine
};
