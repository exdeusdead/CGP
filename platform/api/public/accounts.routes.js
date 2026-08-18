const express = require("express");

const accountLinking = require(
  "../../services/accountLinking/accountLinking.service"
);

const providerRegistry = require(
  "../../services/providers/providerRegistry.service"
);

const {
  requireAuth,
  requirePermission
} = require("../middleware/auth.middleware");

const router = express.Router();


/*
 * Resolve the identity key used by the account-linking layer.
 *
 * Native CGP sessions use accountId.
 * Legacy CGP sessions continue using user.id.
 *
 * auth.middleware currently exposes accountId as user.id for
 * native sessions as a compatibility alias, but resolving the
 * native account explicitly here makes the ownership model clear.
 */
function getIdentityId(req) {
  if (
    req.cgp &&
    req.cgp.account &&
    req.cgp.account.accountId
  ) {
    return req.cgp.account.accountId;
  }

  if (
    req.cgp &&
    req.cgp.user &&
    req.cgp.user.id
  ) {
    return req.cgp.user.id;
  }

  return null;
}


/*
 * Build the complete provider state for an identity.
 *
 * This intentionally returns providers even when they have not
 * yet been linked. The Desktop application can therefore render
 * Discord, Ubisoft Connect and future providers without having
 * to hard-code the provider registry in the client.
 */
function buildProviderState(identityId) {
  const providers =
    providerRegistry.listProviders();

  const linkedAccounts =
    accountLinking.listLinkedAccounts(
      identityId
    );

  return providers.map((provider) => {
    const linkedAccount =
      linkedAccounts.find(
        (account) =>
          account.providerId ===
          provider.id
      ) || null;

    return {
      id: provider.id,
      name: provider.name,
      type: provider.type,
      status: provider.status,

      connected: Boolean(
        linkedAccount
      ),

      account: linkedAccount
        ? {
            providerAccountId:
              linkedAccount.providerAccountId ||
              null,

            username:
              linkedAccount.username ||
              null,

            displayName:
              linkedAccount.displayName ||
              null,

            status:
              linkedAccount.status ||
              "linked",

            metadata:
              linkedAccount.metadata ||
              {},

            linkedAt:
              linkedAccount.linkedAt ||
              null,

            updatedAt:
              linkedAccount.updatedAt ||
              null
          }
        : null
    };
  });
}


/*
 * GET /api/accounts/me
 *
 * Returns the authenticated identity's linked-account state.
 *
 * Native CGP account:
 *   identityType = "account"
 *   identityId   = accountId
 *
 * Legacy identity:
 *   identityType = "user"
 *   identityId   = user.id
 */
router.get(
  "/me",
  requireAuth,
  (req, res) => {
    const identityId =
      getIdentityId(req);

    if (!identityId) {
      return res.status(401).json({
        error:
          "INVALID_SESSION_IDENTITY"
      });
    }

    const accounts =
      accountLinking.listLinkedAccounts(
        identityId
      );

    const providers =
      buildProviderState(
        identityId
      );

    res.json({
      identityType:
        req.cgp.account
          ? "account"
          : "user",

      identityId,

      accountId:
        req.cgp.account
          ? req.cgp.account.accountId
          : null,

      userId:
        req.cgp.account
          ? null
          : req.cgp.user.id,

      accounts,

      providers,

      summary: {
        available:
          providers.length,

        connected:
          providers.filter(
            (provider) =>
              provider.connected
          ).length
      }
    });
  }
);


/*
 * GET /api/accounts/providers
 *
 * Returns the platform provider registry.
 *
 * Authentication is required because this endpoint is intended
 * for authenticated CGP profile/account-management interfaces.
 */
router.get(
  "/providers",
  requireAuth,
  (req, res) => {
    const identityId =
      getIdentityId(req);

    if (!identityId) {
      return res.status(401).json({
        error:
          "INVALID_SESSION_IDENTITY"
      });
    }

    const providers =
      buildProviderState(
        identityId
      );

    res.json({
      identityId,
      providers,

      summary: {
        available:
          providers.length,

        connected:
          providers.filter(
            (provider) =>
              provider.connected
          ).length
      }
    });
  }
);


/*
 * Legacy administrative identity lookup.
 *
 * This route remains intact for services that still operate on
 * the original CGP user identity layer.
 */
router.get(
  "/users/:userId",
  requireAuth,
  requirePermission(
    "identity:read"
  ),
  (req, res) => {
    const userId =
      req.params.userId;

    res.json({
      userId,

      accounts:
        accountLinking.listLinkedAccounts(
          userId
        )
    });
  }
);


module.exports = router;