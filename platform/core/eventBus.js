class EventBus {
  constructor() {
    this.handlers = new Map();
    this.anyHandlers = [];
    this.eventHistory = [];
    this.maxHistory = 250;
  }

  on(eventName, handler) {
    if (!this.handlers.has(eventName)) this.handlers.set(eventName, []);
    this.handlers.get(eventName).push(handler);
    return () => this.off(eventName, handler);
  }

  onAny(handler) {
    this.anyHandlers.push(handler);
    return () => {
      this.anyHandlers = this.anyHandlers.filter(item => item !== handler);
    };
  }

  once(eventName, handler) {
    const wrapped = async payload => {
      this.off(eventName, wrapped);
      return handler(payload);
    };
    return this.on(eventName, wrapped);
  }

  off(eventName, handler) {
    const list = this.handlers.get(eventName) || [];
    this.handlers.set(eventName, list.filter(item => item !== handler));
  }

  async emit(eventName, payload = {}) {
    const event = {
      name: eventName,
      payload,
      emittedAt: new Date().toISOString()
    };

    this.eventHistory.unshift({
      name: event.name,
      emittedAt: event.emittedAt,
      payloadKeys: Object.keys(payload || {})
    });

    this.eventHistory = this.eventHistory.slice(0, this.maxHistory);

    for (const handler of this.anyHandlers) {
      await handler(event);
    }

    const handlers = this.handlers.get(eventName) || [];
    for (const handler of handlers) {
      await handler(event);
    }

    return event;
  }

  history(limit = 25) {
    return this.eventHistory.slice(0, limit);
  }

  stats() {
    return {
      handlers: Array.from(this.handlers.entries()).map(([name, list]) => ({
        event: name,
        listeners: list.length
      })),
      anyListeners: this.anyHandlers.length,
      historyCount: this.eventHistory.length
    };
  }
}

module.exports = EventBus;
