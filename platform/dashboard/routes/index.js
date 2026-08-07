const express = require("express");
const path = require("path");
const PlatformClient = require("../services/platformClient");

const router = express.Router();
const platform = new PlatformClient();

router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/index.html"));
});

const proxy = (method) => async (req, res) => {
    try {
        const data = await platform[method]();
        res.json(data);
    } catch (error) {
        res.status(503).json({
            ok: false,
            error: error.message
        });
    }
};

router.get("/api/summary", proxy("getSummary"));
router.get("/api/runtime", proxy("getRuntime"));
router.get("/api/memory", proxy("getMemory"));
router.get("/api/status", proxy("getStatus"));
router.get("/api/health", proxy("getHealth"));
router.get("/api/engines", proxy("getEngines"));
router.get("/api/services", proxy("getServices"));

router.get("/api/processes", async (req, res) => {
    try {
        const processes = await platform.getProcesses();

        res.json({
            ok: true,
            count: processes.length,
            processes
        });
    } catch (error) {
        res.status(503).json({
            ok: false,
            error: error.message
        });
    }
});

router.get("/api/dashboard-health", (req, res) => {
    res.json({
        ok: true,
        service: "CGP Operations Dashboard",
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
