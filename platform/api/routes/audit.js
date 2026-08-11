const express = require("express");

module.exports = function(platform) {
    const router = express.Router();

    router.get("/audit/latest", (req, res) => {
        const audit = platform.getService("audit");

        if (!audit) {
            return res.status(503).json({
                ok: false,
                error: "Audit service unavailable"
            });
        }

        const latest = audit.storage?.loadJson("audit", "latest", null);

        res.json({
            ok: true,
            audit: latest
        });
    });

    router.get("/audit/history", (req, res) => {
        const audit = platform.getService("audit");

        if (!audit) {
            return res.status(503).json({
                ok: false,
                error: "Audit service unavailable"
            });
        }

        const limit = Math.max(
            1,
            Math.min(Number(req.query.limit) || 20, 100)
        );

        const history =
            audit.storage?.loadJson("audit", "history", []) || [];

        res.json({
            ok: true,
            count: Math.min(history.length, limit),
            history: history.slice(0, limit)
        });
    });

    router.post("/audit/run", (req, res) => {
        const audit = platform.getService("audit");

        if (!audit) {
            return res.status(503).json({
                ok: false,
                error: "Audit service unavailable"
            });
        }

        try {
            const report = audit.run();

            res.json({
                ok: true,
                audit: report
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    });

    return router;
};
