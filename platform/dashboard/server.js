const express = require("express");
const path = require("path");

const app = express();

const PORT = Number(process.env.CGP_DASHBOARD_PORT || 3300);
const HOST = process.env.CGP_DASHBOARD_HOST || "127.0.0.1";

app.disable("x-powered-by");

app.use(express.json({
    limit: "64kb"
}));

app.use(express.urlencoded({
    extended: false,
    limit: "64kb"
}));

app.use(express.static(path.join(__dirname, "public")));

app.use("/", require("./routes"));

app.use((req, res) => {
    res.status(404).json({
        ok: false,
        error: "Dashboard route not found"
    });
});

app.use((error, req, res, next) => {
    console.error("[CGP-Dashboard]", error);

    if (res.headersSent)
        return next(error);

    res.status(500).json({
        ok: false,
        error: "Internal dashboard error"
    });
});

const server = app.listen(PORT, HOST, () => {
    console.log(`CGP Dashboard listening on ${HOST}:${PORT}`);
});

server.on("error", error => {
    console.error("[CGP-Dashboard] Server error:", error);
    process.exitCode = 1;
});

function shutdown(signal) {
    console.log(`[CGP-Dashboard] ${signal} received`);

    server.close(() => {
        console.log("[CGP-Dashboard] HTTP server stopped");
        process.exit(0);
    });

    setTimeout(() => {
        console.error("[CGP-Dashboard] Forced shutdown");
        process.exit(1);
    }, 5000).unref();
}

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));

module.exports = {
    app,
    server
};
