const manifest = require("../../../manifest.json");
const { listProducts } = require("../../products/productRegistry");
const { createStatisticsEngine } = require("../../engines/statistics");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);
const statsEngine = createStatisticsEngine();

const ALLOWED_PROCESSES = Object.freeze([
  "RainbowSixCubaBot",
  "RainbowSixCubaStats",
  "CGP-API"
]);

const operationHistory = [];
const MAX_HISTORY = 100;

function recordOperation(entry) {
  const record = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...entry
  };

  operationHistory.unshift(record);

  if (operationHistory.length > MAX_HISTORY) {
    operationHistory.length = MAX_HISTORY;
  }

  return record;
}

function assertAllowedProcess(name) {
  if (!ALLOWED_PROCESSES.includes(name)) {
    const error = new Error(`Process is not controllable: ${name}`);
    error.code = "PROCESS_NOT_ALLOWED";
    throw error;
  }
}

async function getProcesses() {
  const { stdout } = await execFileAsync("pm2", ["jlist"], {
    maxBuffer: 1024 * 1024
  });

  const processes = JSON.parse(stdout);

  return processes.map(process => ({
    name: process.name,
    pid: process.pid,
    status: process.pm2_env?.status || "unknown",
    restarts: process.pm2_env?.restart_time || 0,
    uptime: process.pm2_env?.pm_uptime || null,
    cpu: process.monit?.cpu ?? null,
    memory: process.monit?.memory ?? null,
    controllable: ALLOWED_PROCESSES.includes(process.name)
  }));
}

async function getProcess(name) {
  const processes = await getProcesses();
  return processes.find(process => process.name === name) || null;
}

async function restartProcess(name, meta = {}) {
  assertAllowedProcess(name);

  const before = await getProcess(name);

  if (!before) {
    const error = new Error(`PM2 process not found: ${name}`);
    error.code = "PROCESS_NOT_FOUND";
    throw error;
  }

  const operation = recordOperation({
    action: "restart",
    process: name,
    status: "running",
    actor: meta.actor || null,
    before: {
      pid: before.pid,
      status: before.status,
      restarts: before.restarts
    }
  });

  try {
    await execFileAsync("pm2", ["restart", name], {
      maxBuffer: 1024 * 1024
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    const after = await getProcess(name);

    operation.status = after?.status === "online"
      ? "completed"
      : "warning";

    operation.completedAt = new Date().toISOString();

    operation.after = after
      ? {
          pid: after.pid,
          status: after.status,
          restarts: after.restarts
        }
      : null;

    return operation;
  } catch (error) {
    operation.status = "failed";
    operation.completedAt = new Date().toISOString();
    operation.error = error.message;
    throw error;
  }
}

function getOperationHistory(limit = 20) {
  const safeLimit = Math.max(
    1,
    Math.min(Number(limit) || 20, MAX_HISTORY)
  );

  return operationHistory.slice(0, safeLimit);
}

function getCapabilities() {
  return {
    processes: [...ALLOWED_PROCESSES],
    actions: ["restart"],
    selfControl: false
  };
}

function getStatus() {
  return {
    platform: {
      name: manifest.platform,
      version: manifest.version,
      status: manifest.status,
      milestone: manifest.currentMilestone
    },

    runtime: {
      environment: process.env.NODE_ENV || "production",
      uptimeSeconds: Math.floor(process.uptime()),
      startedAt: new Date(Date.now() - process.uptime() * 1000)
    },

    products: listProducts(),

    statistics: statsEngine.getStatus(),

    operations: {
      capabilities: getCapabilities(),
      historySize: operationHistory.length
    }
  };
}

module.exports = {
  getStatus,
  getProcesses,
  getProcess,
  restartProcess,
  getOperationHistory,
  getCapabilities
};
