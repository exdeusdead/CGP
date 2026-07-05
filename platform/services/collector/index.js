const { CollectorService } = require("./collectorService");

function createCollector(options = {}) {
  return new CollectorService(options);
}

module.exports = {
  CollectorService,
  createCollector
};
