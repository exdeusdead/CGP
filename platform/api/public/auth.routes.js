const crypto = require("crypto");
const express = require("express");
const authService = require("../../services/auth/auth.service");
const identityService = require("../../services/identity/identity.service");
const membershipService = require("../../services/membership/membership.service");
const accountLinking = require("../../services/accountLinking/accountLinking.service");
const accountProvisioning = require("../../services/accountProvisioning/accountProvisioning.service");
const { requireAuth } = require("../middleware/auth.middleware");
const { getAuthConfig } = require("../../config/auth.config");

const router = express.Router();

/*
 * Native CGP registration.
 *
 * Creates:
 * CGP Account -> Gaming Profile -> CGP Address -> Session
 */
router.post("/register", (req, res) => {
  try {
    const { username, password, displayName } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        error: "MISSING_CREDENTIALS",
        message: "Username and password are required."
      });
    }

    const identity = accountProvisioning.createCGPAccount({
      username,
      password,
      displayName
    });

    const session = authService.createAccountToken(
      identity.account.accountId,
      ["user"]
    );

    return res.status(201).json({
      type: "cgp",
      account: identity.account,
      profile: identity.profile,
      token: session.token,
      session
    });
  } catch (error) {
    const knownConflict =
      error.code === "ACCOUNT_EXISTS" ||
      error.code === "USERNAME_EXISTS" ||
      error.code === "PROFILE_EXISTS";

    return res.status(knownConflict ? 409 : 400).json({
      error: error.code || "ACCOUNT_CREATION_FAILED",
      message: error.message
    });
  }
});

/*
 * Native CGP login.
 */
router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        error: "MISSING_CREDENTIALS",
        message: "Username and password are required."
      });
    }

    const identity = accountProvisioning.authenticateCGPAccount(
      username,
      password
    );

    if (!identity) {
      return res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Invalid CGP username or password."
      });
    }

    const session = authService.createAccountToken(
      identity.account.accountId,
      ["user"]
    );

    return res.json({
      type: "cgp",
      account: identity.account,
      profile: identity.profile,
      token: session.token,
      session
    });
  } catch (error) {
    return res.status(500).json({
      error: "LOGIN_FAILED",
      message: error.message
    });
  }
});

/*
 * Existing legacy token creation.
 */
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

/*
 * Unified current-session endpoint.
 */
router.get("/me", requireAuth, (req, res) => {
  if (req.cgp.account) {
    return res.json({
      type: "cgp",
      account: req.cgp.account,
      profile: req.cgp.profile,
      session: req.cgp.session
    });
  }

  return res.json({
    type: "legacy",
    user: req.cgp.user,
    session: req.cgp.session,
    memberships: membershipService.listUserMemberships(req.cgp.user.id),
    accounts: accountLinking.listLinkedAccounts(req.cgp.user.id)
  });
});

router.post("/logout", requireAuth, (req, res) => {
  const revoked = authService.revokeToken(req.cgp.session.token);

  return res.json({
    success: revoked
  });
});

/*
 * Discord remains an optional external identity provider.
 */
router.get("/discord/login", (req, res) => {
  const config = getAuthConfig().discord;

  if (!config.enabled || !config.clientId) {
    return res.status(503).json({
      error: "DISCORD_AUTH_NOT_CONFIGURED"
    });
  }

  const state = Buffer.from(JSON.stringify({
    returnUrl: req.query.returnUrl || null
  })).toString("base64url");

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scopes.join(" "),
    state
  });

  const url = `https://discord.com/oauth2/authorize?${params.toString()}`;

  if (req.query.mode === "json") {
    return res.json({
      provider: "discord",
      url
    });
  }

  return res.redirect(url);
});

router.get("/discord/callback", async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).json({
        error: "MISSING_DISCORD_CODE"
      });
    }

    const config = getAuthConfig().discord;

    if (!config.enabled || !config.clientId || !config.clientSecret) {
      return res.status(503).json({
        error: "DISCORD_AUTH_NOT_CONFIGURED"
      });
    }

    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: config.redirectUri
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.status(401).json({
        error: "DISCORD_TOKEN_EXCHANGE_FAILED",
        details: tokenData
      });
    }

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    const discordUser = await userResponse.json();

    if (!userResponse.ok) {
      return res.status(401).json({
        error: "DISCORD_USER_FETCH_FAILED",
        details: discordUser
      });
    }

    let linked = accountLinking.findLinkedAccount(
      "discord",
      discordUser.id
    );

    let user;

    if (linked) {
      user = identityService.getUser(linked.userId);
    }

    if (!user) {
      const userId =
        "user-" +
        (discordUser.username || crypto.randomUUID())
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-");

      user = identityService.createUser({
        id: userId,
        discord: {
          id: discordUser.id,
          username: discordUser.username
        }
      });

      accountLinking.linkAccount(user.id, "discord", {
        providerAccountId: discordUser.id,
        username: discordUser.username,
        displayName: discordUser.global_name
      });
    }

    const session = authService.createToken(
      user.id,
      ["user"]
    );

    let returnUrl = null;

    if (req.query.state) {
      try {
        const state = JSON.parse(
          Buffer.from(String(req.query.state), "base64url").toString("utf8")
        );

        returnUrl = state.returnUrl || null;
      } catch (error) {
        returnUrl = null;
      }
    }

    if (returnUrl) {
      const redirectUrl = new URL(returnUrl);

      const allowedReturn =
        redirectUrl.origin === "https://rainbowsixcuba.com" ||
        redirectUrl.origin === "http://localhost:5173" ||
        redirectUrl.hostname.endsWith(".chromiumapp.org");

      if (!allowedReturn) {
        return res.status(400).json({
          error: "INVALID_RETURN_URL"
        });
      }

      redirectUrl.searchParams.set("token", session.token);
      redirectUrl.searchParams.set("userId", user.id);

      return res.redirect(redirectUrl.toString());
    }

    res.json({
      provider: "discord",
      user,
      token: session.token
    });
  } catch (error) {
    res.status(500).json({
      error: "DISCORD_CALLBACK_ERROR",
      message: error.message
    });
  }
});

module.exports = router;
