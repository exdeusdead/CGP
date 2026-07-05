const { createProvider } = require("../../providers");
const { createPlayerStatsProfile } = require("../../shared/models/statistics/playerStatsProfile");

class CollectorService {
  constructor(options = {}) {
    this.options = options;
  }

  async collectPlayerSnapshot(input = {}) {
    const providerName = input.provider || "r6tracker";
    const providerPlayerId = input.providerPlayerId;

    if (!providerPlayerId) {
      throw new Error("providerPlayerId is required.");
    }

    const provider = createProvider(providerName, input.providerOptions || {});

    const overview = await provider.fetchOverview(providerPlayerId, input.raw?.overview || "");
    const operators = await provider.fetchOperators(providerPlayerId, input.raw?.operators || "");
    const maps = await provider.fetchMaps(providerPlayerId, input.raw?.maps || "");
    const matches = await provider.fetchMatches(providerPlayerId, input.raw?.matches || "");
    const seasons = await provider.fetchSeasons(providerPlayerId, input.raw?.seasons || "");

    const profile = createPlayerStatsProfile({
      playerId: input.playerId || null,
      identityId: input.identityId || null,
      provider: provider.getName(),
      providerPlayerId,
      overview: overview.overview,
      operators: operators.operators,
      maps: maps.maps,
      matches: matches.matches,
      seasons: seasons.seasons,
      syncedAt: new Date().toISOString()
    });

    return {
      provider: provider.getName(),
      providerPlayerId,
      profile
    };
  }
}

module.exports = {
  CollectorService
};
