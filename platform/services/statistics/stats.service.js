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
  return statisticsEngine.listProfiles(Number(limit) || 25);
}

function getPlayerById(id) {
  if (!id) return null;
  return statisticsEngine.getProfile(id);
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
