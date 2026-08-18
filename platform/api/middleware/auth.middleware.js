const authService = require("../../services/auth/auth.service");
const identityService = require("../../services/identity/identity.service");
const accountProvisioning = require("../../services/accountProvisioning/accountProvisioning.service");

function getBearerToken(req) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return null;
  }

  return header.slice(7).trim();
}

function requireAuth(req, res, next) {
  const token = getBearerToken(req);
  const session = authService.verifyToken(token);

  if (!session) {
    return res.status(401).json({
      error: "UNAUTHORIZED"
    });
  }

  // Native CGP account session
  if (session.accountId) {
    const identity = accountProvisioning.getCGPIdentity(
      session.accountId
    );

    if (!identity || !identity.account) {
      return res.status(401).json({
        error: "ACCOUNT_NOT_FOUND"
      });
    }

    req.cgp = {
      session,
      account: identity.account,
      profile: identity.profile,

      // Compatibility alias while legacy identity consumers remain.
      user: {
        id: identity.account.accountId,
        accountId: identity.account.accountId,
        username: identity.account.username,
        profileId: identity.account.profileId,
        roles: [],
        permissions: [],
        resolvedPermissions: []
      }
    };

    return next();
  }

  // Existing legacy CGP identity session
  if (session.userId) {
    const user = identityService.resolveUser(
      identityService.getUser(session.userId)
    );

    if (!user) {
      return res.status(401).json({
        error: "USER_NOT_FOUND"
      });
    }

    req.cgp = {
      session,
      user,
      account: null,
      profile: null
    };

    return next();
  }

  return res.status(401).json({
    error: "INVALID_SESSION_IDENTITY"
  });
}

function requirePermission(permission) {
  return function (req, res, next) {
    if (!req.cgp || !req.cgp.user) {
      return res.status(401).json({
        error: "UNAUTHORIZED"
      });
    }

    const permissions = [
      ...(req.cgp.user.permissions || []),
      ...(req.cgp.user.resolvedPermissions || [])
    ];

    const namespace = permission.split(":")[0];

    const allowed =
      permissions.includes("*") ||
      permissions.includes(permission) ||
      permissions.includes(`${namespace}:*`);

    if (!allowed) {
      return res.status(403).json({
        error: "FORBIDDEN",
        requiredPermission: permission
      });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requirePermission
};