const authService = require("../../services/auth/auth.service");
const identityService = require("../../services/identity/identity.service");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.replace("Bearer ", "");

  const session = authService.verifyToken(token);

  if (!session) {
    return res.status(401).json({
      error: "UNAUTHORIZED"
    });
  }

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
    user
  };

  next();
}

function requirePermission(permission) {
  return function(req, res, next) {
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
