const fs = require("fs");
const path = require("path");

const CONFIG_FILE = path.join(
  process.env.HOME,
  "CGP",
  "platform",
  "data",
  "companion",
  "config.json"
);


function defaultConfig() {
  return {
    name: "CGP Companion",

    version: "0.1.0-alpha",

    status: "active",

    products: [
      {
        id: "rainbow-six-cuba",

        enabled: true,

        features: [
          "identity-link",
          "stats-sync",
          "profile-sync"
        ],

        providers: [
          "ubisoft"
        ]
      }
    ]
  };
}


function ensureConfig() {

  if (!fs.existsSync(CONFIG_FILE)) {

    fs.writeFileSync(
      CONFIG_FILE,
      JSON.stringify(defaultConfig(), null, 2)
    );

  }

}


function getConfig() {

  ensureConfig();

  return JSON.parse(
    fs.readFileSync(CONFIG_FILE, "utf8")
  );

}


function getProductConfig(productId) {

  return getConfig()
    .products
    .find(product => product.id === productId)
    || null;

}


module.exports = {
  getConfig,
  getProductConfig
};


function getManifest() {

  const manifestFile = path.join(
    process.env.HOME,
    "CGP",
    "platform",
    "data",
    "companion",
    "manifest.json"
  );

  return JSON.parse(
    fs.readFileSync(manifestFile, "utf8")
  );

}

module.exports.getManifest = getManifest;
