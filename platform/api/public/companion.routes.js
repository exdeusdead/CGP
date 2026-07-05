const express = require("express");
const companionService = require("../../services/companion/companion.service");
const membershipService = require("../../services/membership/membership.service");
const accountLinking = require("../../services/accountLinking/accountLinking.service");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/config", (req, res) => {
  res.json(companionService.getConfig());
});

router.get("/me", requireAuth, (req, res) => {
  res.json({
    user: req.cgp.user,
    session: req.cgp.session,
    memberships: membershipService.listUserMemberships(req.cgp.user.id),
    accounts: accountLinking.listLinkedAccounts(req.cgp.user.id),
    companion: companionService.getConfig()
  });
});

router.get("/products/:productId", requireAuth, (req, res) => {
  const product = companionService.getProductConfig(req.params.productId);

  if (!product) {
    return res.status(404).json({
      error: "PRODUCT_NOT_FOUND"
    });
  }

  res.json({
    userId: req.cgp.user.id,
    product
  });
});

module.exports = router;
