const ProviderContract = require("../contracts/providerContract");
const { parseOverview } = require("./parsers/overviewParser");
const { parseOperators } = require("./parsers/operatorsParser");
const { parseMaps } = require("./parsers/mapsParser");
const { parseMatches } = require("./parsers/matchesParser");
const { parseSeasons } = require("./parsers/seasonsParser");

class R6TrackerProvider extends ProviderContract {
  constructor(options = {}) {
    super("r6tracker");
    this.options = options;
  }

  async fetchPlayer(providerPlayerId) {
    return {
      provider: this.name,
      providerPlayerId,
      raw: null
    };
  }

  async fetchOverview(providerPlayerId, rawText = "") {
    return {
      provider: this.name,
      providerPlayerId,
      overview: parseOverview(rawText)
    };
  }

  async fetchRank(providerPlayerId) {
    return {
      provider: this.name,
      providerPlayerId,
      rank: {}
    };
  }

  async fetchMatches(providerPlayerId, rawText = "") {
    return {
      provider: this.name,
      providerPlayerId,
      matches: parseMatches(rawText)
    };
  }

  async fetchOperators(providerPlayerId, rawText = "") {
    return {
      provider: this.name,
      providerPlayerId,
      operators: parseOperators(rawText)
    };
  }

  async fetchMaps(providerPlayerId, rawText = "") {
    return {
      provider: this.name,
      providerPlayerId,
      maps: parseMaps(rawText)
    };
  }

  async fetchSeasons(providerPlayerId, rawText = "") {
    return {
      provider: this.name,
      providerPlayerId,
      seasons: parseSeasons(rawText)
    };
  }
}

module.exports = R6TrackerProvider;
