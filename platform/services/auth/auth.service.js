const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const TOKENS_DIR = path.resolve(
  __dirname,
  "..",
  "..",
  "data",
  "auth",
  "tokens"
);

fs.mkdirSync(TOKENS_DIR, { recursive: true });

function tokenFile(token) {
  return path.join(TOKENS_DIR, `${token}.json`);
}

function writeToken(record) {
  fs.writeFileSync(
    tokenFile(record.token),
    JSON.stringify(record, null, 2),
    "utf8"
  );

  return record;
}

function createToken(userId, scope = []) {
  if (!userId) {
    throw new Error("userId is required");
  }

  return writeToken({
    token: crypto.randomBytes(32).toString("hex"),
    type: "legacy",
    userId,
    accountId: null,
    scope: Array.isArray(scope) ? scope : [],
    createdAt: new Date().toISOString(),
    revoked: false
  });
}

function createAccountToken(accountId, scope = ["user"]) {
  if (!accountId) {
    throw new Error("accountId is required");
  }

  return writeToken({
    token: crypto.randomBytes(32).toString("hex"),
    type: "account",
    userId: null,
    accountId,
    scope: Array.isArray(scope) ? scope : ["user"],
    createdAt: new Date().toISOString(),
    revoked: false
  });
}

function getToken(token) {
  if (!token) return null;

  const file = tokenFile(token);

  if (!fs.existsSync(file)) return null;

  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function verifyToken(token) {
  const record = getToken(token);

  if (!record || record.revoked) return null;

  return record;
}

function revokeToken(token) {
  const record = getToken(token);

  if (!record) return false;

  writeToken({
    ...record,
    revoked: true,
    revokedAt: new Date().toISOString()
  });

  return true;
}

module.exports = {
  createToken,
  createAccountToken,
  getToken,
  verifyToken,
  revokeToken,
  TOKENS_DIR
};
