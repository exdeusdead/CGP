const express = require("express");

module.exports = function(platform) {

    const router = express.Router();

    router.get("/engines", (req, res) => {
        const runtime = platform.getService("runtimeMonitor");
        res.json(runtime.getSnapshot().engines);
    });

    return router;

};
