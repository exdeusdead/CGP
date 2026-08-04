const express = require("express");

module.exports = function(platform) {

    const router = express.Router();

    router.get("/services", (req, res) => {
        res.json(platform.getServiceNames());
    });

    return router;

};
