# Diagnostics Screen Spec

## Purpose

`/diagnostics` is a close-up FTA troubleshooting screen that reuses the live field monitor shell while exposing richer per-station diagnostics.

This screen is for diagnosis, not far-distance triage and not post-match analytics.

## Route

- Route: `/diagnostics`
- Layout behavior:
  - same top header style as the main field monitor
  - same red/blue alliance split
  - same 3 rows per alliance
  - same `mirror=true` behavior
  - diagnostics top bar is simplified to short text-only stats: match number, match state, schedule, and cycle
  - each alliance column keeps a simple alliance shell with naturally sized team cards
  - each team card uses a dominant identity header and a single-column body with stacked diagnostic groups

## Mental Model

Each row should help the FTA answer these questions in order:

1. Who is this team and where are they?
2. What is the robot supposed to be doing?
3. Can the control path function?
4. Is the network healthy enough to trust?
5. Is the robot electrically healthy?
6. What evidence explains the current state?

The diagnostics screen does not use the same strong hierarchy as the distance-first monitor. Grouping carries meaning more than visual dominance.

That said, the card still needs one clear anchor:

- Team number is the first visual read.
- Station is the secondary identity cue.
- The rest of the diagnostics live inside a clearly separated team card.
- The screen should never feel like one flattened metrics board.
- The default read should be top-to-bottom, not left-to-right across competing mini tiles.

## Information Groups

### Identity and Assignment

- team number
- station
- blocking/action message when present

### Robot State

- robot mode/status
- enabled/disabled
- auto/teleop
- stop/bypass state

### Connection and Control Path

- DS
- Radio
- RIO
- supporting flags:
  - `connection`
  - `dsLinkActive`
  - `linkActive`
  - `radioLink`
  - `rioLink`
  - `radioConnectedToAp`

### Network Quality

- radio quality/bars
- total bandwidth
- `Tx`
- `Rx`
- trip
- loss
- `Signal`
- `Noise`
- `SNR`
- `Inactivity`
- `RxPackets`
- `RxMCSBandwidth`
- `RxVHT`
- `RxVHTNSS`

### Robot Health

- current battery
- minimum battery
- battery action state
- brownout
- brownout latch

### Evidence

- `monitorStatus`
- `stationStatus`
- `moveToStation`
- `MACAddress`
- `isEnabled`
- `isAuto`
- `isBypassed`
- `isEStopped`
- `isAStopped`

## Default-Visible Metrics

These are always visible on the card:

- `team`
- `station`
- `status.shortLabel`
- `ds.state`
- `radio.state`
- `radio.bars`
- `rio.state`
- `battery.value`
- `battery.min`
- `battery.action`
- `bwu.value`
- `bwu.tx`
- `bwu.rx`
- `trip`
- `pkts`
- `signal`
- `noise`
- `snr`
- `inactivity`
- `rxPackets`
- `rxMCSBandwidth`
- `rxVHT`
- `rxVHTNSS`
- `macAddress`

These supporting diagnostics are also always visible, but in a smaller treatment:

- `connection`
- `dsLinkActive`
- `linkActive`
- `radioLink`
- `rioLink`
- `radioConnectedToAp`
- `radioConnectionQuality`
- `brownout`
- `brownoutLatched`
- `monitorStatus`
- `stationStatus`
- `moveToStation`
- `isEnabled`
- `isAuto`
- `isBypassed`
- `isEStopped`
- `isAStopped`

## Raw-Only Metrics

Do not make unmapped raw payload values first-class in v1.

The newly defined RF/link fields (`Signal`, `Noise`, `SNR`, `Inactivity`, `MACAddress`, `RxMCSBandwidth`, `RxVHT`, `RxVHTNSS`, `RxPackets`) are now mapped into diagnostics.

Reserve this section only for future unknown payload keys that still lack confirmed semantics.

## Blocking and Stop Behavior

Blocking and stop states should stay highly visible, but the technical modules should remain readable on `/diagnostics`.

Rules:

- `TEAM MISMATCH` and `MOVE TO ...` remain takeover messages.
- `E-STOP`, `A-STOP`, and `BYPASS` remain explicit badges/states.
- supporting technical diagnostics should remain visible even when an action state is present.

## Visual Language

- each team must have its own clearly bounded card
- team number is the card anchor and strongest text element
- keep labels explicit for technical signals
- do not rely on color alone
- `Tx` and `Rx` must always be labeled
- the card should feel organized before it feels dense
- the card body should read as one vertical troubleshooting flow
- internal grouping should not overpower the outer team-card structure

## Card Structure

Recommended card order:

1. Identity header
- large team number
- station badge
- primary status badge
- issue badge / blocking message when present

2. Identity / robot state
- status
- enabled / disabled
- auto / teleop
- stop / bypass state

3. Connection path
- DS
- radio
- RIO
- supporting control flags

4. Network
- radio quality
- bandwidth
- `Tx`
- `Rx`
- trip
- loss

5. Health
- battery
- minimum battery
- battery action state
- brownout / latch

6. Evidence
- monitor / station / move-to labels
- enabled / auto / bypass / stop evidence flags

## Data Mapping

Primary source: `src/lib/fieldMonitorLive.js`

Diagnostics v1 uses:

- normalized station data from `normalizeStation()`
- derived states from:
  - `getDsSignal()`
  - `getRadioSignal()`
  - `getRioSignal()`
  - `getBatteryInfo()`
  - `getStatusInfo()`
  - `getRowMode()`
- diagnostics panel mapping from `buildDiagnosticsPanels()`

## Non-Goals For V1

- trend graphs
- long-history analysis
- raw packet inspector for opaque fields
- replacing the default field monitor

## Future Additions

Possible v2 additions:

- small recent-history graphs for selected metrics
- raw-field inspector for confirmed extra SignalR payload fields
- diagnostics showcase page/state gallery
