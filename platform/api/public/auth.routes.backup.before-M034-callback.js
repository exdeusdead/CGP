const express = require("express");
const authService = require("../../services/auth/auth.service");
const identityService = require("../../services/identity/identity.service");
const membershipService = require("../../services/membership/membership.service");
const accountLinking = require("../../services/accountLinking/accountLinking.service");
const { requireAuth } = require("../middleware/auth.middleware");
const { getAuthConfig } = require("../../config/auth.config");

const router = express.Router();

router.post("/token", (req, res) => {
  const { userId, scope } = req.body || {};

  const user = identityService.getUser(userId);

  if (!user) {
    return res.status(404).json({
      error: "USER_NOT_FOUND",
      message: "Cannot create token for unknown CGP user."
    });
  }

  const token = authService.createToken(userId, scope || []);

  res.json(token);
});

router.get("/verify", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");

  const verified = authService.verifyToken(token);

  if (!verified) {
    return res.status(401).json({
      valid: false,
      error: "INVALID_TOKEN"
    });
  }

  res.json({
    valid: true,
    token: verified
  });
});


router.get("/me", requireAuth, (req, res) => {
  res.json({
    user: req.cgp.user,
    session: req.cgp.session,
    memberships: membershipService.listUserMemberships(req.cgp.user.id),
    accounts: accountLinking.listLinkedAccounts(req.cgp.user.id)
  });
});


router.get("/discord/login", (req, res) => {
  const config = getAuthConfig().discord;

  if (!config.enabled || !config.clientId) {
    return res.status(503).json({
      error: "DISCORD_AUTH_NOT_CONFIGURED"
    });
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scopes.join(" ")
  });

  res.json({
    provider: "discord",
    url: `https://discord.com/oauth2/authorize?${params.toString()}`
  });
});

module.exports = router;
