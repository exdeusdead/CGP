const express = require("express");

module.exports = function(platform) {

    const router = express.Router();

    router.get("/memory", (req, res) => {
        const runtime = platform.getService("runtimeMonitor");
        res.json(runtime.getMemoryInfo());
    });

    return router;

};
