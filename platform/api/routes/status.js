const express = require("express");

module.exports = function(platform) {

    const router = express.Router();

    router.get("/status", (req, res) => {
        const runtime = platform.getService("runtimeMonitor");
        res.json(runtime.getSnapshot());
    });

    return router;

};
