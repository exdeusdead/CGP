const permissions = require("../permissions/permission.service");
const fs = require("fs");
const path = require("path");

const USERS_DIR = path.join(
  process.env.HOME,
  "CGP",
  "platform",
  "data",
  "identity",
  "users"
);

fs.mkdirSync(USERS_DIR, { recursive: true });

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
    path.join(USERS_DIR, `${user.id}.json`),
    JSON.stringify(user, null, 2)
  );

  return user;
}


function getUser(id) {
  const file = path.join(USERS_DIR, `${id}.json`);

  if (!fs.existsSync(file)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(file));
}


function listUsers() {
  return fs.readdirSync(USERS_DIR)
    .filter(x => x.endsWith(".json"))
    .map(x => getUser(x.replace(".json","")));
}


module.exports = {
  createUser,
  getUser,
  listUsers
};


function findByDiscord(username) {
  return listUsers().find(user =>
    user.identities &&
    user.identities.discord &&
    user.identities.discord.username === username
  ) || null;
}

module.exports.findByDiscord = findByDiscord;


function resolveUser(user) {
  if (!user) {
    return null;
  }

  return {
    ...user,

    resolvedPermissions:
      permissions.expandRolePermissions(user.roles || [])
  };
}

module.exports.resolveUser = resolveUser;
