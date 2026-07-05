const fs = require("fs");
const path = require("path");

class StatisticsEngine {
  constructor(options = {}) {
    this.rootDir = options.rootDir || path.join(process.env.HOME, "CGP", "platform", "data", "statistics");
    this.profilesDir = path.join(this.rootDir, "profiles");
    this.indexesDir = path.join(this.rootDir, "indexes");

    fs.mkdirSync(this.profilesDir, { recursive: true });
    fs.mkdirSync(this.indexesDir, { recursive: true });
  }

  saveProfile(profile = {}) {
    if (!profile.id) {
      throw new Error("profile.id is required.");
    }

    const now = new Date().toISOString();
    const updated = {
      ...profile,
      updatedAt: now
    };

    fs.writeFileSync(
      path.join(this.profilesDir, `${profile.id}.json`),
      JSON.stringify(updated, null, 2)
    );

    this._upsertIndex("all", updated);

    if (profile.playerId) {
      this._upsertIndex(`player-${profile.playerId}`, updated);
    }

    if (profile.provider && profile.providerPlayerId) {
      this._upsertIndex(
        `provider-${profile.provider}-${profile.providerPlayerId}`,
        updated
      );
    }

    return updated;
  }

  getProfile(id) {
    const file = path.join(this.profilesDir, `${id}.json`);
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, "utf8"));
  }

  listProfiles(limit = 25) {
    return this._loadIndex("all").slice(0, limit);
  }

  findByPlayer(playerId, limit = 25) {
    return this._loadIndex(`player-${playerId}`).slice(0, limit);
  }

  findByProvider(provider, providerPlayerId, limit = 25) {
    return this._loadIndex(`provider-${provider}-${providerPlayerId}`).slice(0, limit);
  }

  _loadIndex(name) {
    const file = path.join(this.indexesDir, `${name}.json`);
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, "utf8"));
  }

  _upsertIndex(name, item, limit = 1000) {
    const list = this._loadIndex(name);
    const next = [item, ...list.filter(x => x.id !== item.id)].slice(0, limit);

    fs.writeFileSync(
      path.join(this.indexesDir, `${name}.json`),
      JSON.stringify(next, null, 2)
    );
  }

  getStatus() {
    return {
      name: "Statistics Engine",
      version: "0.1.0-alpha",
      profiles: this.listProfiles(1000).length
    };
  }
}

module.exports = {
  StatisticsEngine
};
