const nativeAccount = require(
  "../nativeAccount/nativeAccount.service"
);

const gamingProfile = require(
  "../gamingProfile/gamingProfile.service"
);

/**
 * Creates the complete native CGP identity.
 *
 * One provisioning operation creates:
 *
 * CGP Account
 *      ↓
 * Gaming Profile
 *      ↓
 * Internal CGP Address
 *
 * External identities such as Discord and Ubisoft are NOT
 * required and are linked separately after account creation.
 */
function createCGPAccount(data = {}) {
  let account = null;

  try {
    account = nativeAccount.createAccount({
      username: data.username,
      password: data.password
    });

    const profile = gamingProfile.createProfile({
      accountId: account.accountId,
      username: account.username,
      displayName:
        data.displayName ||
        account.username
    });

    const linkedAccount = {
      ...account,
      profileId: profile.profileId,
      updatedAt: new Date().toISOString()
    };

    saveAccount(linkedAccount);

    return {
      account:
        nativeAccount.sanitizeAccount(
          linkedAccount
        ),

      profile
    };
  } catch (error) {
    /*
     * Account and profile currently use filesystem persistence.
     * If provisioning fails after account creation, remove the
     * incomplete account so we do not leave orphan identities.
     */
    if (
      account &&
      account.accountId
    ) {
      removeIncompleteAccount(
        account.accountId
      );
    }

    throw error;
  }
}

function authenticateCGPAccount(
  username,
  password
) {
  const account =
    nativeAccount.verifyCredentials(
      username,
      password
    );

  if (!account) {
    return null;
  }

  const profile =
    account.profileId
      ? gamingProfile.getProfile(
          account.profileId
        )
      : gamingProfile.findByAccountId(
          account.accountId
        );

  return {
    account:
      nativeAccount.sanitizeAccount(
        account
      ),

    profile
  };
}

function getCGPIdentity(accountId) {
  const account =
    nativeAccount.getAccount(
      accountId
    );

  if (!account) {
    return null;
  }

  const profile =
    account.profileId
      ? gamingProfile.getProfile(
          account.profileId
        )
      : gamingProfile.findByAccountId(
          account.accountId
        );

  return {
    account:
      nativeAccount.sanitizeAccount(
        account
      ),

    profile
  };
}

function saveAccount(account) {
  const fs = require("fs");
  const path = require("path");

  const file = path.join(
    nativeAccount.ACCOUNTS_DIR,
    `${account.accountId}.json`
  );

  fs.writeFileSync(
    file,
    JSON.stringify(
      account,
      null,
      2
    ),
    "utf8"
  );
}

function removeIncompleteAccount(
  accountId
) {
  const fs = require("fs");
  const path = require("path");

  const file = path.join(
    nativeAccount.ACCOUNTS_DIR,
    `${accountId}.json`
  );

  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
  }
}

module.exports = {
  createCGPAccount,
  authenticateCGPAccount,
  getCGPIdentity
};