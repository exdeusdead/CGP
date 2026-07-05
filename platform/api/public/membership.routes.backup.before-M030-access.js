const express = require("express");
const membershipService = require("../../services/membership/membership.service");
const { requireAuth, requirePermission } = require("../middleware/auth.middleware");

const router = express.Router();

router.get(
  "/users/:userId",
  requireAuth,
  requirePermission("identity:read"),
  (req, res) => {
    res.json({
      userId: req.params.userId,
      memberships: membershipService.listUserMemberships(req.params.userId)
    });
  }
);

router.get(
  "/products/:productId",
  requireAuth,
  requirePermission("products:read"),
  (req, res) => {
    res.json({
      productId: req.params.productId,
      members: membershipService.listProductMembers(req.params.productId)
    });
  }
);

module.exports = router;
