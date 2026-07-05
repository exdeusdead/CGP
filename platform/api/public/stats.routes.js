const express = require("express");
const statsService = require("../../services/statistics/stats.service");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json(statsService.health());
});

router.get("/players", (req, res) => {
  const limit = req.query.limit || 25;
  res.json({
    count: Number(limit) || 25,
    players: statsService.listPlayers(limit)
  });
});

router.get("/player/:id", (req, res) => {
  const player = statsService.getPlayerById(req.params.id);

  if (!player) {
    return res.status(404).json({
      error: "PLAYER_NOT_FOUND",
      message: "No statistics profile was found for this player id."
    });
  }

  res.json(player);
});

router.get("/player-id/:playerId", (req, res) => {
  const limit = req.query.limit || 25;

  res.json({
    playerId: req.params.playerId,
    profiles: statsService.findByPlayer(req.params.playerId, limit)
  });
});

router.get("/provider/:provider/:providerPlayerId", (req, res) => {
  const limit = req.query.limit || 25;

  res.json({
    provider: req.params.provider,
    providerPlayerId: req.params.providerPlayerId,
    profiles: statsService.findByProvider(
      req.params.provider,
      req.params.providerPlayerId,
      limit
    )
  });
});

module.exports = router;
