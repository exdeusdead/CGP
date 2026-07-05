const providers = [
  {
    id: "discord",
    name: "Discord",
    type: "social",
    status: "active"
  },

  {
    id: "ubisoft",
    name: "Ubisoft Connect",
    type: "game-account",
    status: "active"
  }
];


function listProviders() {
  return providers;
}


function getProvider(id) {
  return providers.find(
    provider => provider.id === id
  ) || null;
}


function providerExists(id) {
  return !!getProvider(id);
}


module.exports = {
  listProviders,
  getProvider,
  providerExists
};
