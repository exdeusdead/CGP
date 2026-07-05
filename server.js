const express = require("express");
const cors = require("cors");

const statsRoutes = require("./platform/api/public/stats.routes");
const productsRoutes = require("./platform/api/public/products.routes");
const opsRoutes = require("./platform/api/public/ops.routes");
const identityRoutes = require("./platform/api/public/identity.routes");
const authRoutes = require("./platform/api/public/auth.routes");
const membershipRoutes = require("./platform/api/public/membership.routes");
const accountsRoutes = require("./platform/api/public/accounts.routes");
const companionRoutes = require("./platform/api/public/companion.routes");

const app = express();
const PORT = process.env.PORT || 3030;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    service: "CGP API",
    status: "online",
    version: "0.1.0-alpha"
  });
});

app.use("/api/stats", statsRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/ops", opsRoutes);
app.use("/api/identity", identityRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/companion", companionRoutes);

app.listen(PORT, () => {
  console.log(`CGP API running on port ${PORT}`);
});
