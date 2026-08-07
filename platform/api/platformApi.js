const express = require("express");

module.exports = function createPlatformApi(platform) {

    const router = express.Router();

    router.use(require("./routes/status")(platform));
    router.use(require("./routes/health")(platform));
    router.use(require("./routes/engines")(platform));
    router.use(require("./routes/services")(platform));
    router.use(require("./routes/summary")(platform));
    router.use(require("./routes/memory")(platform));
    router.use(require("./routes/runtime")(platform));
router.use(require("./routes/products")(platform));

    return router;

};
