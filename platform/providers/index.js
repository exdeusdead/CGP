const R6TrackerProvider = require("./r6tracker/provider");

function createProvider(name, options = {}) {
  switch (name) {
    case "r6tracker":
      return new R6TrackerProvider(options);
    default:
      throw new Error(`Unknown provider: ${name}`);
  }
}

module.exports = {
  createProvider,
  R6TrackerProvider
};
