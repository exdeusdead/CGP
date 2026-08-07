const express = require("express");

module.exports = function(platform) {

    const router = express.Router();

    router.get("/status", (req, res) => {

        const runtime = platform.getService("runtimeMonitor");

        if (!runtime) {
            return res.status(500).json({
                error: "runtimeMonitor not registered",
                services: platform.services?.list?.() || []
            });
        }

        return res.json(runtime.getSnapshot());

    });

    return router;

};
