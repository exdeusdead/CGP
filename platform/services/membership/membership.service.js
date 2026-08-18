const fs = require("fs");
const path = require("path");

/*
 * CGP membership storage.
 *
 * Storage is resolved relative to the platform so the same
 * service works on Windows development and Linux production.
 */
const MEMBERSHIP_ROOT = path.resolve(
  __dirname,
  "..",
  "..",
  "data",
  "membership",
  "products"
);

fs.mkdirSync(MEMBERSHIP_ROOT, { recursive: true });

function productDir(productId) {
  return path.join(MEMBERSHIP_ROOT, productId);
}

function membershipFile(productId, userId) {
  return path.join(
    productDir(productId),
    `${userId}.json`
  );
}

function addMembership(userId, productId, data = {}) {
  if (!userId) {
    throw new Error("userId is required");
  }

  if (!productId) {
    throw new Error("productId is required");
  }

  fs.mkdirSync(
    productDir(productId),
    { recursive: true }
  );

  const existing = getMembership(
    userId,
    productId
  );

  const membership = {
    userId,
    productId,
    status:
      data.status ||
      existing?.status ||
      "active",
    roles:
      data.roles ||
      existing?.roles ||
      [],
    permissions:
      data.permissions ||
      existing?.permissions ||
      [],
    joinedAt:
      existing?.joinedAt ||
      new Date().toISOString(),
    updatedAt:
      new Date().toISOString()
  };

  fs.writeFileSync(
    membershipFile(
      productId,
      userId
    ),
    JSON.stringify(
      membership,
      null,
      2
    ),
    "utf8"
  );

  return membership;
}

function getMembership(userId, productId) {
  const file = membershipFile(
    productId,
    userId
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

function listProductMembers(productId) {
  const dir = productDir(productId);

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

function listUserMemberships(userId) {
  if (!fs.existsSync(MEMBERSHIP_ROOT)) {
    return [];
  }

  return fs
    .readdirSync(MEMBERSHIP_ROOT)
    .flatMap((productId) => {
      const membership =
        getMembership(
          userId,
          productId
        );

      return membership
        ? [membership]
        : [];
    });
}

function canAccessProduct(userId, productId) {
  const membership = getMembership(
    userId,
    productId
  );

  if (!membership) {
    return false;
  }

  return membership.status === "active";
}

function getUserProductRoles(userId, productId) {
  const membership = getMembership(
    userId,
    productId
  );

  if (!membership) {
    return [];
  }

  return membership.roles || [];
}

function getUserProductPermissions(userId, productId) {
  const membership = getMembership(
    userId,
    productId
  );

  if (!membership) {
    return [];
  }

  return membership.permissions || [];
}

module.exports = {
  addMembership,
  getMembership,
  listProductMembers,
  listUserMemberships,
  canAccessProduct,
  getUserProductRoles,
  getUserProductPermissions,
  MEMBERSHIP_ROOT
};