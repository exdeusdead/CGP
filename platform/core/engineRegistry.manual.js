const path = require("path");

const appRoot = path.join(process.env.HOME, "CGP", "apps", "RainbowSixCubaBot");
const platformRoot = path.join(process.env.HOME, "CGP", "platform");

const storageEngine = require(path.join(appRoot, "services/storageEngine/engine"));
const loggerEngine = require(path.join(appRoot, "services/loggerEngine/engine"));
const configEngine = require(path.join(appRoot, "services/configEngine/engine"));
const runtimeEngine = require(path.join(appRoot, "services/runtimeEngine/engine"));
const dashboardEngine = require(path.join(appRoot, "services/dashboardEngine/engine"));
const renderEngine = require(path.join(appRoot, "services/renderEngine/engine"));
const assetEngine = require(path.join(appRoot, "services/assetEngine/engine"));
const taskEngine = require(path.join(appRoot, "services/taskEngine/engine"));
const backupEngine = require(path.join(appRoot, "services/backupEngine/engine"));
const distributionEngine = require(path.join(appRoot, "services/distributionEngine/engine"));
const identityEngine = require(path.join(appRoot, "services/identityEngine/engine"));
const statisticsEngine = require(path.join(platformRoot, "engines/statistics/engine"));
const mediaOS = require(path.join(appRoot, "services/mediaOS/engine"));
const competitionEngine = require(path.join(appRoot, "services/competitionEngine/engine"));
const websiteEngine = require(path.join(appRoot, "services/websiteEngine/engine"));
const schedulerEngine = require(path.join(appRoot, "services/schedulerEngine/engine"));
const auditEngine = require(path.join(platformRoot, "engines/audit/engine"))();

const engines = [
  storageEngine,
  loggerEngine,
  configEngine,
  runtimeEngine,
  dashboardEngine,
  renderEngine,
  assetEngine,
  taskEngine,
  backupEngine,
  distributionEngine,
  identityEngine,
  statisticsEngine,
  mediaOS,
  competitionEngine,
  websiteEngine,
  schedulerEngine,
  auditEngine
];

module.exports = engines;
