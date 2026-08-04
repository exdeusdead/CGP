const { createStatisticsEngine } = require("../../engines/statistics");

const statisticsEngine = createStatisticsEngine();

function health() {
  const status = statisticsEngine.getStatus();

  return {
    service: "CGP Public Statistics API",
    status: "online",
    engine: status
  };
}

function listPlayers(limit = 25) {
  return statisticsEngine
    .listProfiles(Number(limit) || 25)
    .map(profile => ({
      id: profile.id,
      playerId: profile.playerId,
      discordId: profile.discordId || null,
      discordTag: profile.discordTag || null,
      ubisoftName: profile.ubisoftName || profile.providerPlayerId || null,
      role: profile.role || null,
      region: profile.region || null,
      rank: profile.overview?.currentRank || null,
      rp: profile.overview?.currentRp ?? null,
      kd: profile.overview?.seasonKd ?? null,
      winRate: profile.overview?.seasonWinRate ?? null,
      matches: profile.overview?.seasonRankedMatches ?? null,
      level: profile.overview?.lifetimeLevel ?? null,
      headshotRate: profile.overview?.headshotRate ?? null,
      syncedAt: profile.syncedAt || profile.updatedAt || null
    }));
}

function getPlayerById(id) {
  if (!id) return null;

  const profile = statisticsEngine.getProfile(id);
  if (!profile) return null;

  return {
    id: profile.id,
    playerId: profile.playerId,
    discordId: profile.discordId || null,
    discordTag: profile.discordTag || null,
    ubisoftName: profile.ubisoftName || profile.providerPlayerId || null,
    role: profile.role || null,
    region: profile.region || null,
    overview: profile.overview || {},
    highlights: profile.highlights || {},
    operators: Array.isArray(profile.operators) ? profile.operators : [],
    maps: Array.isArray(profile.maps) ? profile.maps : [],
    matches: Array.isArray(profile.matches) ? profile.matches : [],
    seasons: Array.isArray(profile.seasons) ? profile.seasons : [],
    syncedAt: profile.syncedAt || profile.updatedAt || null
  };
}

function findByPlayer(playerId, limit = 25) {
  if (!playerId) return [];
  return statisticsEngine.findByPlayer(playerId, Number(limit) || 25);
}

function findByProvider(provider, providerPlayerId, limit = 25) {
  if (!provider || !providerPlayerId) return [];
  return statisticsEngine.findByProvider(provider, providerPlayerId, Number(limit) || 25);
}

module.exports = {
  health,
  listPlayers,
  getPlayerById,
  findByPlayer,
  findByProvider
};
