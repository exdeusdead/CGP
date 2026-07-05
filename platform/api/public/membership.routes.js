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



router.get(
  "/access/:productId",
  requireAuth,
  (req, res) => {

    const productId = req.params.productId;
    const userId = req.cgp.user.id;

    res.json({
      userId,
      productId,

      access:
        membershipService.canAccessProduct(
          userId,
          productId
        ),

      roles:
        membershipService.getUserProductRoles(
          userId,
          productId
        ),

      permissions:
        membershipService.getUserProductPermissions(
          userId,
          productId
        )
    });
  }
);


module.exports = router;
