class ServiceRegistry {
  constructor() {
    this.services = new Map();
  }

  register(name, service) {
    this.services.set(name, service);
    return service;
  }

  get(name) {
    return this.services.get(name);
  }

  has(name) {
    return this.services.has(name);
  }

  list() {
    return Array.from(this.services.keys());
  }
}

module.exports = ServiceRegistry;
