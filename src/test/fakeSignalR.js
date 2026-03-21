import { vi } from 'vitest';

export function createFakeHubConnection(url) {
  const handlers = new Map();
  const reconnectedHandlers = [];
  const closeHandlers = [];

  return {
    url,
    on: vi.fn((eventName, handler) => {
      handlers.set(eventName, handler);
    }),
    onreconnected: vi.fn((handler) => {
      reconnectedHandlers.push(handler);
    }),
    onclose: vi.fn((handler) => {
      closeHandlers.push(handler);
    }),
    start: vi.fn(() => Promise.resolve()),
    stop: vi.fn(() => Promise.resolve()),
    emit(eventName, payload) {
      const handler = handlers.get(eventName);
      if (handler) {
        handler(payload);
      }
    },
    emitReconnected(connectionId = 'reconnected') {
      reconnectedHandlers.forEach((handler) => handler(connectionId));
    },
    emitClose(error) {
      closeHandlers.forEach((handler) => handler(error));
    },
  };
}

export function createFakeHubFactory() {
  const hubs = [];

  return {
    hubs,
    factory(url) {
      const hub = createFakeHubConnection(url);
      hubs.push(hub);
      return hub;
    },
    getHubByName(name) {
      return hubs.find((hub) => hub.url.endsWith(`/${name}`));
    },
  };
}
