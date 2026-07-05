/**
 * CGP Provider Contract
 *
 * Providers adapt external services into CGP internal models.
 * Providers do not own statistics.
 * Providers do not own players.
 * Providers only fetch and normalize external data.
 */

class ProviderContract {
  constructor(name) {
    if (!name) throw new Error("Provider name is required.");
    this.name = name;
  }

  getName() {
    return this.name;
  }

  async fetchPlayer() {
    throw new Error(`${this.name}.fetchPlayer() not implemented.`);
  }

  async fetchOverview() {
    throw new Error(`${this.name}.fetchOverview() not implemented.`);
  }

  async fetchRank() {
    throw new Error(`${this.name}.fetchRank() not implemented.`);
  }

  async fetchMatches() {
    throw new Error(`${this.name}.fetchMatches() not implemented.`);
  }

  async fetchOperators() {
    throw new Error(`${this.name}.fetchOperators() not implemented.`);
  }

  async fetchMaps() {
    throw new Error(`${this.name}.fetchMaps() not implemented.`);
  }

  async fetchSeasons() {
    throw new Error(`${this.name}.fetchSeasons() not implemented.`);
  }
}

module.exports = ProviderContract;
