const fs = require("fs");
const path = require("path");
const providerRegistry = require("../providers/providerRegistry.service");

/*
 * External account linking storage.
 *
 * Discord, Ubisoft and future providers are linked to CGP
 * identities here. Storage is resolved relative to CGP so
 * it works consistently on Windows and Linux.
 */
const LINKED_ACCOUNTS_DIR = path.resolve(
  __dirname,
  "..",
  "..",
  "data",
  "identity",
  "linkedAccounts"
);

fs.mkdirSync(
  LINKED_ACCOUNTS_DIR,
  { recursive: true }
);

function userDir(userId) {
  return path.join(
    LINKED_ACCOUNTS_DIR,
    userId
  );
}

function accountFile(userId, providerId) {
  return path.join(
    userDir(userId),
    `${providerId}.json`
  );
}

function linkAccount(
  userId,
  providerId,
  accountData = {}
) {
  if (!userId) {
    throw new Error("userId is required");
  }

  if (!providerId) {
    throw new Error("providerId is required");
  }

  if (!providerRegistry.providerExists(providerId)) {
    throw new Error(
      `Unknown provider: ${providerId}`
    );
  }

  fs.mkdirSync(
    userDir(userId),
    { recursive: true }
  );

  const existing = getLinkedAccount(
    userId,
    providerId
  );

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
    accountFile(
      userId,
      providerId
    ),
    JSON.stringify(
      linkedAccount,
      null,
      2
    ),
    "utf8"
  );

  return linkedAccount;
}

function getLinkedAccount(userId, providerId) {
  const file = accountFile(
    userId,
    providerId
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

function listLinkedAccounts(userId) {
  const dir = userDir(userId);

  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) =>
      file.endsWith(".json")
    )
    .map((file) =>
      JSON.parse(
        fs.readFileSync(
          path.join(dir, file),
          "utf8"
        )
      )
    );
}

function findLinkedAccount(
  providerId,
  providerAccountId
) {
  if (!providerId) {
    return null;
  }

  if (!providerAccountId) {
    return null;
  }

  if (!fs.existsSync(LINKED_ACCOUNTS_DIR)) {
    return null;
  }

  const userIds =
    fs.readdirSync(
      LINKED_ACCOUNTS_DIR
    );

  for (const userId of userIds) {
    const account =
      getLinkedAccount(
        userId,
        providerId
      );

    if (
      account &&
      String(account.providerAccountId) ===
        String(providerAccountId)
    ) {
      return account;
    }
  }

  return null;
}

module.exports = {
  linkAccount,
  getLinkedAccount,
  listLinkedAccounts,
  findLinkedAccount,
  LINKED_ACCOUNTS_DIR
};