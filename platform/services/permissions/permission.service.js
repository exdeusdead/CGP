const ROLE_PERMISSIONS = {
  founder: [
    "platform:*",
    "products:*",
    "identity:*",
    "stats:*",
    "ops:*",
    "rainbow-six-cuba:*"
  ],

  admin: [
    "products:read",
    "identity:read",
    "stats:read",
    "stats:admin",
    "ops:read",
    "rainbow-six-cuba:admin"
  ],

  staff: [
    "products:read",
    "identity:read",
    "stats:read",
    "rainbow-six-cuba:staff"
  ],

  player: [
    "stats:read",
    "rainbow-six-cuba:player"
  ]
};

function expandRolePermissions(roles = []) {
  return [...new Set(
    roles.flatMap(role => ROLE_PERMISSIONS[role] || [])
  )];
}

function hasPermission(user = {}, permission) {
  const direct = user.permissions || [];
  const roleBased = expandRolePermissions(user.roles || []);
  const all = [...new Set([...direct, ...roleBased])];

  if (all.includes("*")) return true;
  if (all.includes(permission)) return true;

  const namespace = permission.split(":")[0];
  if (all.includes(`${namespace}:*`)) return true;

  return false;
}

module.exports = {
  ROLE_PERMISSIONS,
  expandRolePermissions,
  hasPermission
};
