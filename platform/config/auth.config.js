function getAuthConfig() {
  return {
    discord: {
      enabled: true,
      clientId: process.env.DISCORD_CLIENT_ID || null,
      clientSecret: process.env.DISCORD_CLIENT_SECRET || null,
      redirectUri:
        process.env.DISCORD_REDIRECT_URI ||
        "https://api.rainbowsixcuba.com/cgp/api/auth/discord/callback",
      scopes: ["identify"]
    }
  };
}

module.exports = {
  getAuthConfig
};
