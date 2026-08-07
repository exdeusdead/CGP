const express = require("express");
const path = require("path");
const PlatformClient = require("../services/platformClient");
const opsService = require("../../services/operations/ops.service");

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


/*
 * M062 Operations Control Plane
 *
 * This API is intentionally exposed only through the local Operations
 * Dashboard listener. Process control is additionally restricted by the
 * allowlist inside ops.service.
 */

router.get("/api/operations/capabilities", (req, res) => {
    res.json({
        ok: true,
        ...opsService.getCapabilities()
    });
});

router.get("/api/operations/history", (req, res) => {
    const history = opsService.getOperationHistory(req.query.limit);

    res.json({
        ok: true,
        count: history.length,
        history
    });
});

router.post("/api/operations/restart/:name", async (req, res) => {

    const name = req.params.name;

    try {

        const operation = await opsService.restartProcess(name, {
            actor: "CGP Operations Dashboard",
            source: req.ip
        });

        res.json({
            ok: true,
            operation
        });

    } catch (error) {

        if (error.code === "PROCESS_NOT_ALLOWED") {
            return res.status(403).json({
                ok: false,
                error: error.message,
                code: error.code
            });
        }

        if (error.code === "PROCESS_NOT_FOUND") {
            return res.status(404).json({
                ok: false,
                error: error.message,
                code: error.code
            });
        }

        console.error("[Operations Control]", error);

        res.status(500).json({
            ok: false,
            error: "Process operation failed"
        });

    }

});

module.exports = router;
