const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const TOKENS_DIR = path.join(
  process.env.HOME,
  "CGP",
  "platform",
  "data",
  "auth",
  "tokens"
);

fs.mkdirSync(TOKENS_DIR, { recursive: true });

function createToken(userId, scope = []) {
  if (!userId) {
    throw new Error("userId is required");
  }

  const token = crypto.randomBytes(32).toString("hex");

  const record = {
    token,
    userId,
    scope,
    createdAt: new Date().toISOString(),
    revoked: false
  };

  fs.writeFileSync(
    path.join(TOKENS_DIR, `${token}.json`),
    JSON.stringify(record, null, 2)
  );

  return record;
}

function getToken(token) {
  if (!token) return null;

  const file = path.join(TOKENS_DIR, `${token}.json`);

  if (!fs.existsSync(file)) return null;

  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function verifyToken(token) {
  const record = getToken(token);

  if (!record || record.revoked) return null;

  return record;
}

module.exports = {
  createToken,
  getToken,
  verifyToken
};
