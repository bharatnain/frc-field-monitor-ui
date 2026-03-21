# FIRST Field Monitor

This project is a Vite + React field monitor UI for live FMS/SignalR station data, recording, and replay playback.

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
