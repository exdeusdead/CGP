function createPlayerStatsProfile(input = {}) {
  const now = new Date().toISOString();

  return {
    id: input.id || `stats-profile-${Date.now()}`,
    playerId: input.playerId || null,
    identityId: input.identityId || null,

    game: input.game || "rainbow-six-siege",
    provider: input.provider || null,
    providerPlayerId: input.providerPlayerId || null,

    overview: input.overview || {},
    rank: input.rank || {},
    operators: input.operators || [],
    maps: input.maps || [],
    matches: input.matches || [],
    seasons: input.seasons || [],

    syncedAt: input.syncedAt || null,
    createdAt: now,
    updatedAt: now
  };
}

module.exports = {
  createPlayerStatsProfile
};
