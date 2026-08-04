const express = require("express");

module.exports = function(platform) {

    const router = express.Router();

    router.get("/health", async (req, res) => {
        const runtime = platform.getService("runtimeMonitor");
        res.json(await runtime.getHealth());
    });

    return router;

};
