const express = require("express");
const identityService = require("../../services/identity/identity.service");

const router = express.Router();

router.get("/users", (req, res) => {
  res.json({
    count: identityService.listUsers().length,
    users: identityService.listUsers()
  });
});

router.get("/discord/:username", (req, res) => {
  const user = identityService.findByDiscord(req.params.username);

  if (!user) {
    return res.status(404).json({
      error: "DISCORD_USER_NOT_FOUND",
      message: "No CGP user was found with this Discord username."
    });
  }

  res.json(user);
});

router.get("/users/:id", (req, res) => {
  const user = identityService.getUser(req.params.id);

  if (!user) {
    return res.status(404).json({
      error: "USER_NOT_FOUND",
      message: "No CGP user was found with this id."
    });
  }

  res.json(user);
});

module.exports = router;
