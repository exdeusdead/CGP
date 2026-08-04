const express = require("express");

module.exports = function(platform) {

    const router = express.Router();

    router.get("/runtime", (req, res) => {
        const runtime = platform.getService("runtimeMonitor");
        res.json(runtime.getRuntimeInfo());
    });

    return router;

};
