const fs = require("fs");
const path = require("path");
const providerRegistry = require("../providers/providerRegistry.service");

const LINKED_ACCOUNTS_DIR = path.join(
  process.env.HOME,
  "CGP",
  "platform",
  "data",
  "identity",
  "linkedAccounts"
);

fs.mkdirSync(LINKED_ACCOUNTS_DIR, { recursive: true });

function userDir(userId) {
  return path.join(LINKED_ACCOUNTS_DIR, userId);
}

function accountFile(userId, providerId) {
  return path.join(userDir(userId), `${providerId}.json`);
}

function linkAccount(userId, providerId, accountData = {}) {
  if (!userId) throw new Error("userId is required");
  if (!providerId) throw new Error("providerId is required");

  if (!providerRegistry.providerExists(providerId)) {
    throw new Error(`Unknown provider: ${providerId}`);
  }

  fs.mkdirSync(userDir(userId), { recursive: true });

  const existing = getLinkedAccount(userId, providerId);

  const linkedAccount = {
    userId,
    providerId,
    providerAccountId:
      accountData.providerAccountId ||
      existing?.providerAccountId ||
      null,
    username:
      accountData.username ||
      existing?.username ||
      null,
    displayName:
      accountData.displayName ||
      existing?.displayName ||
      null,
    status:
      accountData.status ||
      existing?.status ||
      "linked",
    metadata:
      accountData.metadata ||
      existing?.metadata ||
      {},
    linkedAt:
      existing?.linkedAt ||
      new Date().toISOString(),
    updatedAt:
      new Date().toISOString()
  };

  fs.writeFileSync(
    accountFile(userId, providerId),
    JSON.stringify(linkedAccount, null, 2)
  );

  return linkedAccount;
}

function getLinkedAccount(userId, providerId) {
  const file = accountFile(userId, providerId);

  if (!fs.existsSync(file)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function listLinkedAccounts(userId) {
  const dir = userDir(userId);

  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs.readdirSync(dir)
    .filter(file => file.endsWith(".json"))
    .map(file => JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")));
}

module.exports = {
  linkAccount,
  getLinkedAccount,
  listLinkedAccounts
};
