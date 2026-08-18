const permissions = require("../permissions/permission.service");
const fs = require("fs");
const path = require("path");

/*
 * Legacy CGP identity storage.
 *
 * Resolve storage relative to the CGP platform instead of
 * process.env.HOME so the service works consistently on
 * Windows and Linux.
 */
const USERS_DIR = path.resolve(
  __dirname,
  "..",
  "..",
  "data",
  "identity",
  "users"
);

fs.mkdirSync(USERS_DIR, {
  recursive: true
});

function createUser(data = {}) {
  if (!data.id) {
    throw new Error("CGP user id required");
  }

  const user = {
    id: data.id,

    identities: {
      discord: data.discord || null,
      ubisoft: data.ubisoft || null
    },

    products: data.products || [],

    roles: data.roles || [],

    permissions: data.permissions || [],

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(
      USERS_DIR,
      `${user.id}.json`
    ),
    JSON.stringify(
      user,
      null,
      2
    ),
    "utf8"
  );

  return user;
}

function getUser(id) {
  if (!id) {
    return null;
  }

  const file = path.join(
    USERS_DIR,
    `${id}.json`
  );

  if (!fs.existsSync(file)) {
    return null;
  }

  return JSON.parse(
    fs.readFileSync(
      file,
      "utf8"
    )
  );
}

function listUsers() {
  return fs
    .readdirSync(USERS_DIR)
    .filter((name) =>
      name.endsWith(".json")
    )
    .map((name) =>
      getUser(
        name.replace(/\.json$/, "")
      )
    )
    .filter(Boolean);
}

function findByDiscord(username) {
  return (
    listUsers().find(
      (user) =>
        user.identities &&
        user.identities.discord &&
        user.identities.discord.username === username
    ) || null
  );
}

function resolveUser(user) {
  if (!user) {
    return null;
  }

  return {
    ...user,

    resolvedPermissions:
      permissions.expandRolePermissions(
        user.roles || []
      )
  };
}

module.exports = {
  createUser,
  getUser,
  listUsers,
  findByDiscord,
  resolveUser,
  USERS_DIR
};