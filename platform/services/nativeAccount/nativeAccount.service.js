const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/*
 * Native CGP account storage.
 *
 * This path is resolved relative to the CGP platform itself,
 * so it works independently of the operating system and does
 * not depend on /home/adrian/CGP or process.env.HOME.
 */
const ACCOUNTS_DIR = path.resolve(
  __dirname,
  "..",
  "..",
  "data",
  "accounts"
);

fs.mkdirSync(ACCOUNTS_DIR, {
  recursive: true
});

const USERNAME_PATTERN =
  /^[a-zA-Z0-9._-]{3,32}$/;

const PASSWORD_MIN_LENGTH = 8;

function normalizeUsername(username) {
  return String(username || "")
    .trim()
    .toLowerCase();
}

function validateUsername(username) {
  const normalized =
    normalizeUsername(username);

  if (!normalized) {
    throw new Error(
      "CGP username is required"
    );
  }

  if (
    !USERNAME_PATTERN.test(normalized)
  ) {
    throw new Error(
      "CGP username must contain 3-32 characters using letters, numbers, '.', '_' or '-'."
    );
  }

  return normalized;
}

function validatePassword(password) {
  if (typeof password !== "string") {
    throw new Error(
      "CGP password is required"
    );
  }

  if (
    password.length <
    PASSWORD_MIN_LENGTH
  ) {
    throw new Error(
      `CGP password must contain at least ${PASSWORD_MIN_LENGTH} characters.`
    );
  }

  return password;
}

function accountFile(accountId) {
  return path.join(
    ACCOUNTS_DIR,
    `${accountId}.json`
  );
}

function listAccountRecords() {
  return fs
    .readdirSync(ACCOUNTS_DIR)
    .filter((name) =>
      name.endsWith(".json")
    )
    .map((name) => {
      const file = path.join(
        ACCOUNTS_DIR,
        name
      );

      try {
        return JSON.parse(
          fs.readFileSync(
            file,
            "utf8"
          )
        );
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function getAccount(accountId) {
  if (!accountId) {
    return null;
  }

  const file =
    accountFile(accountId);

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

function findByUsername(username) {
  const normalized =
    normalizeUsername(username);

  if (!normalized) {
    return null;
  }

  return (
    listAccountRecords().find(
      (account) =>
        account.username ===
        normalized
    ) || null
  );
}

function hashPassword(password) {
  const validated =
    validatePassword(password);

  const salt =
    crypto
      .randomBytes(16)
      .toString("hex");

  const hash =
    crypto
      .scryptSync(
        validated,
        salt,
        64
      )
      .toString("hex");

  return {
    algorithm: "scrypt",
    salt,
    hash
  };
}

function verifyPassword(
  password,
  credentials
) {
  if (
    !credentials ||
    credentials.algorithm !==
      "scrypt" ||
    !credentials.salt ||
    !credentials.hash
  ) {
    return false;
  }

  let candidate;

  try {
    candidate =
      crypto.scryptSync(
        String(password || ""),
        credentials.salt,
        64
      );
  } catch {
    return false;
  }

  const stored =
    Buffer.from(
      credentials.hash,
      "hex"
    );

  if (
    stored.length !==
    candidate.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    stored,
    candidate
  );
}

function createAccount(data = {}) {
  const username =
    validateUsername(
      data.username
    );

  validatePassword(
    data.password
  );

  if (
    findByUsername(username)
  ) {
    const error =
      new Error(
        "CGP username already exists"
      );

    error.code =
      "USERNAME_EXISTS";

    throw error;
  }

  const now =
    new Date().toISOString();

  const account = {
    accountId:
      `acc-${crypto.randomUUID()}`,

    username,

    credentials:
      hashPassword(
        data.password
      ),

    status: "active",

    profileId: null,

    createdAt: now,
    updatedAt: now
  };

  fs.writeFileSync(
    accountFile(
      account.accountId
    ),
    JSON.stringify(
      account,
      null,
      2
    ),
    "utf8"
  );

  return account;
}

function verifyCredentials(
  username,
  password
) {
  const account =
    findByUsername(
      username
    );

  if (!account) {
    return null;
  }

  if (
    account.status !==
    "active"
  ) {
    return null;
  }

  if (
    !verifyPassword(
      password,
      account.credentials
    )
  ) {
    return null;
  }

  return account;
}

function sanitizeAccount(account) {
  if (!account) {
    return null;
  }

  const {
    credentials,
    ...safeAccount
  } = account;

  return safeAccount;
}

function listAccounts() {
  return listAccountRecords()
    .map(sanitizeAccount);
}

module.exports = {
  createAccount,
  getAccount,
  findByUsername,
  verifyCredentials,
  sanitizeAccount,
  listAccounts,

  normalizeUsername,

  ACCOUNTS_DIR
};