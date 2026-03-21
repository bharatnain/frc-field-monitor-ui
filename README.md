# FIRST Field Monitor

This project is a Vite + React field monitor UI for live FMS/SignalR station data, recording, and replay playback.

## Running

### Direct Mode

Point the browser straight at the field server:

```sh
VITE_FIELD_MONITOR_BASE_URL=http://10.0.100.5 npm run dev
```

You can also set `VITE_FIELD_MONITOR_BASE_URL=http://10.0.100.5` in `.env` before building.

### Proxy Mode

Use the internal Node proxy when the field server rejects browser requests because of CORS:

1. Build the frontend with a browser-facing base URL that points at the internal server, for example `http://localhost:3000`.
2. Start the internal server with `FIELD_MONITOR_UPSTREAM_URL` set to the real field server, for example `http://10.0.100.5`.

Example:

```sh
VITE_FIELD_MONITOR_BASE_URL=http://localhost:3000 npm run build
FIELD_MONITOR_UPSTREAM_URL=http://10.0.100.5 PORT=3000 npm start
```

The proxy server serves the built app from `dist` and forwards these live endpoints to the upstream field server:

- `/api/v1.0/fieldMonitor/*`
- `/fieldMonitorHub`
- `/infrastructureHub`

If `VITE_FIELD_MONITOR_BASE_URL` is not set, the client falls back to same-origin URLs. That makes proxy mode work naturally when the app is served by the internal server.

## Testing

Run the automated test suite with:

```sh
npm test
```

Run Vitest in watch mode with:

```sh
npm run test:watch
```

## What The Suite Covers

- Pure live-data helpers in `src/lib/fieldMonitorLive.js`
- Integration behavior for `useFieldMonitorLiveData`
- UI wiring for `src/pages/FieldMonitor.jsx` and `src/pages/config.tsx`
- Route-level smoke coverage for `src/main.jsx`

## Test Strategy

- `fetch` is mocked so tests do not depend on a live field server.
- SignalR hubs are replaced with fake in-memory connections from `src/test/fakeSignalR.js`.
- Replay timing uses fake timers to make playback deterministic.
- Page tests mock `useFieldMonitorLiveData` when they only need to verify UI behavior.
