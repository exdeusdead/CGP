const express = require("express");

module.exports = function(platform) {

    const router = express.Router();

    router.get("/summary", (req, res) => {

        const runtime = platform.getService("runtimeMonitor");

        res.json({
            platform: runtime.getSnapshot(),
            engines: runtime.getEngineSummary(),
            services: runtime.getServiceSummary()
        });

    });

    return router;

};
