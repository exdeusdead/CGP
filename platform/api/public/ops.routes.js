const express = require("express");
const opsService = require("../../services/operations/ops.service");
const { requireAuth, requirePermission } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/status", requireAuth, requirePermission("ops:read"), (req, res) => {
  res.json(opsService.getStatus());
});

module.exports = router;
