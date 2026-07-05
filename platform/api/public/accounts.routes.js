const express = require("express");
const accountLinking = require("../../services/accountLinking/accountLinking.service");
const { requireAuth, requirePermission } = require("../middleware/auth.middleware");

const router = express.Router();


router.get("/me", requireAuth, (req, res) => {

  res.json({
    userId: req.cgp.user.id,
    accounts:
      accountLinking.listLinkedAccounts(
        req.cgp.user.id
      )
  });

});


router.get(
  "/users/:userId",
  requireAuth,
  requirePermission("identity:read"),
  (req, res) => {

    res.json({
      userId: req.params.userId,
      accounts:
        accountLinking.listLinkedAccounts(
          req.params.userId
        )
    });

  }
);


module.exports = router;
