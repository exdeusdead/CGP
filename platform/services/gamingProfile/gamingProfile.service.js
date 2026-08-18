const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PROFILES_DIR = path.resolve(
  __dirname,
  "..",
  "..",
  "data",
  "gamingProfiles"
);

fs.mkdirSync(PROFILES_DIR, {
  recursive: true
});

function profileFile(profileId) {
  return path.join(
    PROFILES_DIR,
    `${profileId}.json`
  );
}

function normalizeHandle(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");
}

function createCGPAddress(accountId) {
  if (!accountId) {
    throw new Error(
      "accountId is required to create a CGP address"
    );
  }

  const stableId = String(accountId)
    .replace(/^acc-/, "")
    .replace(/-/g, "")
    .toLowerCase();

  return `${stableId}@cgp`;
}

function listProfileRecords() {
  return fs
    .readdirSync(PROFILES_DIR)
    .filter((name) =>
      name.endsWith(".json")
    )
    .map((name) => {
      const file = path.join(
        PROFILES_DIR,
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

function getProfile(profileId) {
  if (!profileId) {
    return null;
  }

  const file = profileFile(profileId);

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

function findByAccountId(accountId) {
  if (!accountId) {
    return null;
  }

  return (
    listProfileRecords().find(
      (profile) =>
        profile.accountId === accountId
    ) || null
  );
}

function findByCGPAddress(address) {
  const normalized =
    String(address || "")
      .trim()
      .toLowerCase();

  if (!normalized) {
    return null;
  }

  return (
    listProfileRecords().find(
      (profile) =>
        profile.cgpAddress === normalized
    ) || null
  );
}

function createProfile(data = {}) {
  if (!data.accountId) {
    throw new Error(
      "accountId is required"
    );
  }

  const existing =
    findByAccountId(
      data.accountId
    );

  if (existing) {
    const error =
      new Error(
        "Gaming Profile already exists for this account"
      );

    error.code =
      "PROFILE_EXISTS";

    throw error;
  }

  const displayName =
    String(
      data.displayName ||
      data.username ||
      "Player"
    ).trim();

  if (!displayName) {
    throw new Error(
      "Gaming Profile display name is required"
    );
  }

  const now =
    new Date().toISOString();

  const profile = {
    profileId:
      `profile-${crypto.randomUUID()}`,

    accountId:
      data.accountId,

    displayName,

    handle:
      normalizeHandle(
        data.username ||
        displayName
      ),

    cgpAddress:
      createCGPAddress(
        data.accountId
      ),

    avatar: null,
    bio: null,
    region: null,

    games: [],
    teams: [],

    competitive: {
      status: "player",
      primaryGame: null
    },

    visibility: {
      profile: "public"
    },

    createdAt: now,
    updatedAt: now
  };

  fs.writeFileSync(
    profileFile(
      profile.profileId
    ),
    JSON.stringify(
      profile,
      null,
      2
    ),
    "utf8"
  );

  return profile;
}

function listProfiles() {
  return listProfileRecords();
}

module.exports = {
  createProfile,
  getProfile,
  findByAccountId,
  findByCGPAddress,
  listProfiles,
  createCGPAddress,
  normalizeHandle,
  PROFILES_DIR
};
